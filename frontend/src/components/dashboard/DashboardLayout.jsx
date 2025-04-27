/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, AppBar, Toolbar } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [loggedInUserDashboardPath, setLoggedInUserDashboardPath] = useState(null);

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
          } else {
            setLoggedInUserDashboardPath(null);
          }
        } catch (error) {
          console.error("Error fetching user role for layout:", error);
          setLoggedInUserDashboardPath(null);
        }
      } else {
        setIsUserLoggedIn(false);
        setLoggedInUserDashboardPath(null);
      }
    });
    return () => unsubscribe(); 
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const navLinkHoverSx = {
    borderRadius: 1,
    '&:hover': {
      backgroundColor: 'action.hover',
    },
  };

  const isProfilePage = currentPath.startsWith('/profile/');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Title */}
          <Typography
            variant="h6"
            component={RouterLink}
            to={loggedInUserDashboardPath || '/'}
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': { opacity: 0.9 },
              whiteSpace: 'nowrap',
            }}
          >
            Campus Connect
          </Typography>

          {/* Button Group */}
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 0.5, sm: 1.5 },
              alignItems: 'center',
            }}
          >
            {isUserLoggedIn && loggedInUserDashboardPath && currentPath !== loggedInUserDashboardPath && (
              <Button
                variant="outlined"
                component={RouterLink}
                to={loggedInUserDashboardPath}
                color="secondary"
                sx={{
                  ...navLinkHoverSx,
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  padding: { xs: '4px 8px', sm: '8px 16px' },
                  minWidth: { xs: 'auto', sm: '100px' },
                }}
              >
                Dashboard
              </Button>
            )}
            {isUserLoggedIn && currentPath !== '/directory' && !isProfilePage && (
              <Button
                variant="outlined"
                component={RouterLink}
                to="/directory"
                color="secondary"
                sx={{
                  ...navLinkHoverSx,
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  padding: { xs: '4px 8px', sm: '8px 16px' },
                  minWidth: { xs: 'auto', sm: '100px' },
                }}
              >
                Directory
              </Button>
            )}
            {isUserLoggedIn && (
              <Button
                variant="contained"
                onClick={handleSignOut}
                color="primary"
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  padding: { xs: '4px 10px', sm: '8px 16px' },
                  minWidth: { xs: 'auto', sm: '120px' },
                  textTransform: 'none',
                }}
              >
                Sign Out
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, sm: 3, md: 4 } }}>
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;