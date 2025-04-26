import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container, Paper, Box, Typography, CircularProgress, Button,
  Stack, Avatar, Grid, IconButton
} from '@mui/material';
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

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
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
    return <DashboardLayout><Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress /></Box></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout><Typography color="error" sx={{ mt: 5, textAlign: 'center' }}>{error}</Typography></DashboardLayout>;
  }

  const renderProfileCard = () => (
    <Box sx={{ backgroundColor: '#E8C999', borderRadius: 3, p: 4, minHeight: 480 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ position: 'relative', width: 320, height: 320, p: 1, border: '12px solid #8E1616', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 3 }}>
          {profileData.photoLink ? (
            <img src={profileData.photoLink} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
          ) : (
            <Avatar sx={{ width: '100%', height: '100%', fontSize: '5rem' }}>{profileData.name?.[0] || '?'}</Avatar>
          )}
        </Box>

        <Box sx={{ mt: { xs: 4, md: 0 }, ml: { md: 4 }, flex: 1 }}>
          <Typography variant="overline" sx={{ color: '#8E1616', fontWeight: 500 }}>
            {profileData.role === 'student' ? 'Student' : 'Professor'}
          </Typography>

          <Typography variant="h4" fontWeight="bold" gutterBottom color="#000000">
            {profileData.name}
          </Typography>

          <Stack spacing={1} sx={{ mb: 3 }}>
            {profileData.pronouns && <Typography color="#000000"><strong>Pronouns:</strong> {profileData.pronouns}</Typography>}
            {profileData.department && <Typography color="#000000"><strong>Department:</strong> {profileData.department}</Typography>}
            {profileData.about && (
              <Box>
                <Typography fontWeight="medium" gutterBottom color="#8E1616">About</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }} color="#000000">{profileData.about}</Typography>
              </Box>
            )}
          </Stack>

          <Stack direction="row" spacing={2} flexWrap="nowrap">
            {profileData.resumeLink && (
              <Button variant="contained" sx={{ backgroundColor: '#8E1616', '&:hover': { backgroundColor: '#000000' }, borderRadius: 2, color: '#F8EEDF' }} onClick={() => window.open(profileData.resumeLink, '_blank')}>
                View Resume
              </Button>
            )}
            <Button variant="contained" onClick={() => setPage('experience')} sx={{ backgroundColor: '#8E1616', '&:hover': { backgroundColor: '#000000' }, borderRadius: 2, color: '#F8EEDF' }}>
              Experience & Research
            </Button>
            {profileData.role === 'professor' && (
              <Button variant="contained" onClick={() => setPage('courses')} sx={{ backgroundColor: '#8E1616', '&:hover': { backgroundColor: '#000000' }, borderRadius: 2, color: '#F8EEDF' }}>
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
      <Typography variant="h5" fontWeight="bold" color="#8E1616">Experience & Research</Typography>
      {experiences.length === 0 ? (
        <Typography>No experiences added yet.</Typography>
      ) : (
        experiences.map(exp => (
          <Paper key={exp.id} variant="outlined" sx={{ p: 2, backgroundColor: '#F8EEDF', borderLeft: '5px solid #E8C999' }}>
            <Typography variant="h6" color="#8E1616">{exp.title}</Typography>
            <Typography variant="body2" color="#000000">{exp.organization}</Typography>
            <Typography variant="caption" color="#000000">
              {formatExperienceDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatExperienceDate(exp.endDate)}
            </Typography>
            {exp.description && <Typography sx={{ mt: 1 }} color="#000000">{exp.description}</Typography>}
            {exp.link && <Button size="small" href={exp.link} target="_blank" sx={{ mt: 1, color: '#8E1616' }}>Visit Link</Button>}
          </Paper>
        ))
      )}
    </Stack>
  );

  const renderCourses = () => (
    <Stack spacing={2}>
      <IconButton onClick={() => setPage('profile')}><ArrowBackIosNewIcon /></IconButton>
      <Typography variant="h5" fontWeight="bold" color="#8E1616">Courses Offered</Typography>
      {courses.length === 0 ? (
        <Typography>No courses listed yet.</Typography>
      ) : (
        courses.map(course => (
          <Paper key={course.id} variant="outlined" sx={{ p: 2, backgroundColor: '#F8EEDF', borderLeft: '5px solid #E8C999' }}>
            <Typography variant="h6" color="#8E1616">{course.courseName}</Typography>
            <Typography variant="body2" color="#000000">{course.description}</Typography>
            {course.link && <Button size="small" href={course.link} target="_blank" sx={{ mt: 1, color: '#8E1616' }}>Go to Course</Button>}
          </Paper>
        ))
      )}
    </Stack>
  );

  return (
    <DashboardLayout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Button component={RouterLink} to="/directory" startIcon={<ArrowBackIcon />} sx={{ mb: 2, color: '#8E1616' }}>
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