/* eslint-disable no-unused-vars */
// frontend/src/pages/StudentAuth.jsx
import React, { useState } from 'react'; // Import React
import { Box, Typography, Button, TextField, Alert, CircularProgress  } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signOut, sendEmailVerification  } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignup) {
        if (!name || !email || !password) {
          setErrorMsg('Please fill in all required fields.');
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
            // **IMPORTANT**: Inform the user, DO NOT navigate directly to dashboard yet
            setErrorMsg(''); // Clear previous errors
            alert("Signup successful! Please check your email (" + user.email + ") for a verification link to activate your account before logging in."); // Simple alert, consider a better UI
            // Optionally clear the form fields here
            setName(''); setMajor(''); setEmail(''); setPassword('');
            // You might redirect to the login page or stay here
            // navigate('/student-login');
        } catch (verificationError) {
            console.error("Error sending verification email:", verificationError);
            // Handle case where user/doc created but email failed? Maybe show error message.
            setErrorMsg("Account created, but failed to send verification email. Please contact support or try logging in later.");
        }
        // navigate('/student-dashboard');
      } else {
        // --- LOGIN LOGIC ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password); // Get credential on login too
        const user = userCredential.user; // Get user from credential


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
                      alert('Please verify your email address before logging in. A new verification link has been sent to your inbox (check spam too).'); // Update alert message
                  } catch (verificationError) {
                      console.error("Error resending verification email:", verificationError);
                      alert('Please verify your email. We attempted to resend the verification link, but failed. Please try again later or contact support.');
                  }
                  await signOut(auth); // Sign out after attempting resend
                  // setErrorMsg('Please verify your email address before logging in. Check your inbox for the verification link.'); // Use alert instead maybe
                  // --- END RESEND ---
              }
            } else {
                await signOut(auth); // Sign out if role is wrong or doc missing
                setErrorMsg('Access denied. Please use the correct portal or use valid credentials.');
            }
        } else {
             setErrorMsg('Login failed. Please try again.'); // Should not happen if signIn succeeded
        }
      }
    } catch (error) {
       console.error("Auth Error:", error);
       // Provide more user-friendly messages
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            setErrorMsg('Invalid email or password.');
        } else if (error.code === 'auth/email-already-in-use') {
            setErrorMsg('This email is already registered. Please log in.');
        }
        else {
            setErrorMsg('An error occurred. Please try again.');
        }
    } finally { // Use finally to ensure loading is always set to false
       setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
      setLoading(true);
      setErrorMsg('');
      try {
        const credentialResponseDecoded = jwtDecode(credentialResponse.credential);
        const { name, email } = credentialResponseDecoded;
        const credential = GoogleAuthProvider.credential(credentialResponse.credential);
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // If user doesn't exist, create them with student role
          await setDoc(userRef, {
            name, email, major: "", // Default major
            role: "student",
            createdAt: new Date().toISOString(),
          });
           navigate('/student-dashboard');
        } else {
            // If user exists, check their role
            if (userSnap.data().role === 'student') {
                 navigate('/student-dashboard');
            } else {
                // If existing user is not a student, sign out and show error
                await signOut(auth);
                setErrorMsg('Access denied. This account is not registered as a student.');
            }
        }
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        setErrorMsg('Google Sign-In failed. Please try again.');
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
        {/* Add inputProps to the password field */}
        <TextField
          label="Password" variant="outlined" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          inputProps={{ autoComplete: isSignup ? 'new-password' : 'current-password' }} // Use new-password for signup
        />

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (isSignup ? 'Sign Up' : 'Log In')}
        </Button>
      </Box>

      <Box sx={{ mt: 2 }}> {/* Wrap Google Login for margin */}
          <GoogleLogin
            // clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} // Use env var if set up
            onSuccess={handleGoogleLoginSuccess}
            onError={() => { console.error("Google Login Failed"); setErrorMsg('Google login failed.');}}
            // theme="filled_blue" // Optional styling
            // size="large" // Optional styling
          />
      </Box>


      <Button onClick={() => navigate(isSignup ? '/student-login' : '/student-signup')} sx={{ mt: 2 }} variant="text" >
        {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
      </Button>

      <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>
        Back to Landing
      </Button>
    </Box>
  );
};

export default StudentAuth;