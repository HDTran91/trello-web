import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { mapOrder } from '~/utils/sort'
import { DndContext, PointerSensor, MouseSensor, TouchSensor, useSensor,useSensors, DragOverlay, defaultDropAnimationSideEffects, closestCenter, closestCorners, pointerWithin, rectIntersection, getFirstCollision } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState, useCallback, useRef } from 'react'
import { cloneDeep, intersection } from 'lodash'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board }) {

  //config sensor
  const pointerSensor = useSensor(PointerSensor,
  //require mouse to move by 10 pixels before activating
    { activationConstraint: { distance: 10 } })
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  ////press and hold for 250ms, and tolerance is 5 in order to activate
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })

  // const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)


  const [orderedColumns, setOrderedColumnsState] = useState ([])

  //at the Time, only one is dragged (column or card)
  const [activeDragItemId, setActiveDragItemId] = useState([null])
  const [activeDragItemType, setActiveDragItemType] = useState([null])
  const [activeDragItemData, setActiveDragItemData] = useState([null])
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState([null])

  //last intersection 
  const lastOverId = useRef(null)
  useEffect(() => {
    mapOrder(board?.columns, board?.columnOrderIds, '_id')
    setOrderedColumnsState(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  //find column based on cardId
  const findColumnByCardId = (cardId) => {
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  // function reupdate state different column
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData

  ) => {
    setOrderedColumnsState(prevColumns => {
      //find index of overcard where active card will drop at
      const overCardIndex = overColumn?.cards?.findIndex(card => card?._id === overCardId)

      //logic to find cardIndex and it was taken from the libraby dndkit
      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
              active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.card?.length + 1

      //clone old orderedColumnState into new one and return
      const nextColumn = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumn.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumn.find(column => column._id === overColumn._id)

      if (nextActiveColumn) {
        // delete card in column active
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
        // update card in cardOrderIds
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }

      if (nextOverColumn) {
        // check whether card is dragging exist in overColumn or not if yet delete first
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)
        // we need to update data ColumnId again after dragging card different column
        const rebuild_activeDraggingCardData = {
          ... activeDraggingCardData,
          columnId: nextOverColumn._id
        }

        // add card dragged to overColumn
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)
        // update card in cardOrderIds
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }

      // console.log('nextColumn: ', nextColumn)

      return nextColumn
    })
  }

  //When start to drag
  const handleDragStart = (event) => {
    // console.log('handleDragStart: ', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    //set value of oldColumn while dragging card
    if(event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  //during dragging
  const handleDragOver = (event) => {
    // do nothing if dragging column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.Column) return
    // console.log('handleDragOver: ', event)
    // do if dragging card
    const {active, over} = event
    //check if over.id or active.id is not exist, return null
    if (!active || !over) return

    const { id: activeDraggingCardId, data: { current: activeDraggingCardData} } = active
    const { id: overCardId } = over

    //find 2 columm base on cardID

    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // console.log('activeColumn: ', activeColumn)
    // console.log('overColumn: ', overColumn)

    //if no column exist,return
    if (!activeColumn || !overColumn) return

    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData)
    }


  }

  //when end of dropping
  const handleDragEnd = (event) => {

    // console.log('handleDragEnd: ', event)
    const { active, over } = event

    //check if over.id is not exist, return null
    if (!active || !over) return

    //handle drag drop column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {

      const { id: activeDraggingCardId, data: { current: activeDraggingCardData} } = active
      const { id: overCardId } = over

      //find 2 columm base on cardID

      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      // console.log('activeColumn: ', activeColumn)
      // console.log('overColumn: ', overColumn)

      //if no column exist,return
      if (!activeColumn || !overColumn) return

      // console.log('oldColumnWhenDraggingCard: ', oldColumnWhenDraggingCard)
      // console.log('overColumn: ', overColumn)
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData)
      }else {
        //hanh dong keo tha cat=rd trong cung mot column'
        //take index from oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        //take index from over
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)
        //dung Array move to drag cards in 1 column just like card in one boardcontent
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard.cards, oldCardIndex, newCardIndex)
        // console.log('dndOrderedCards: ',dndOrderedCards)
        setOrderedColumnsState(prevColumns => {
          //clone old orderedColumnState into new one and return
          const nextColumn = cloneDeep(prevColumns)

          //look for column where we drop
          const targetColumn = nextColumn.find(column => column._id === overColumn._id)
          // console.log(targetColumn)
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map(card => card._id)

          //return new state of value
          return nextColumn
        })
      }
    }

    //handle drag drop column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      console.log('hanh dong keo tha column')
      //switch position of 2 columns
      if (active.id != over.id) {
        //take index from active
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        //take index from over
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
        // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
        // we will use them for API later
        // console.log('dndOrderedColumns:', dndOrderedColumns)
        // console.log('dndOrderedColumnsIds:', dndOrderedColumnsIds)

        //update state after drag and drop
        setOrderedColumnsState(dndOrderedColumns)
      }
    }

    //keep data after dragging null
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  //Animation when we drop 
  const customdropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' }}})}

  // console.log('activeDragItemId: ', activeDragItemId)
  // console.log('activeDragItemType: ', activeDragItemType)
  // console.log('activeDragItemData: ', activeDragItemData)
  //custom collision between 2 columns
  const collisionDetectionStrategy = useCallback((args) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({...args})
    }
    // find the intersecton wiht the mouse
    const pointerIntersections = pointerWithin(args)
    const intersections = pointerIntersections.length > 0
      ? pointerIntersections
      : rectIntersection(args)
    let overId = getFirstCollision(intersections, 'id')
    // console.log('overId: ', overId)
    // console.log('intersections: ', intersections)
    if (overId) {

      const checkColumn = orderedColumns.find(column => column._id === overId)
      if (checkColumn) {
        console.log('overId before: ', overId)
        overId = closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id != overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
        console.log('overId after: ', overId)
      }


      lastOverId.current = overId
      return [{ id: overId }]
    }
    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType])
  return (
    <DndContext
      sensors = {sensors}
      // if use closestCorner => bug flickering + wrong data
      // collisionDetection ={closestCorners}
      collisionDetection ={collisionDetectionStrategy}
      onDragStart = {handleDragStart}
      onDragOver = {handleDragOver}
      onDragEnd = {handleDragEnd}
    >

      <Box sx = {{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e': '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight
      }}>
        <ListColumns columns={orderedColumns}/>
        <DragOverlay dropAnimation = {customdropAnimation}>
          {(!activeDragItemType) && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData} />}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent