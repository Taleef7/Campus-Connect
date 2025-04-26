/* eslint-disable no-unused-vars */
// frontend/src/pages/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Alert as MuiAlert, CircularProgress, Container, Paper, ToggleButtonGroup, ToggleButton, Divider, Link as MuiLink, Snackbar, Fade, useTheme, Grow } from '@mui/material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom'; // Import RouterLink
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithCredential,
    signOut,
    sendEmailVerification,
    onAuthStateChanged // Import onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import SchoolIcon from '@mui/icons-material/School';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// --- Snackbar Alert ForwardRef ---
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
// --- End Snackbar Alert ---

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Get location object
    const theme = useTheme(); // Access theme for styling

    // --- Read initial mode from location state ---
    const initialMode = location.state?.initialMode || 'login'; // Default to 'login' if no state passed
    // --- Initialize mode state with value from location ---
    const [mode, setMode] = useState(initialMode);
    // --- End mode initialization ---

    const [role, setRole] = useState('student'); // 'student' or 'professor'
    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(true); // Loading state for initial auth check

    // State for form fields
    const [name, setName] = useState('');
    const [departmentOrMajor, setDepartmentOrMajor] = useState(''); // Combined field
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // State for feedback
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');

    // --- Simpler listener: Only manages initial loading state ---
    useEffect(() => {
        setAuthLoading(true);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // We just need to know if the check is complete to hide the spinner
            // We don't need to check the role or navigate here,
            // handleSubmit and handleGoogleLoginSuccess will handle navigation
            // after *user-initiated* actions on this page.
            console.log("AuthPage (Listener): Auth state determined. User:", user ? user.uid : null);
            setAuthLoading(false);
        });
        return () => unsubscribe(); // Cleanup listener on unmount
    }, []); // No dependencies needed now, only runs on mount/unmount
    // --- End Listener ---


    // --- Snackbar Handlers ---
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') { return; }
        setSnackbarOpen(false);
    };
    const showSnackbar = (message, severity = 'info') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };
    // --- End Snackbar Handlers ---


    const handleModeChange = (event, newMode) => {
        if (newMode !== null) { // Prevent deselecting all
            setMode(newMode);
            // Clear fields when switching mode? Optional.
            // setEmail(''); setPassword(''); setName(''); setDepartmentOrMajor('');
        }
    };

    const handleRoleChange = (event, newRole) => {
        if (newRole !== null) { // Prevent deselecting all
            setRole(newRole);
            // Clear role-specific field when switching role
            setDepartmentOrMajor('');
        }
    };

    // --- Combined Submit Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'signup') {
                // --- SIGN UP LOGIC ---
                if (!name || !email || !password) { throw new Error("Please fill in all required fields."); }
                // Basic name validation (optional)
                const nameRegex = /^[a-zA-Z\s.'-]{2,50}$/;
                if (!nameRegex.test(name.trim())) { throw new Error("Invalid Name Entered"); }

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Prepare Firestore data based on role
                const userData = {
                    name: name.trim(),
                    email: user.email,
                    role: role,
                    createdAt: new Date().toISOString(),
                    ...(role === 'student' && { major: departmentOrMajor.trim() || "" }), // Add major if student
                    ...(role === 'professor' && { department: departmentOrMajor.trim() || "" }), // Add dept if professor
                    // Add other default fields if needed (photoLink: '', etc.)
                };

                await setDoc(doc(db, 'users', user.uid), userData);

                // Send verification email
                try {
                    await sendEmailVerification(user);
                    showSnackbar(`Signup successful! Please check ${user.email} to verify your account.`, 'success');
                    // Clear form after successful signup AND email sent
                     setName(''); setDepartmentOrMajor(''); setEmail(''); setPassword('');
                     setMode('login'); // Switch to login mode after signup
                } catch (verificationError) {
                    console.error("Error sending verification email:", verificationError);
                     showSnackbar('Account created, but failed to send verification email.', 'warning');
                }

            } else {
                // --- LOGIN LOGIC ---
                if (!email || !password) { throw new Error("Please enter email and password."); }

                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                if (!user.emailVerified) {
                    // Handle email not verified (Keep as is)
                    try { await sendEmailVerification(user); showSnackbar('Email not verified. We resent the verification link.', 'warning'); }
                    catch (verificationError) { showSnackbar('Email not verified. Failed to resend link.', 'error'); }
                    await signOut(auth); // Sign out only if email is not verified
                    throw new Error("Email not verified."); // Prevent further processing
                }

                // Check role matches selected role
                const userDocRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);

                // --- MODIFIED SECTION ---
                if (docSnap.exists()) {
                     const actualRole = docSnap.data().role;
                     if (actualRole === role) {
                        // Role matches, redirect to appropriate dashboard
                        console.log(`Role match (${role}). Navigating...`); // Added log
                        navigate(role === 'student' ? '/student-dashboard' : '/professor-dashboard', { replace: true });
                        // Optional: Explicit return after navigate to be super clear
                        return;
                     } else {
                         // Role MISMATCH - Throw error WITHOUT signing out first
                         console.log(`Role mismatch. Selected: ${role}, Actual: ${actualRole}. Throwing error.`); // Added log
                         throw new Error(`Access denied. Account registered as a ${actualRole}, not ${role}.`); // More specific message
                     }
                } else {
                     // Firestore document doesn't exist for this authenticated user
                     console.log("Firestore document missing for logged-in user. Throwing error."); // Added log
                     // Don't sign out here either, just show error
                     throw new Error("Login failed: User profile not found.");
                }
                // --- END MODIFIED SECTION ---
            }
        } catch (error) {
            console.error("Auth Error:", error);
            let message = 'An error occurred. Please try again.';
            // Customize messages based on Firebase error codes
             if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') { message = 'Invalid email or password.'; }
             else if (error.code === 'auth/email-already-in-use') { message = 'Email already in use. Please log in or use a different email.'; }
             // Use the specific error messages thrown above
             else if (error.message.includes("Access denied") || error.message.includes("User profile not found")) { message = error.message; }
             else if (error.message.includes("Email not verified")) { /* Already handled by snackbar */ return; }
             else if (error.message.includes("required fields")) { message = error.message; }
             else if (error.message.includes("Invalid Name")) { message = error.message; }

            showSnackbar(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- Combined Google Login Handler ---
    const handleGoogleLoginSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const credentialResponseDecoded = jwtDecode(credentialResponse.credential);
            const { name: googleName, email: googleEmail } = credentialResponseDecoded;

            // Create Firebase credential from Google ID token
            const credential = GoogleAuthProvider.credential(credentialResponse.credential);
            // Sign in to Firebase with the credential
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // --- New User via Google ---
                // Create Firestore document based on SELECTED role toggle
                 const userData = {
                    name: googleName,
                    email: googleEmail,
                    role: role, // Use the currently selected role
                    createdAt: new Date().toISOString(),
                    ...(role === 'student' && { major: "" }), // Add empty major/dept
                    ...(role === 'professor' && { department: "" }),
                    // Add other default fields
                };
                await setDoc(userRef, userData);
                 // Redirect based on the role they signed up AS
                 navigate(role === 'student' ? '/student-dashboard' : '/professor-dashboard', { replace: true });

            } else {
                // --- Existing User via Google ---
                // Check if Firestore role matches the SELECTED role toggle
                const existingRole = userSnap.data().role;
                if (existingRole === role) {
                    // Roles match, proceed to dashboard
                    navigate(role === 'student' ? '/student-dashboard' : '/professor-dashboard', { replace: true });
                } else {
                    // Roles MISMATCH
                    await signOut(auth); // Sign out the user
                    throw new Error(`Access denied. This Google account is registered as a ${existingRole}, not a ${role}.`);
                }
            }
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            showSnackbar(error.message || 'Google Sign-In failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };


    // --- Google Login Error Handler (Fix) ---
    const handleGoogleLoginError = () => {
        console.error("Google Login Failed");
        // Directly call showSnackbar which is in scope
        showSnackbar('Google login failed. Please try again.', 'error');
    };
    // --- End Fix ---


    // Show loading spinner during initial auth check
     if (authLoading) {
         return (
             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                 <CircularProgress />
             </Box>
         );
     }

     return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', py: 4 }}>
            <Container component="main" maxWidth="xs">
                {/* Apply Grow directly to Paper */}
                <Grow in={!authLoading} timeout={500}>
                    <Paper
                        elevation={8}
                        sx={{
                            p: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center',
                            borderRadius: 4,
                        }}
                    >
                        {/* Toggles Section */}
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            {/* Role Toggle */}
                            <ToggleButtonGroup value={role} exclusive onChange={handleRoleChange} aria-label="Select role" size="small" color="secondary" >
                                <ToggleButton value="student" aria-label="student role" sx={{ px: 2, py: 0.8 }}> <SchoolIcon sx={{ mr: 0.5 }} fontSize="small"/> Student </ToggleButton>
                                <ToggleButton value="professor" aria-label="professor role" sx={{ px: 2, py: 0.8 }}> <BusinessCenterIcon sx={{ mr: 0.5 }} fontSize="small"/> Professor </ToggleButton>
                            </ToggleButtonGroup>
                            {/* Mode Toggle */}
                            {/* <ToggleButtonGroup value={mode} exclusive onChange={handleModeChange} aria-label="Login or Sign up mode" size="small" color="primary" >
                                <ToggleButton value="login" aria-label="login mode" sx={{ px: 2, py: 0.8 }}> <LoginIcon sx={{ mr: 0.5 }} fontSize="small"/> Login </ToggleButton>
                                <ToggleButton value="signup" aria-label="signup mode" sx={{ px: 2, py: 0.8 }}> <PersonAddIcon sx={{ mr: 0.5 }} fontSize="small"/> Sign Up </ToggleButton>
                            </ToggleButtonGroup> */}
                        </Box>

                        {/* Title */}
                        <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 'medium', color: 'text.primary' }}>
                            {role === 'student' ? 'Student ' : 'Professor '}
                            {mode === 'login' ? 'Login' : 'Sign Up'}
                        </Typography>

                        {/* Form */}
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                            {/* Signup Fields with Fade */}
                            <Fade in={mode === 'signup'} timeout={400} mountOnEnter unmountOnExit>
                                <Box> {/* Wrap fading fields */}
                                    <TextField margin="normal" required fullWidth id="name" label="Full Name" name="name" autoComplete="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} variant="filled" />
                                    <TextField margin="normal" fullWidth id="deptMajor" label={role === 'student' ? "Major (Optional)" : "Department (Optional)"} name="deptMajor" autoComplete="organization-title" value={departmentOrMajor} onChange={(e) => setDepartmentOrMajor(e.target.value)} variant="filled" />
                                </Box>
                            </Fade>

                            {/* Common Fields */}
                            <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus={mode === 'login'} value={email} onChange={(e) => setEmail(e.target.value)} variant="filled" />
                            <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} variant="filled" />

                            {/* Submit Button */}
                            <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 1, py: 1.5, fontWeight: 'bold', transition: 'transform 0.1s ease-in-out', '&:hover': { transform: 'scale(1.02)' } }} disabled={loading} >
                                {loading ? <CircularProgress size={24} color="inherit"/> : (mode === 'signup' ? 'Sign Up' : 'Log In')}
                            </Button>

                            {/* Divider */}
                            <Divider sx={{ my: 2.5, fontSize: '0.8rem', color: 'text.secondary' }}>OR</Divider>

                            {/* Google Login */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginError} theme="outline" size="large" shape="pill" />
                            </Box>

                            {/* Back Link (Corrected) */}
                            <Box textAlign="center" sx={{ mt: 3 }}>
                                {/* Let the Button be the RouterLink, put text directly inside */}
                                <Button
                                    variant='outlined'
                                    color='secondary'
                                    size='small'
                                    component={RouterLink} // Make Button the link
                                    to="/"                 // Set destination here
                                    sx={{ textTransform: 'none', fontWeight: 'medium', px: 2, py: 0.8 }} // Adjusted padding/weight slightly
                                >
                                    Back to Landing Page {/* Just the text */}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Grow> {/* End Grow */}

                {/* Snackbar */}
                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}> {snackbarMessage} </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default AuthPage;