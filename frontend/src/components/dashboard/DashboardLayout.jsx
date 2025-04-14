/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/components/dashboard/DashboardLayout.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const DashboardLayout = ({ title, handleSignOut, children }) => {
  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#f3f2ef', // LinkedIn-like background
    }}>

      {/* Header / Top Bar */}
      <Box
        sx={{
          backgroundColor: '#fff',
          boxShadow: 1,
          py: 2,
          px: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Campus-Connect {/* Or potentially make this dynamic? */}
        </Typography>
        {handleSignOut && ( // Conditionally render sign out button
           <Button
            variant="contained"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        )}
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          maxWidth: '1000px',
          margin: '0 auto',
          mt: 5,
          px: 2,
        }}
      >
        {/* Greeting - Moved to specific dashboard */}
        {/* <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
          {/* Optional: Welcome message can be passed as child or prop */}
        {/* </Box> */}

        {/* Content passed from the parent component */}
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;