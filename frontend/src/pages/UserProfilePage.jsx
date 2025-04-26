// frontend/src/pages/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
  Container, Paper, Box, Typography, CircularProgress, Button,
  Tabs, Tab, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadIcon from '@mui/icons-material/Upload';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProfileHeader from '../components/profile/ProfileHeader';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setProfileData({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file || !auth.currentUser?.uid || !profileData?.id) return;

    try {
      const storage = getStorage();
      const fileRef = ref(storage, `resumes/${auth.currentUser.uid}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      await updateDoc(doc(db, 'users', profileData.id), {
        resumeLink: downloadURL,
        resumePath: fileRef.fullPath,
      });

      setProfileData((prev) => ({
        ...prev,
        resumeLink: downloadURL,
        resumePath: fileRef.fullPath,
      }));
    } catch (err) {
      console.error('Resume upload failed:', err);
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Button component={RouterLink} to="/directory" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          Back to Directory
        </Button>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          profileData && (
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <ProfileHeader professorData={profileData} user={auth.currentUser} />

              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="User profile tabs">
                  <Tab label="Profile" />
                </Tabs>
              </Box>

              <Box sx={{ p: 3 }}>
                {auth.currentUser?.uid === profileData.id ? (
                  <Box>
                    <Typography variant="h6" gutterBottom>Resume/CV</Typography>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<UploadIcon />}
                        component="label"
                      >
                        Upload Resume
                        <input
                          type="file"
                          accept=".pdf"
                          hidden
                          onChange={handleUploadResume}
                        />
                      </Button>

                      {profileData.resumeLink && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DescriptionIcon />}
                          href={profileData.resumeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Resume
                        </Button>
                      )}
                    </Stack>
                  </Box>
                ) : (
                  profileData.resumeLink && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Resume/CV</Typography>
                      <Button
                        variant="outlined"
                        component="a"
                        href={profileData.resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<DescriptionIcon />}
                        size="small"
                      >
                        View Document
                      </Button>
                    </Box>
                  )
                )}
              </Box>
            </Paper>
          )
        )}
      </Container>
    </DashboardLayout>
  );
};

export default UserProfilePage;
