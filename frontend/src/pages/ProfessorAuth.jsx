/* eslint-disable no-unused-vars */
// frontend/src/pages/ProfessorAuth.jsx
import React, { useState } from 'react'; // Import React
import { Box, Typography, Button, TextField, Alert, CircularProgress } from '@mui/material'; // Added CircularProgress
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithCredential, sendEmailVerification  } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";

import SnackbarMessage from '../components/common/SnackbarMessage';

const ProfessorAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPath = location.pathname.includes('login');
  const isSignup = !isLoginPath;

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignup) {
        const nameRegex = /^[a-zA-Z\s.'-]{2,50}$/;
        if (!nameRegex.test(name.trim())) {
          setSnackbarMessage('Invalid Name Entered');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
          return;
        }

        if (!name || !email || !password) {
          setSnackbarMessage('Please fill in all required fields.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          name, email, department,
          role: 'professor', 
          createdAt: new Date().toISOString(),
        });

        // 3. Send verification email
        try {
            await sendEmailVerification(user);
            console.log("Verification email sent to:", user.email);
            setSnackbarMessage(`Signup successful! Please check your email (${user.email}) to verify your account.`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setLoading(false);
            setName(''); setDepartment(''); setEmail(''); setPassword('');
        } catch (verificationError) {
          console.error("Error sending verification email:", verificationError);
          setSnackbarMessage('Account created, but failed to send verification email. Please contact support.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } else {
        // --- LOGIN LOGIC ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password); // Get credential
        const user = userCredential.user; 

        if (user) {
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists() && docSnap.data().role === 'professor') {
                if (user.emailVerified) {
                  navigate('/professor-dashboard');
              } else {
                  // --- RESEND EMAIL FOR EXISTING UNVERIFIED USER ---
                  console.log("User email not verified, attempting to resend verification email.");
                  try {
                      await sendEmailVerification(user);
                      setSnackbarMessage('Please verify your email address. We resent a new verification link.');
                      setSnackbarSeverity('warning');
                      setSnackbarOpen(true);
                  } catch (verificationError) {
                      console.error("Error resending verification email:", verificationError);
                      setSnackbarMessage('Failed to resend verification link. Please try again later.');
                      setSnackbarSeverity('error');
                      setSnackbarOpen(true);
                  }
                  await signOut(auth);
                  // --- END RESEND ---
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
            name, email, department: "",
            role: "professor",
            createdAt: new Date().toISOString(),
          });
           navigate("/professor-dashboard");
        } else {
            if (userSnap.data().role === 'professor') {
                 navigate("/professor-dashboard");
            } else {
                await signOut(auth);
                setSnackbarMessage('Access denied. This account is not registered as a professor.');
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
        {isSignup ? 'Professor Sign-Up' : 'Professor Login'}
      </Typography>

      {errorMsg && ( <Alert severity="error" sx={{ mb: 2, maxWidth: '400px', width: '100%' }}> {errorMsg} </Alert> )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '400px', }} >
        {isSignup && (
          <>
            <TextField label="Name" variant="outlined" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <TextField label="Department (optional)" variant="outlined" value={department} onChange={(e) => setDepartment(e.target.value)} />
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
              setSnackbarOpen(true);;}}
          />
       </Box>

      <Button onClick={() => navigate(isSignup ? '/professor-login' : '/professor-signup')} sx={{ mt: 2 }} variant="text" >
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

export default ProfessorAuth;