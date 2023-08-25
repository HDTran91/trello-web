import ModeSelect from '../../components/ModeSelect'
import Box from '@mui/material/Box'

function AppBar() {
  return (
    <Box sx={{
      backgroundColor: 'primary.light',
      width: 1,
      height: (theme) => theme.trello.appBarHeight,
      display: 'flex',
      alignItems: 'center'
    }}>
      <ModeSelect />
    </Box>
  )
}

export default AppBar