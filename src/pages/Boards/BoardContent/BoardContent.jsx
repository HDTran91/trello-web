import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sort'
import { DndContext, PointerSensor, MouseSensor, TouchSensor, useSensor,useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'


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


  const[orderedColumns, setOrderedColumnsState] = useState ([])

  useEffect(() => {
    mapOrder(board?.columns, board?.columnOrderIds, '_id')
    setOrderedColumnsState(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  const handleDragEnd = (event) => {
    console.log('handleDragEnd: ', event)
    const { active, over } = event

    //check if over.id is not exist, return null
    if (!over) return

    //switch position of 2 columns
    if (active.id != over.id) {
      //take index from active
      const oldIndex = orderedColumns.findIndex(c => c._id === active.id)
      //take index from over
      const newIndex = orderedColumns.findIndex(c => c._id === over.id)
      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)
      // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
      // we will use them for API later
      // console.log('dndOrderedColumns:', dndOrderedColumns)
      // console.log('dndOrderedColumnsIds:', dndOrderedColumnsIds)

      //update state after drag and drop
      setOrderedColumnsState(dndOrderedColumns)
    }
  }
  return (
    <DndContext onDragEnd = {handleDragEnd} sensors = {sensors}>
      <Box sx = {{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e': '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight
      }}>
        <ListColumns columns={orderedColumns}/>,
      </Box>
    </DndContext>
  )
}

export default BoardContent