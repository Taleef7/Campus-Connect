// src/components/dashboard/DashboardLayout.jsx
import {
  Box, CssBaseline, Drawer, AppBar, Toolbar,
  Typography, Button, List, ListItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ExitToApp, Dashboard, Explore, Settings } from '@mui/icons-material';

const drawerWidth = 260;

const DashboardLayout = ({ children, menuItems = [], onMenuSelect, selectedMenu, handleSignOut }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fb' }}>
      <CssBaseline />

      {/* Top Nav */}
      <AppBar elevation={1} position="fixed" sx={{ backgroundColor: '#ffffff', color: '#000', height: 64, justifyContent: 'center' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3b3b3b' }}>
            Campus Connect
          </Typography>
          <Box>
            <Button sx={{ mx: 1, textTransform: 'none', color: '#000' }} onClick={() => navigate('/student-dashboard')} startIcon={<Dashboard />}>Dashboard</Button>
            <Button sx={{ mx: 1, textTransform: 'none', color: '#000' }} onClick={() => navigate('/directory')} startIcon={<Explore />}>Directory</Button>
            <Button sx={{ mx: 1, textTransform: 'none', color: '#000' }} onClick={handleSignOut} startIcon={<ExitToApp />}>Sign Out</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            top: 64,
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        {/* Top Part */}
        <Box>
          <Box sx={{ px: 3, pt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
              Discover
            </Typography>
          </Box>
          <List sx={{ mt: 1 }}>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.label}
                selected={selectedMenu === item.label}
                onClick={() => onMenuSelect(item.label)}
                sx={{
                  mx: 2,
                  my: 1,
                  borderRadius: 2,
                  bgcolor: selectedMenu === item.label ? '#e9f0ff' : 'transparent',
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: selectedMenu === item.label ? '#2b72ff' : '#888' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: selectedMenu === item.label ? 600 : 400,
                    fontSize: 14,
                    color: selectedMenu === item.label ? '#2b72ff' : '#444',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Bottom Settings + Sign Out */}
        <Box sx={{ px: 2, pb: 3 }}>
          <Divider />
          <List>
            <ListItem button>
              <ListItemIcon><Settings /></ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
            <ListItem button onClick={handleSignOut}>
              <ListItemIcon><ExitToApp /></ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 4, pt: 10, pl: 4 }}>
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;