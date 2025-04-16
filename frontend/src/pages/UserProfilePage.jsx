/* eslint-disable no-unused-vars */
// frontend/src/pages/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Container, Paper, Box, Typography, CircularProgress, Button, Chip, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Assuming you want the same overall layout
import DashboardLayout from '../components/dashboard/DashboardLayout';
// Reuse ProfileHeader for visual consistency
import ProfileHeader from '../components/profile/ProfileHeader';

const UserProfilePage = () => {
  const { userId } = useParams(); // Get the userId from the URL parameter
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError("No user ID provided.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          setProfileData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("User profile not found.");
          setProfileData(null); // Ensure no stale data is shown
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]); // Re-fetch if the userId parameter changes

  // Determine role-specific info for display
  const roleInfo = profileData?.role === 'student'
    ? `${profileData?.major || 'Undecided Major'} - ${profileData?.year || 'Unknown Year'}`
    : `${profileData?.department || 'No Department'}`;

  return (
    // Using DashboardLayout but without the sign-out button maybe? Or keep it? Let's keep it simple for now.
    // Pass null for handleSignOut if you want to hide the button on this public page
    <DashboardLayout handleSignOut={null}>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            {/* Back Button */}
            <Button
                component={RouterLink}
                to="/directory" // Link back to the directory
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 2 }}
            >
                Back to Directory
            </Button>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error" sx={{ textAlign: 'center', mt: 5 }}>{error}</Typography>
            ) : profileData ? (
                <Paper elevation={3} sx={{ borderRadius: 2 }}>
                    {/* Reuse ProfileHeader - Students won't show cover, professors might */}
                    <ProfileHeader
                        coverLink={profileData.coverLink || null} // Use null if no coverLink field exists
                        photoLink={profileData.photoLink || null}
                        professorName={profileData.name} // Pass name for initials calculation
                        // Disable editing/viewing actions on public profile page
                        onEditCover={() => {}}
                        onViewCover={() => {}}
                        onEditPhoto={() => {}}
                        onViewPhoto={() => {}}
                    />
                     <Box sx={{ p: 3 }}>
                        {/* Basic Info */}
                        <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>{profileData.name}</Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>{roleInfo}</Typography>
                         <Chip
                            label={profileData.role?.charAt(0).toUpperCase() + profileData.role?.slice(1)}
                            size="small"
                            color={profileData.role === 'student' ? 'secondary' : 'primary'}
                            sx={{ mb: 2 }}
                        />

                        {/* About Section */}
                        {profileData.about && (
                             <Box sx={{ mb: 3 }}>
                                 <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>About</Typography>
                                 <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{profileData.about}</Typography>
                             </Box>
                        )}

                         {/* TODO: Add sections to display Research (if professor), Courses (if professor), Interests (if student) */}
                         {/* These would require fetching additional data based on userId */}
                         {/* Example: */}
                         {/* {profileData.role === 'professor' && <ProfessorResearchSection userId={userId} />} */}
                         {/* {profileData.role === 'student' && <StudentInterestsSection userId={userId} />} */}

                         {/* Display Resume Link if available */}
                         {profileData.resumeLink && (
                             <Box sx={{ mt: 2 }}>
                                 <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>Resume/CV</Typography>
                                 <Button
                                     variant="outlined" component="a" href={profileData.resumeLink}
                                     target="_blank" rel="noopener noreferrer"
                                     sx={{ textTransform: 'none' }} size="small"
                                 >
                                     View Document
                                 </Button>
                             </Box>
                         )}

                    </Box>
                </Paper>
            ) : (
                 <Typography sx={{ textAlign: 'center', mt: 5 }}>Profile data could not be loaded.</Typography> // Should be caught by error state mostly
            )}
        </Container>
    </DashboardLayout>
  );
};

export default UserProfilePage;