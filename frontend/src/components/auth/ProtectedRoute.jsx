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

  console.log("ProtectedRoute: Rendering..."); // Log render

  useEffect(() => {
    console.log("ProtectedRoute: useEffect running...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("ProtectedRoute: onAuthStateChanged callback fired. User:", user);
      if (user) {
        console.log("ProtectedRoute: User found. Email Verified:", user.emailVerified);
        setIsAuthenticated(true);
        setIsVerified(user.emailVerified);
      } else {
        console.log("ProtectedRoute: No user found.");
        setIsAuthenticated(false);
        setIsVerified(false);
      }
      setIsLoading(false); // Auth check complete
      console.log("ProtectedRoute: Auth check complete. isLoading: false");
    });

    return () => {
        console.log("ProtectedRoute: Cleanup useEffect.");
        unsubscribe();
    };
  }, []); // Empty dependency array is correct

  if (isLoading) {
    console.log("ProtectedRoute: Still loading auth state...");
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: NOT Authenticated, redirecting to /");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!isVerified) {
     console.log("ProtectedRoute: Authenticated but NOT Verified, redirecting to /");
     // Optional: Add state to redirect target to show a specific message
     return <Navigate to="/" state={{ verificationRequired: true, from: location }} replace />;
  }

  // If authenticated and verified, render children
  console.log("ProtectedRoute: Authenticated and Verified, rendering children.");
  return children;
};

export default ProtectedRoute;