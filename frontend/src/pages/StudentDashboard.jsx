import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, CircularProgress, Slide,
  Card, CardContent, CardActionArea, CardMedia
} from '@mui/material';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import imageCompression from 'browser-image-compression'; // ✅ Importing image compression

import DashboardLayout from '../components/dashboard/DashboardLayout';
import StudentCoursesEnrolled from '../components/profile/StudentCoursesEnrolled';
import StudentExperienceResearch from '../components/profile/StudentExperienceResearch';
import OpportunityFeed from '../components/opportunities/OpportunityFeed';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileInfoSection from '../components/profile/ProfileInfoSection';

import expImg from '../assets/exp.jpeg';
import coursesImg from '../assets/courses.jpeg';
import oppImg from '../assets/opp.jpeg';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [tabValue, setTabValue] = useState(null);

  const tabTitles = ['Experience & Research', 'Courses Enrolled', 'Opportunities Interested'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
        const docRef = doc(db, 'users', currentUser.uid);
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setStudentData({ id: docSnap.id, ...docSnap.data() });
          }
        });
      } else {
        signOut(auth);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid || !studentData?.id) return;

    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;

        await updateDoc(doc(db, 'users', studentData.id), {
          coverLink: base64,
        });

        console.log("✅ Cover uploaded successfully.");
        window.location.reload();
      };

      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error("❌ Error compressing/uploading student cover:", err);
    }
  };

  if (!studentData) return <CircularProgress />;

  return (
    <DashboardLayout dashboardPath="/student-dashboard" handleSignOut={() => signOut(auth)}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Box sx={{ width: 320, backgroundColor: '#f3f3f3', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box width="100%">
            <ProfileHeader professorData={studentData} user={user} />
            <ProfileInfoSection professorData={studentData} user={user} />
          </Box>

          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 4 }}
            fullWidth
            onClick={() => signOut(auth).then(() => window.location.href = '/')}
          >
            Sign Out
          </Button>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 4, backgroundColor: '#f9f9f9' }}>
          {tabValue === null ? (
            <>
              {/* Cover Image Section */}
              <Box sx={{ position: 'relative', height: 240, mb: 3, borderRadius: 4, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${studentData.coverLink || 'https://source.unsplash.com/1600x400/?university'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 4,
                  }}
                />
                <input
                  type="file"
                  accept="image/*"
                  id="cover-upload"
                  style={{ display: 'none' }}
                  onChange={handleCoverUpload}
                />
                <Button
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    fontSize: 10,
                    backgroundColor: 'white',
                    minWidth: 'auto',
                    padding: '4px 8px',
                    borderRadius: 2,
                    boxShadow: 1,
                  }}
                  onClick={() => document.getElementById('cover-upload').click()}
                >
                  🖼️
                </Button>
              </Box>

              {/* Dashboard Cards */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                {[expImg, coursesImg, oppImg].map((img, index) => (
                  <Card key={index} sx={{ width: 240, borderRadius: 3 }}>
                    <CardActionArea onClick={() => setTabValue(index)}>
                      <CardMedia component="img" height="140" image={img} alt={tabTitles[index]} />
                      <CardContent>
                        <Typography gutterBottom variant="h6">{tabTitles[index]}</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            </>
          ) : (
            <Slide direction="up" in={tabValue !== null} mountOnEnter unmountOnExit>
              <Box>
                <Typography variant="h5" fontWeight="bold" mb={2}>
                  {tabTitles[tabValue]}
                </Typography>
                <Button onClick={() => setTabValue(null)} sx={{ mb: 2 }}>← Back</Button>

                {tabValue === 0 && <StudentExperienceResearch studentData={studentData} />}
                {tabValue === 1 && <StudentCoursesEnrolled />}
                {tabValue === 2 && <OpportunityFeed viewMode="interestedOnly" />}
              </Box>
            </Slide>
          )}
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default StudentDashboard;
