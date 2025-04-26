// ProfessorAuth.jsx (Fully Polished Version)
import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signOut, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogin } from '@react-oauth/google';

const ProfessorAuth = ({ isSignup, embedded = false }) => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
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
          name, email, department,
          role: 'professor',
          createdAt: new Date().toISOString(),
        });

        await sendEmailVerification(user);
        alert(`Signup successful! Please check your email (${user.email}) for a verification link.`);
        setName(''); setDepartment(''); setEmail(''); setPassword('');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && docSnap.data().role === 'professor') {
            if (user.emailVerified) {
              navigate('/professor-dashboard');
            } else {
              await sendEmailVerification(user);
              alert('Please verify your email address. A new link has been sent.');
              await signOut(auth);
            }
          } else {
            await signOut(auth);
            setErrorMsg('Access denied. Please use the correct portal.');
          }
        } else {
          setErrorMsg('Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error("Auth Error:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password.');
      } else if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please log in.');
      } else {
        setErrorMsg('An error occurred. Please try again.');
      }
    } finally {
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

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name, email, department: '', role: 'professor', createdAt: new Date().toISOString(),
        });
        navigate('/professor-dashboard');
      } else {
        if (userSnap.data().role === 'professor') {
          navigate('/professor-dashboard');
        } else {
          await signOut(auth);
          setErrorMsg('Access denied. Not a professor account.');
        }
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setErrorMsg('Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom>
        {isSignup ? 'Professor Sign-Up' : 'Professor Login'}
      </Typography>

      {errorMsg && (<Alert severity="error" sx={{ mb: 2, maxWidth: '400px', width: '100%' }}>{errorMsg}</Alert>)}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '400px' }}>
        {isSignup && (
          <>
            <TextField
              label="Name"
              variant="outlined"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': { borderColor: '#3f72af' },
                  '&.Mui-focused fieldset': { borderColor: '#3f72af' },
                },
              }}
            />
            <TextField
              label="Department (optional)"
              variant="outlined"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': { borderColor: '#3f72af' },
                  '&.Mui-focused fieldset': { borderColor: '#3f72af' },
                },
              }}
            />
          </>
        )}
        <TextField
          label="Email"
          variant="outlined"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '&:hover fieldset': { borderColor: '#3f72af' },
              '&.Mui-focused fieldset': { borderColor: '#3f72af' },
            },
          }}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '&:hover fieldset': { borderColor: '#3f72af' },
              '&.Mui-focused fieldset': { borderColor: '#3f72af' },
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: '#3f72af',
            color: '#ffffff',
            fontWeight: 'bold',
            borderRadius: '12px',
            mt: 2,
            '&:hover': {
              backgroundColor: '#112d4e',
              boxShadow: '0px 4px 12px rgba(17,45,78,0.3)',
            },
          }}
        >
          {loading ? <CircularProgress size={24} /> : (isSignup ? 'Sign Up' : 'Log In')}
        </Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={() => { console.error('Google Login Failed'); setErrorMsg('Google login failed.'); }}
        />
      </Box>

      <Button onClick={() => {
        if (embedded) {
          window.location.reload();
        } else {
          navigate(isSignup ? '/professor-login' : '/professor-signup');
        }
      }} sx={{ mt: 2 }} variant="text">
        {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
      </Button>

      <Button variant="outlined" onClick={() => {
        if (embedded) {
          window.location.reload();
        } else {
          navigate('/');
        }
      }} sx={{ mt: 2 }}>
        Back to Landing
      </Button>
    </Box>
  );
};

export default ProfessorAuth;