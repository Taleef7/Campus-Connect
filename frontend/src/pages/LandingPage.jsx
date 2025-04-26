import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Menu, MenuItem, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/arielview.jpg'; // Background image
import { auth, db } from '../firebase'; // Import auth and db
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import { doc, getDoc } from 'firebase/firestore'; // Import firestore functions

const LandingPage = () => {
  const navigate = useNavigate();
  const [anchorElLogin, setAnchorElLogin] = useState(null);
  const [anchorElSignup, setAnchorElSignup] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state for auth check

  // --- Check Auth State and Redirect ---
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        // User is logged in and verified, check their role
        console.log("LandingPage: User logged in and verified, checking role...");
        const userDocRef = doc(db, 'users', user.uid);
        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const role = docSnap.data().role;
                console.log("LandingPage: User role found:", role);
                if (role === 'student') {
                    navigate('/student-dashboard', { replace: true });
                } else if (role === 'professor') {
                    navigate('/professor-dashboard', { replace: true });
                } else {
                    // Unknown role or role missing, stay on landing page? Or logout?
                    console.warn("LandingPage: Unknown user role:", role);
                    setLoading(false);
                }
            } else {
                 // User exists in auth but not Firestore? Should ideally not happen.
                 console.error("LandingPage: Firestore doc missing for logged in user.");
                 setLoading(false); // Allow landing page to render
            }
        } catch(error) {
             console.error("LandingPage: Error fetching user role:", error);
             setLoading(false); // Allow landing page to render on error
        }
      } else {
        // No user logged in, or email not verified, stay on landing page
        console.log("LandingPage: No authenticated/verified user found.");
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, [navigate]);
  // --- End Auth Check ---

  // Open dropdown menu
  const handleMenuOpen = (event, type) => {
    if (type === 'login') setAnchorElLogin(event.currentTarget);
    if (type === 'signup') setAnchorElSignup(event.currentTarget);
  };

  // Close dropdown menu
  const handleClose = () => {
    setAnchorElLogin(null);
    setAnchorElSignup(null);
  };

  // Force Navigation
  const handleNavigate = (path) => {
    console.log("Navigating to:", path); // Debugging output
    handleClose();
    setTimeout(() => {
      navigate(path, { replace: true }); // Force replace to make sure navigation happens
    }, 200);
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render Landing Page content if not redirecting
  return (
    <Box
      sx={{
        width: '100vw', height: '100vh', backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'contain', backgroundPosition: 'center', display: 'flex',
        alignItems: 'center', justifyContent: 'center', px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          backgroundColor: 'white', padding: '3rem', borderRadius: '20px', maxWidth: '700px',
          width: '85%', minHeight: '420px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', top: 20, right: 30, display: 'flex', gap: 2 }}>
          {/* Login Button & Menu */}
           <Button variant="text" onClick={(e) => handleMenuOpen(e, 'login')} /* ... sx ... */ > Login </Button>
           <Menu anchorEl={anchorElLogin} open={Boolean(anchorElLogin)} onClose={handleClose}>
             <MenuItem onClick={() => handleNavigate('/student-login')}>Student Login</MenuItem>
             <MenuItem onClick={() => handleNavigate('/professor-login')}>Professor Login</MenuItem>
           </Menu>

           {/* Signup Button & Menu */}
           <Button variant="text" onClick={(e) => handleMenuOpen(e, 'signup')} /* ... sx ... */ > Signup </Button>
           <Menu anchorEl={anchorElSignup} open={Boolean(anchorElSignup)} onClose={handleClose}>
             <MenuItem onClick={() => handleNavigate('/student-signup')}>Student Signup</MenuItem>
             <MenuItem onClick={() => handleNavigate('/professor-signup')}>Professor Signup</MenuItem>
           </Menu>
        </Box>

        <Typography variant="h3" fontWeight="bold" /* ... sx ... */ > Campus Connect </Typography>
        <Typography variant="h6" /* ... sx ... */ > Connecting students and professors for a better academic experience. </Typography>
      </Paper>
    </Box>
  );
};

export default LandingPage;
