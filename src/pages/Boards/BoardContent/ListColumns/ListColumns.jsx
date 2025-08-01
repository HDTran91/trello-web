import Box from '@mui/material/Box'
import Column from './Column/Column'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'

function ListColumns({ columns }) {

  /** sortableContext require items= [id1,id2,id3], not [id: 'id1', id: 'id2'] */
  return (
    <SortableContext items ={columns?.map(c =>c._id)} strategy ={horizontalListSortingStrategy}>
      <Box sx= {{
        bgcolor: 'inherit',
        width: '100%',
        height: '100%',
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        '&::-webkit-scrollbar-track': { m: 2 }
      }}>
        {/* Box Column1 */}
        {columns?.map( column => (
          <Column key = {column._id} column = {column} />
        ))}

        {/* Box Add new Column */}
        <Box sx = {{
          minWidth: '200px',
          maxWidth: '200px',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#333643': '#ebecf0'),
          mx: 2,
          borderRadius: '6px',
          height: 'fit-content',
          bgColor: 'ffffff3d'
        }}>
          <Button
            startIcon = {<NoteAddIcon />}
            sx= {{
              color: 'white',
              width: '100%',
              justifyContent: 'flex-start',
              pl: 2.5,
              py: 1
            }}>Add new column</Button>
        </Box>
      </Box>
    </SortableContext>
  )
}

export default ListColumns