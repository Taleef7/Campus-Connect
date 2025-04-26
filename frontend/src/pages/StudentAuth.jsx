/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Alert, CircularProgress  } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signOut, sendEmailVerification  } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";

import SnackbarMessage from '../components/common/SnackbarMessage';

const StudentAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPath = location.pathname.includes('login');
  const isSignup = !isLoginPath;

  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        if (!name || !email || !password) {
          setSnackbarMessage('Please fill in all required fields.');
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          name, email, major,
          role: 'student',
          createdAt: new Date().toISOString(),
        });

        try {
            await sendEmailVerification(user);
            console.log("Verification email sent to:", user.email);
            setSnackbarMessage(`Signup successful! Please verify your email (${user.email}).`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setName(''); setMajor(''); setEmail(''); setPassword('');
        } catch (verificationError) {
            console.error("Error sending verification email:", verificationError);
            setSnackbarMessage('Account created, but failed to send verification email. Please contact support.');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
        }
      } else {
        // --- LOGIN LOGIC ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password); // Get credential on login too
        const user = userCredential.user;


        if (user) {
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists() && docSnap.data().role === 'student') {
                if (user.emailVerified) {
                  navigate('/student-dashboard');
              } else {
                  // --- RESEND EMAIL FOR EXISTING UNVERIFIED USER ---
                  console.log("User email not verified, attempting to resend verification email.");
                  try {
                      await sendEmailVerification(user);
                      setSnackbarMessage('Please verify your email. A new verification link was sent.');
                      setSnackbarSeverity('warning');
                      setSnackbarOpen(true);
                  } catch (verificationError) {
                      console.error("Error resending verification email:", verificationError);
                      setSnackbarMessage('Failed to resend verification email. Please try again later.');
                      setSnackbarSeverity('error');
                      setSnackbarOpen(true);
                  }
                  await signOut(auth); 
              }
            } else {
                await signOut(auth);
                setSnackbarMessage('Access denied. Please use the correct portal.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        } else {
          setSnackbarMessage('Login failed. Please try again.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      }
    } catch (error) {
       console.error("Auth Error:", error);
       if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setSnackbarMessage('Invalid email or password.');
      } else if (error.code === 'auth/email-already-in-use') {
        setSnackbarMessage('This email is already registered. Please log in.');
      } else {
        setSnackbarMessage('An error occurred. Please try again.');
      }
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
      setLoading(true);
      try {
        const credentialResponseDecoded = jwtDecode(credentialResponse.credential);
        const { name, email } = credentialResponseDecoded;
        const credential = GoogleAuthProvider.credential(credentialResponse.credential);
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name, email, major: "", 
            role: "student",
            createdAt: new Date().toISOString(),
          });
           navigate('/student-dashboard');
        } else {
            if (userSnap.data().role === 'student') {
                 navigate('/student-dashboard');
            } else {
                await signOut(auth);
                setSnackbarMessage('Access denied. This account is not registered as a student.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        }
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        setSnackbarMessage('Google Sign-In failed. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
         setLoading(false);
      }
    };


  return (
    <Box
      sx={{
        width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 2, overflowX: 'hidden',
      }}
    >
      <Typography variant="h4" gutterBottom>
        {isSignup ? 'Student Sign-Up' : 'Student Login'}
      </Typography>

      {errorMsg && ( <Alert severity="error" sx={{ mb: 2, maxWidth: '400px', width: '100%' }}> {errorMsg} </Alert> )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '400px', }} >
        {isSignup && (
          <>
            <TextField label="Name" variant="outlined" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <TextField label="Major (optional)" variant="outlined" value={major} onChange={(e) => setMajor(e.target.value)} />
          </>
        )}
        <TextField label="Email" variant="outlined" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <TextField
          label="Password" variant="outlined" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          inputProps={{ autoComplete: isSignup ? 'new-password' : 'current-password' }} 
        />

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (isSignup ? 'Sign Up' : 'Log In')}
        </Button>
      </Box>

      <Box sx={{ mt: 2 }}> 
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => { console.error("Google Login Failed"); setSnackbarMessage('Google login failed.');
              setSnackbarSeverity('error');
              setSnackbarOpen(true);}}
          />
      </Box>


      <Button onClick={() => navigate(isSignup ? '/student-login' : '/student-signup')} sx={{ mt: 2 }} variant="text" >
        {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
      </Button>

      <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>
        Back to Landing
      </Button>

      <SnackbarMessage
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </Box>
  );
};

export default StudentAuth;