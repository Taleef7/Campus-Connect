/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/components/dashboard/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, AppBar, Toolbar } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
// Firebase Imports
import { auth, db } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Added signOut
import { doc, getDoc } from 'firebase/firestore';

// Removed dashboardPath from props, title is also unused currently
const DashboardLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate(); // Hook for navigation
    const currentPath = location.pathname;

    // State for logged-in user info
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [loggedInUserDashboardPath, setLoggedInUserDashboardPath] = useState(null);

    // Effect to determine logged-in user's dashboard path
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.emailVerified) {
                setIsUserLoggedIn(true);
                const userDocRef = doc(db, 'users', user.uid);
                try {
                    const docSnap = await getDoc(userDocRef);
                    if (docSnap.exists()) {
                        const role = docSnap.data().role;
                        setLoggedInUserDashboardPath(
                            role === 'student' ? '/student-dashboard' :
                            role === 'professor' ? '/professor-dashboard' : null
                        );
                    } else { setLoggedInUserDashboardPath(null); }
                } catch (error) {
                    console.error("Error fetching user role for layout:", error);
                    setLoggedInUserDashboardPath(null);
                }
            } else {
                // No user logged in or not verified
                setIsUserLoggedIn(false);
                setLoggedInUserDashboardPath(null);
            }
        });
        return () => unsubscribe(); // Cleanup on unmount
    }, []); // Run once on mount

    // Define SignOut handler inside the layout
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // Navigate to home or login page after sign out
            navigate('/'); // Or '/student-login' ?
        } catch (error) {
            console.error("Sign out error:", error);
            // Show snackbar?
        }
    };

    const navLinkHoverSx = {
      borderRadius: 1,
      '&:hover': {
          backgroundColor: 'action.hover',
      },
  };
    // --- Determine if we are on a profile page ---
    const isProfilePage = currentPath.startsWith('/profile/');
    // --- ---


    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="sticky" sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
                <Toolbar>
                    {/* Title Link */}
                    <Typography
                        variant="h6" component={RouterLink}
                        // Link to dashboard if logged in, else home
                        to={loggedInUserDashboardPath || '/'}
                        sx={{ flexGrow: 1, fontWeight: 'bold', color: 'inherit', textDecoration: 'none', '&:hover': { opacity: 0.9 } }}
                    >
                        Campus Connect
                    </Typography>

                    {/* --- BUTTON LOGIC REVISED --- */}

                    {/* Dashboard Button */}
                    {isUserLoggedIn && loggedInUserDashboardPath && currentPath !== loggedInUserDashboardPath && (
                        <Button variant='outlined' component={RouterLink} to={loggedInUserDashboardPath} color="secondary" sx={{ ...navLinkHoverSx, mr: 1, fontWeight: 'medium' }}>
                            Dashboard
                        </Button>
                    )}

                    {/* Directory Button: Show if Logged In AND NOT on Directory AND NOT on Profile */}
                    {isUserLoggedIn && currentPath !== '/directory' && !isProfilePage && ( // <<< ADDED !isProfilePage CHECK
                        <Button variant='outlined' component={RouterLink} to="/directory" color="secondary" sx={{ ...navLinkHoverSx, mr: 1, fontWeight: 'medium' }}>
                            Directory
                        </Button>
                    )}

                    {/* Sign Out Button */}
                    {isUserLoggedIn && (
                        <Button variant='contained' onClick={handleSignOut} color="primary" sx={{ ml: 1 }} >
                            Sign Out
                        </Button>
                    )}
                    {/* --- END BUTTON LOGIC --- */}

                </Toolbar>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, sm: 3, md: 4 } }}>
                {children}
            </Box>
        </Box>
    );
};

export default DashboardLayout;