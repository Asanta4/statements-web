import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Button,
  ListItemButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FolderIcon from '@mui/icons-material/Folder';
import RuleIcon from '@mui/icons-material/Rule';
import CloseIcon from '@mui/icons-material/Close';
import HilikLogo from './HilikLogo';

interface AppMenuProps {
  onNavigate: (step: number) => void;
  currentStep: number;
  activeView?: 'process' | 'files' | 'rules';
  onViewChange?: (view: 'process' | 'files' | 'rules') => void;
}

const AppMenu = ({ 
  activeView = 'process', 
  onViewChange 
}: AppMenuProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuItemClick = (view: 'process' | 'files' | 'rules') => {
    if (onViewChange) {
      onViewChange(view);
    }
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        color="primary" 
        elevation={0}
        sx={{ 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: theme.zIndex.drawer + 1,
          width: '100%',
          left: 0,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <HilikLogo />
          </Box>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                color="inherit" 
                startIcon={<PlayArrowIcon />}
                onClick={() => handleMenuItemClick('process')}
                sx={{ 
                  fontWeight: activeView === 'process' ? 'bold' : 'normal',
                  borderBottom: activeView === 'process' ? '2px solid white' : 'none',
                  borderRadius: 0,
                  paddingBottom: '4px',
                }}
              >
                Process
              </Button>
              <Button 
                color="inherit" 
                startIcon={<FolderIcon />}
                onClick={() => handleMenuItemClick('files')}
                sx={{ 
                  fontWeight: activeView === 'files' ? 'bold' : 'normal',
                  borderBottom: activeView === 'files' ? '2px solid white' : 'none',
                  borderRadius: 0,
                  paddingBottom: '4px',
                }}
              >
                Files
              </Button>
              <Button 
                color="inherit" 
                startIcon={<RuleIcon />}
                onClick={() => handleMenuItemClick('rules')}
                sx={{ 
                  fontWeight: activeView === 'rules' ? 'bold' : 'normal',
                  borderBottom: activeView === 'rules' ? '2px solid white' : 'none',
                  borderRadius: 0,
                  paddingBottom: '4px',
                }}
              >
                Matching Rules
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ width: 280 }} role="presentation">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}>
            <HilikLogo variant="small" />
            <IconButton onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            <ListItemButton
              onClick={() => handleMenuItemClick('process')}
              sx={{ 
                backgroundColor: activeView === 'process' ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                },
              }}
            >
              <ListItemIcon>
                <PlayArrowIcon color={activeView === 'process' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Process" 
                primaryTypographyProps={{
                  fontWeight: activeView === 'process' ? 'bold' : 'normal',
                  color: activeView === 'process' ? 'primary' : 'inherit',
                }}
              />
            </ListItemButton>
            <ListItemButton
              onClick={() => handleMenuItemClick('files')}
              sx={{ 
                backgroundColor: activeView === 'files' ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                },
              }}
            >
              <ListItemIcon>
                <FolderIcon color={activeView === 'files' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Files" 
                primaryTypographyProps={{
                  fontWeight: activeView === 'files' ? 'bold' : 'normal',
                  color: activeView === 'files' ? 'primary' : 'inherit',
                }}
              />
            </ListItemButton>
            <ListItemButton
              onClick={() => handleMenuItemClick('rules')}
              sx={{ 
                backgroundColor: activeView === 'rules' ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                },
              }}
            >
              <ListItemIcon>
                <RuleIcon color={activeView === 'rules' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Matching Rules" 
                primaryTypographyProps={{
                  fontWeight: activeView === 'rules' ? 'bold' : 'normal',
                  color: activeView === 'rules' ? 'primary' : 'inherit',
                }}
              />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default AppMenu; 