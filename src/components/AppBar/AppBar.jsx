import { useState } from 'react'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import Box from '@mui/material/Box'
import AppsIcon from '@mui/icons-material/Apps'
import { ReactComponent as TrelloIcon } from '~/assets/trello.svg'
import SvgIcon from '@mui/material/SvgIcon'
import { InputAdornment, Typography } from '@mui/material'
import WorkSpace from './Menus/WorkSpace'
import Recent from './Menus/Recent'
import Starred from './Menus/Starred'
import Templates from './Menus/Templates'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import NotificationsIcon from '@mui/icons-material/Notifications'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Profiles from './Menus/profiles'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

function AppBar() {
  const [searchValue, setSearchValue] = useState('')
  return (
    <Box sx={{
      width: 1,
      height: (theme) => theme.trello.appBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#2c3e50': '#1565c0')
    }}>
      <Box sx = {{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <AppsIcon sx = {{ color: 'white' }} />
        <Box sx = {{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SvgIcon component = {TrelloIcon} inheritViewBox sx = {{ color: 'white' }}/>
          <Typography variant="span" sx={{ fontSize:'1.2rem', fontWeight:'bold', color: 'white' }} >Trello</Typography>
        </Box>
        <Box sx ={{ display: { xs: 'none', md: 'flex ' }, gap: 1 }}>
          <WorkSpace />
          <Recent />
          <Starred />
          <Templates />
          <Button
            sx ={{
              color: 'white',
              border: 'none',
              '&:hover': { border: 'none' }
            }}
            variant="outlined"
            startIcon={<LibraryBooksIcon />}
          >
              Create
          </Button>
        </Box>
      </Box>
      <Box sx = {{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          id="outlined-search"
          label="Search..."
          type="text"
          size='small'
          value={searchValue}
          onchange= {(e) => setSearchValue(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx ={{color: 'white'}} />
              </InputAdornment>
            ),
            endAdornment: (
              <CloseIcon
                fontSize = "small"
                sx ={{ color: searchValue ? 'white' : 'transparent', cursor: 'pointer' }}
                onClick= {() => setSearchValue('') }
              />
            )
          }}
          sx= {{ 
            minWidth:'120px',
            maxWidth: '180px',
            '& label': { color:'white' },
            '& input': { color:'white' },
            '& label.Mui-focused': { color:'white' },
            '& MuiOutlinedInput-root': {
              '& fieldset': { boderColor: 'White' },
              '&:hover fieldset': { boderColor: 'White' },
              '&:Mui-focused fieldset': { boderColor: 'White' }
            }
          }}
        />
        <ModeSelect />
        <Tooltip title="Notification">
          <Badge color="warning" variant="dot" sx ={{ cursor: 'pointer'}}>
            <NotificationsIcon sx={{ color: 'white' }} />
          </Badge>
        </Tooltip>
        <Tooltip title="Help">
          <Badge color="secondary" variant="dot" sx ={{ cursor: 'pointer'}}>
            <HelpOutlineIcon sx={{ color: 'white' }}/>
          </Badge>
        </Tooltip>
        <Profiles />
      </Box>
    </Box>
  )
}

export default AppBar