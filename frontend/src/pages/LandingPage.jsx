/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/pages/LandingPage.jsx
import React from 'react';
import { Box, Button, Container, Typography, Grid, Paper, Avatar, Fade } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School'; // Icon for Students
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'; // Icon for Professors
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact'; // Icon for Connection
import FindInPageIcon from '@mui/icons-material/FindInPage'; // Icon for Discovery
import WorkIcon from '@mui/icons-material/Work'; // Icon for Opportunities
import LoginIcon from '@mui/icons-material/Login'; // Icon for Login
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // Icon for Signup

// --- TODO: Replace with a real, high-quality background image URL ---
// Consider a blurred Purdue campus photo or a professional abstract background
// You can host it in Firebase Storage or use a direct link.
import bdImage from '../assets/Mastadon.webp'; // Placeholder image

const LandingPage = () => {

  // Reusable Feature Card Component
  const FeatureCard = ({ icon, title, description }) => (
    <Paper
            elevation={3}
            sx={{
                p: 3, textAlign: 'center', height: '100%', display: 'flex',
                flexDirection: 'column', justifyContent: 'flex-start', borderRadius: 2,
                bgcolor: 'background.paper',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out', // Add transition
                '&:hover': {
                    transform: 'scale(1.03)', // Scale up on hover
                    boxShadow: 6, // Increase shadow on hover
                }
            }}
        >
      {/* Icon with primary theme color */}
      <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', width: 56, height: 56, margin: '0 auto 16px auto' }}>
        {icon}
      </Avatar>
      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );

  return (
    // Use theme background color
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* --- Hero Section --- */}
      <Box
          sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: { xs: '60vh', sm: '70vh' },
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url(${bdImage})`,
              backgroundSize: 'cover', backgroundPosition: 'center', color: 'common.white',
              textAlign: 'center', px: { xs: 2, sm: 3, md: 6 }, pt: 10, pb: 6,
          }}
      >
        <Fade in={true} timeout={1000}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem'} }} // Responsive font size
          >
            Campus Connect
          </Typography>
        </Fade>
        <Fade in={true} timeout={1500}>
          <Typography variant="h5" component="p" sx={{ mb: 4, maxWidth: '700px', color: 'rgba(255, 255, 255, 0.9)', fontSize: { xs: '1.1rem', sm: '1.25rem'} }}>
            Bridging the gap between students and faculty at Purdue.
          </Typography>
        </Fade>
        {/* --- UPDATED BUTTONS --- */}
        <Fade in={true} timeout={2000}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 4 }}>
                    {/* Login Button - passes state */}
                    <Button
                        component={RouterLink}
                        // Pass state to indicate login mode
                        to="/auth"
                        state={{ initialMode: 'login' }}
                        variant="contained"
                        color="primary" // Gold
                        size="large"
                        startIcon={<LoginIcon />}
                        sx={{ px: { xs: 3, sm: 4 }, py: { xs: 1, sm: 1.5 } }}
                    >
                        Login
                    </Button>
                    {/* Sign Up Button - passes state */}
                    <Button
                        component={RouterLink}
                        
                        to="/auth"
                        state={{ initialMode: 'signup' }}
                        variant="outlined" 
                        sx={{
                            px: { xs: 3, sm: 4 }, py: { xs: 1, sm: 1.5 },
                            color: 'white',
                            borderColor: 'white', 
                            '&:hover': {
                              borderColor: '#FFFFFF', 
                              backgroundColor: 'rgba(255, 255, 255, 0.25)'
                            }
                         }}
                        size="large"
                        startIcon={<PersonAddIcon />}
                    >
                        Sign Up
                    </Button>
                </Box>
                 {/* --- END UPDATED BUTTONS --- */}
        </Fade>
            </Box>

      {/* --- Features Section --- */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ fontWeight: 'bold', mb: { xs: 4, md: 6 } }}>
          How Campus Connect Helps You
        </Typography>
        {/* Use Grid v2 (no import needed if MUI v5+) */}
        <Grid container spacing={4} justifyContent="center">
          {/* Feature 1 */}
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              icon={<WorkIcon />}
              title="Find Opportunities"
              description="Discover TA, research, grader, and other campus positions posted directly by professors who in turn can easily reach interested and qualified students."
            />
          </Grid>
          {/* Feature 2 */}
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              icon={<ConnectWithoutContactIcon />}
              title="Connect Directly"
              description="Streamline communication, allowing students to express their interest and professors to manage potential candidates all in one place."
            />
          </Grid>
          {/* Feature 3 */}
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard
              icon={<FindInPageIcon />}
              title="Explore & Discover"
              description="Browse faculty profiles to learn about research interests and courses offered. Find students with relevant skills and experience."
            />
          </Grid>
        </Grid>
      </Container>

      {/* --- Footer Section --- */}
      {/* Use theme secondary color */}
      <Box sx={{ bgcolor: '#000000', color: '#ffffff', py: 4, mt: 'auto' }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
           {/* Optional: Add relevant links or info */}
          <Typography variant="body2" sx={{ opacity: 1 }}>
            Campus Connect | Purdue University Fort Wayne
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 1 }}>
            © {new Date().getFullYear()} - All Rights Reserved
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;