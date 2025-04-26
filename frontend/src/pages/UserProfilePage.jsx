import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Container, Paper, Box, Typography, CircularProgress, Button, Stack, Avatar, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const formatExperienceDate = (timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') return 'N/A';
  try {
    return timestamp.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
  } catch (e) {
    return 'Invalid Date';
  }
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '?';
};

const UserProfilePage = () => {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState('profile');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setProfileData({ id: userDoc.id, ...userDoc.data() });
        } else {
          setError('User not found.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch user profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    const fetchExtraData = async () => {
      if (!profileData?.id) return;

      if (page === 'experience') {
        try {
          const q = query(collection(db, 'users', profileData.id, 'experiences'), orderBy('startDate', 'desc'));
          const snapshot = await getDocs(q);
          setExperiences(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
          console.error(err);
        }
      }

      if (page === 'courses' && profileData.role === 'professor') {
        try {
          const q = query(collection(db, 'courses'), where('professorId', '==', profileData.id));
          const snapshot = await getDocs(q);
          setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchExtraData();
  }, [page, profileData]);

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Typography color="error" sx={{ mt: 5, textAlign: 'center' }}>{error}</Typography>
      </DashboardLayout>
    );
  }

  const renderProfileCard = () => (
    <Box sx={{ backgroundColor: '#ffffff', borderRadius: 3, p: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'center', md: 'flex-start' },
        justifyContent: 'center',
        gap: 6
      }}>
        {/* Profile Frame */}
        <Box sx={{
          position: 'relative', width: 320, height: 320, p: 2,
          backgroundColor: '#ffffff', border: '5px solid #0b2545',
          display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, overflow: 'hidden'
        }}>
          {profileData.photoLink ? (
            <img
              src={profileData.photoLink}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
            />
          ) : (
            <Avatar
              sx={{
                width: '100%', height: '100%',
                bgcolor: profileData.role === 'student' ? '#3f72af' : '#f4a261',
                fontSize: '5rem', fontWeight: 'bold', color: '#ffffff'
              }}
            >
              {getInitials(profileData.name)}
            </Avatar>
          )}
        </Box>

        {/* Info Section */}
        <Box sx={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: { xs: 'center', md: 'flex-start' },
          textAlign: { xs: 'center', md: 'left' }
        }}>
          <Typography variant="overline" sx={{ color: '#3f72af', fontWeight: 600 }}>
            {profileData.role === 'student' ? 'STUDENT' : 'PROFESSOR'}
          </Typography>

          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#112d4e' }}>
            {profileData.name}
          </Typography>

          <Stack spacing={1} sx={{ mb: 3 }}>
            {profileData.pronouns && <Typography sx={{ color: '#6c757d' }}><strong>Pronouns:</strong> {profileData.pronouns}</Typography>}
            {profileData.department && <Typography sx={{ color: '#6c757d' }}><strong>Department:</strong> {profileData.department}</Typography>}
            {profileData.about && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#112d4e' }}>About</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap', color: '#6c757d' }}>{profileData.about}</Typography>
              </Box>
            )}
          </Stack>

          {/* Buttons aligned */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}
          >
            {profileData.resumeLink && (
              <Button
                variant="contained"
                href={profileData.resumeLink}
                target="_blank"
                sx={{
                  backgroundColor: '#3f72af', color: '#ffffff', fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#112d4e' },
                  borderRadius: 2, px: 3
                }}
              >
                View Resume
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => setPage('experience')}
              sx={{
                backgroundColor: '#3f72af', color: '#ffffff', fontWeight: 'bold',
                '&:hover': { backgroundColor: '#112d4e' },
                borderRadius: 2, px: 3
              }}
            >
              Experience & Research
            </Button>
            {profileData.role === 'professor' && (
              <Button
                variant="contained"
                onClick={() => setPage('courses')}
                sx={{
                  backgroundColor: '#3f72af', color: '#ffffff', fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#112d4e' },
                  borderRadius: 2, px: 3
                }}
              >
                Courses Offered
              </Button>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  const renderExperience = () => (
    <Stack spacing={2}>
      <IconButton onClick={() => setPage('profile')}><ArrowBackIosNewIcon /></IconButton>
      <Typography variant="h5" fontWeight="bold" sx={{ color: '#112d4e' }}>Experience & Research</Typography>
      {experiences.length === 0 ? (
        <Typography>No experiences added yet.</Typography>
      ) : (
        experiences.map(exp => (
          <Paper key={exp.id} elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: '#3f72af', fontWeight: 'bold' }}>{exp.title}</Typography>
            <Typography variant="body2" sx={{ color: '#6c757d' }}>{exp.organization}</Typography>
            <Typography variant="caption" sx={{ color: '#6c757d' }}>
              {formatExperienceDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatExperienceDate(exp.endDate)}
            </Typography>
            {exp.description && <Typography sx={{ mt: 1, color: '#6c757d' }}>{exp.description}</Typography>}
          </Paper>
        ))
      )}
    </Stack>
  );

  const renderCourses = () => (
    <Stack spacing={2}>
      <IconButton onClick={() => setPage('profile')}><ArrowBackIosNewIcon /></IconButton>
      <Typography variant="h5" fontWeight="bold" sx={{ color: '#112d4e' }}>Courses Offered</Typography>
      {courses.length === 0 ? (
        <Typography>No courses listed yet.</Typography>
      ) : (
        courses.map(course => (
          <Paper key={course.id} elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: '#3f72af', fontWeight: 'bold' }}>{course.courseName}</Typography>
            <Typography variant="body2" sx={{ color: '#6c757d' }}>{course.description}</Typography>
          </Paper>
        ))
      )}
    </Stack>
  );

  return (
    <DashboardLayout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Button component={RouterLink} to="/directory" startIcon={<ArrowBackIcon />} sx={{ mb: 3, color: '#3f72af', fontWeight: 'bold' }}>
          Back to Directory
        </Button>

        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', p: 4, backgroundColor: '#fff' }}>
          {page === 'profile' && renderProfileCard()}
          {page === 'experience' && renderExperience()}
          {page === 'courses' && renderCourses()}
        </Paper>
      </Container>
    </DashboardLayout>
  );
};

export default UserProfilePage;
