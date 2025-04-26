// src/components/dashboard/DashboardLayout.jsx
import React from 'react';
import { Box, Typography, Button, AppBar, Toolbar } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const DashboardLayout = ({ title, handleSignOut, children, dashboardPath }) => {
    const location = useLocation();

    const navLinkHoverSx = {
        borderRadius: 1,
        '&:hover': {
            backgroundColor: '#395B64',
        },
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#E7F6F2' }}>
            <AppBar
                position="sticky"
                sx={{ bgcolor: '#2C3333', color: '#A5C9CA' }}
            >
                <Toolbar>
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to={dashboardPath || '/'}
                        sx={{
                            flexGrow: 1,
                            fontWeight: 'bold',
                            color: 'inherit',
                            textDecoration: 'none',
                            '&:hover': { color: '#395B64' }
                        }}
                    >
                        Campus-Connect
                    </Typography>

                    {dashboardPath && location.pathname !== dashboardPath && (
                        <Button
                            component={RouterLink}
                            to={dashboardPath}
                            sx={{ ...navLinkHoverSx, mr: 1, fontWeight: 'medium', color: '#A5C9CA' }}
                        >
                            Dashboard
                        </Button>
                    )}

                    {location.pathname !== '/directory' && (
                        <Button
                            variant='outlined'
                            component={RouterLink}
                            to="/directory"
                            sx={{ ...navLinkHoverSx, mr: 1, fontWeight: 'medium', color: '#A5C9CA', borderColor: '#A5C9CA' }}
                        >
                            Directory
                        </Button>
                    )}

                    {handleSignOut && (
                        <Button
                            variant="contained"
                            onClick={handleSignOut}
                            size="small"
                            sx={{ ml: 2, backgroundColor: '#395B64', color: 'white', '&:hover': { backgroundColor: '#2C3333' } }}
                        >
                            Sign Out
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, sm: 3, md: 4 } }}>
                {children}
            </Box>
        </Box>
    );
};

export default DashboardLayout;
