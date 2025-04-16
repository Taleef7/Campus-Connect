/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/components/dashboard/DashboardLayout.jsx
import React from 'react';
import { Box, Typography, Button, AppBar, Toolbar, Container } from '@mui/material'; // Added AppBar, Toolbar, Container
import { Link as RouterLink } from 'react-router-dom'; // Import Link for navigation

const DashboardLayout = ({ title, handleSignOut, children, dashboardPath }) => {

  // --- Add this console log ---
  console.log("DashboardLayout received dashboardPath prop:", dashboardPath);
  // --- End console log ---

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f3f2ef' }}>
      {/* Use AppBar for a more standard header */}
      <AppBar position="static" sx={{ backgroundColor: '#fff', color: 'text.primary', boxShadow: 1 }}>
        <Toolbar>
           {/* Campus Connect Title */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Campus-Connect
          </Typography>

          {/* Dashboard Link (conditionally rendered) */}
          {dashboardPath && ( // This condition relies on dashboardPath being truthy
            <Button component={RouterLink} to={dashboardPath} color="primary" sx={{ mr: 2 }}>
                Dashboard
            </Button>
          )}

          {/* Navigation Links/Buttons */}
          <Button
            component={RouterLink} // Use react-router Link
            to="/directory"       // Link to the directory page
            color="primary"       // Inherit color from AppBar's theme context
            sx={{ mr: 2 }}        // Add some margin to the right
           >
             Directory
           </Button>

          {/* Sign Out Button */}
          {handleSignOut && (
             <Button
              variant="contained"
              onClick={handleSignOut}
              size="small" // Make button slightly smaller
            >
              Sign Out
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content Area - Use Container for consistency */}
      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {/* Content passed from the parent component */}
        {children}
      </Container>
    </Box>
  );
};

export default DashboardLayout;