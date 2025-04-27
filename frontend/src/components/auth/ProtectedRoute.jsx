/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// frontend/src/components/auth/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase'; // Adjust path if needed
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();

  // Check env variable
  const skipVerification = import.meta.env.VITE_SKIP_EMAIL_VERIFICATION === 'true';

  console.log("ProtectedRoute: Rendering..."); // Log render

  console.log(`ProtectedRoute: Current location: ${location.pathname}`); // Log current location
  useEffect(() => {
    // Add more detailed logging inside the listener
    console.log(`ProtectedRoute Listener (${location.pathname}): Mounting/Running effect...`);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(`ProtectedRoute Listener (${location.pathname}): onAuthStateChanged fired. User found:`, !!user);
      if (user) {
        console.log(`ProtectedRoute Listener (<span class="math-inline">\{location\.pathname\}\)\: Setting isAuthenticated\=true, isVerified\=</span>{user.emailVerified}`);
        setIsAuthenticated(true);
        setIsVerified(user.emailVerified);
      } else {
        console.log(`ProtectedRoute Listener (${location.pathname}): Setting isAuthenticated=false, isVerified=false`);
        setIsAuthenticated(false);
        setIsVerified(false);
      }
      setIsLoading(false);
      console.log(`ProtectedRoute Listener (${location.pathname}): Auth check complete. isLoading: false`);
    });

    return () => {
        console.log(`ProtectedRoute Listener (${location.pathname}): Unmounting/Cleanup effect.`);
        unsubscribe();
    };
    // Rerun if location changes? Maybe not necessary if auth state is stable.
    // Let's keep dependency array empty for now to avoid potential loops.
  }, []); // Empty dependency array - runs once on mount


  if (isLoading) {
    console.log(`ProtectedRoute Rendering (${location.pathname}): Showing Loading Spinner`);
    return ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}> <CircularProgress /> </Box> );
  }

  if (!isAuthenticated) {
    console.log(`ProtectedRoute Rendering (${location.pathname}): Redirecting -> Not Authenticated`);
    return <Navigate to="/" state={{ from: location }} replace />; // Or your login route
  }

  if (!isVerified && !skipVerification) {
    console.log(`ProtectedRoute Rendering (${location.pathname}): Redirecting -> Not Verified (and skip=false)`);
    return <Navigate to="/" state={{ verificationRequired: true, from: location }} replace />; // Or your login route
  }

  // If all checks pass
  console.log(`ProtectedRoute Rendering (${location.pathname}): All checks passed. Rendering children.`);
  return children;
};

export default ProtectedRoute;