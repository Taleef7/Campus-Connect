// LandingPage.jsx (Updated: polished login form appearance)
import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Stack, Menu, MenuItem, IconButton, Fade, Zoom } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import arielview from '../assets/arielview.jpg';
import educationBg from '../assets/education-bg.jpg';
import StudentAuth from './StudentAuth';
import ProfessorAuth from './ProfessorAuth';

const LandingPage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [authMode, setAuthMode] = useState('');
  const [userType, setUserType] = useState('');

  const handleClick = (event, mode) => {
    setAuthMode(mode);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (type) => {
    setUserType(type);
    setAnchorEl(null);
  };

  const renderAuthForm = () => {
    if (!userType || !authMode) return null;
    const isSignup = authMode === 'signup';
    const key = `${authMode}-${userType}`;
    return (
      <Zoom in timeout={500}>
        <Box
          sx={{
            p: 4,
            width: 400,
            minHeight: 500,
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 8px 24px rgba(31, 38, 135, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {userType === 'student' ? <StudentAuth key={key} isSignup={isSignup} embedded={true} /> : <ProfessorAuth key={key} isSignup={isSignup} embedded={true} />}
        </Box>
      </Zoom>
    );
  };

  return (
    <Box sx={{
      width: '100%', minHeight: '100vh', backgroundColor: '#f7f9fc',
      display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, overflow: 'hidden',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <Paper elevation={6} sx={{
          p: 4, width: userType ? 480 : 650, height: 500,
          backgroundImage: `url(${educationBg})`, backgroundSize: 'cover', backgroundPosition: 'center',
          borderRadius: '20px', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
          transition: 'all 0.5s ease', transform: userType ? 'translateX(-30px) scale(0.92)' : 'none',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden', zIndex: 2,
          marginRight: userType ? '-25px' : '0px',
        }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 1 }} />
          <Stack spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 2 }}>
            <Box>
              <Button onClick={(e) => handleClick(e, 'login')} sx={{ color: '#3f72af', fontWeight: 'bold', fontSize: '1rem', '&:hover': { color: '#112d4e' } }}>Login</Button>
              <Button onClick={(e) => handleClick(e, 'signup')} sx={{ color: '#3f72af', fontWeight: 'bold', ml: 2, fontSize: '1rem', '&:hover': { color: '#112d4e' } }}>Signup</Button>
            </Box>
          </Stack>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} PaperProps={{ sx: { backgroundColor: 'white', borderRadius: 2 } }}>
            <MenuItem onClick={() => handleSelect('student')}>Student</MenuItem>
            <MenuItem onClick={() => handleSelect('professor')}>Professor</MenuItem>
          </Menu>
          {!userType && (
            <Box sx={{ textAlign: 'center', mt: 4, zIndex: 2, position: 'relative' }}>
              <Typography variant="h3" fontWeight="bold" sx={{ color: '#112d4e', letterSpacing: 1 }}>
                Campus Connect
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#6c757d', mt: 1 }}>
                Connecting students and professors for opportunities, growth, and collaboration.
              </Typography>
            </Box>
          )}
          <Fade in={Boolean(userType)} timeout={600}>
            <Box sx={{ textAlign: 'center', mt: 4, zIndex: 2, position: 'relative' }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#112d4e' }}>
                Ready to connect? How would you like to continue?
              </Typography>
            </Box>
          </Fade>
        </Paper>

        {userType && (
          <Fade in={userType}>
            <IconButton sx={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(6px)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.7)' }, zIndex: 2,
            }}>
              <ArrowForwardIosIcon sx={{ color: '#112d4e' }} />
            </IconButton>
          </Fade>
        )}

        {userType && renderAuthForm()}
      </Box>
    </Box>
  );
};

export default LandingPage;
