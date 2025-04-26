/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/components/dashboard/DashboardLayout.jsx
import React from 'react';
import { Box, Typography, Button, AppBar, Toolbar } from '@mui/material'; // Removed Container
import { Link as RouterLink, useLocation } from 'react-router-dom';

const DashboardLayout = ({ title, handleSignOut, children, dashboardPath }) => {
    const location = useLocation();
    console.log("Current location:", location.pathname);

    const navLinkHoverSx = {
        borderRadius: 1, // Use theme's border radius potentially theme.shape.borderRadius
        '&:hover': {
            backgroundColor: 'action.hover', // Use theme action color for hover
            // Consider a slightly darker background on hover for white appbar:
            // backgroundColor: 'rgba(0, 0, 0, 0.04)'
        },
    };

    return (
        // Use theme background color. CssBaseline applies this to body.
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar
                position="sticky"
                // Use theme colors: paper background, primary text. Elevation from theme defaults.
                 sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
                 // Or directly use primary color if you want a gold AppBar:
                 // color="primary" // This makes AppBar gold, text should contrast automatically
            >
                <Toolbar>
                    {/* Title Link - Inherits color */}
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to={dashboardPath || '/'}
                        sx={{
                            flexGrow: 1,
                            fontWeight: 'bold',
                            color: 'inherit', // Inherit color from AppBar
                            textDecoration: 'none',
                            '&:hover': { opacity: 0.9 }
                        }}
                    >
                        Campus-Connect
                    </Typography>

                    {/* Dashboard Link - Use secondary color for contrast on paper bg */}
                    {dashboardPath && location.pathname !== dashboardPath && (
                        <Button
                            component={RouterLink}
                            to={dashboardPath}
                            color="secondary" // Use theme secondary (dark gray)
                            sx={{ ...navLinkHoverSx, mr: 1, fontWeight: 'medium' }} // Added font weight
                        >
                            Dashboard
                        </Button>
                    )}

                    {/* Directory Link - Use secondary color */}
                    {location.pathname !== '/directory' && (
                        <Button
                            variant='outlined'
                            component={RouterLink}
                            to="/directory"
                            color="secondary" // Use theme secondary (dark gray)
                            sx={{ ...navLinkHoverSx, mr: 1, fontWeight: 'medium' }} // Added font weight
                        >
                            Directory
                        </Button>
                    )}

                    {/* Sign Out Button - Use secondary color */}
                    {handleSignOut && (
                        <Button
                            variant="contained" // Make it stand out more
                            onClick={handleSignOut}
                            size="small"
                            color="primary" // Use theme secondary (dark gray) for outline/text
                            sx={{ ml: 2 }}
                        >
                            Sign Out
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            {/* Main Content Area - Container should be added within child pages */}
            <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, sm: 3, md: 4 } }}>
                {children}
            </Box>
        </Box>
    );
};

export default DashboardLayout;