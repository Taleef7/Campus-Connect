import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDirectory = location.pathname.includes('/directory');

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F1EFEC' }}>
      <AppBar position="static" sx={{ backgroundColor: '#123458' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ color: '#F1EFEC', fontWeight: 'bold' }}>
            Campus-Connect
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(isDirectory ? '/professor-dashboard' : '/directory')}
            sx={{
              backgroundColor: '#D4C9BE',
              color: '#030303',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#030303', color: '#F1EFEC' },
              boxShadow: 'none'
            }}
          >
            {isDirectory ? 'Dashboard' : 'Directory'}
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Box>
  );
};

export default DashboardLayout;
