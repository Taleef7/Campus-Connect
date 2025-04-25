// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

import DashboardLayout from '../components/dashboard/DashboardLayout';
import EditableField from '../components/common/EditableField';
import EditableTextArea from '../components/common/EditableTextArea';
import FileUploadField from '../components/common/FileUploadField';
import StudentExperienceResearch from '../components/profile/StudentExperienceResearch';
import StudentCoursesEnrolled from '../components/profile/StudentCoursesEnrolled';
import OpportunityFeed from '../components/opportunities/OpportunityFeed';

import { AccountCircle, School, WorkOutline, Star, Edit, Visibility } from '@mui/icons-material';
import { Box, CircularProgress, Typography, Avatar, Button, IconButton } from '@mui/material';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('Profile');
  const [editMode, setEditMode] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const menuItems = [
    { label: 'Profile', icon: <AccountCircle /> },
    { label: 'Research & Interests', icon: <Star /> },
    { label: 'Courses Enrolled', icon: <School /> },
    { label: 'Opportunities Interested In', icon: <WorkOutline /> },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || !currentUser.emailVerified) {
        navigate('/student-login');
        return;
      }
      setUser(currentUser);

      const docRef = doc(db, 'users', currentUser.uid);
      const unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().role === 'student') {
          setStudentData({ id: docSnap.id, ...docSnap.data() });
        } else {
          signOut(auth).then(() => navigate('/student-login'));
        }
        setLoading(false);
      });

      return () => unsubscribeDoc();
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleProfileUpdate = async (data) => {
    if (!user?.uid) return;
    const docRef = doc(db, 'users', user.uid);
    await updateDoc(docRef, data);
  };

  const renderContent = () => {
    if (loading || !studentData) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      );
    }

    switch (selectedMenu) {
      case 'Profile':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 5, flexWrap: 'wrap', px: 2 }}>
            <Box sx={{ flex: 1, minWidth: '300px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Hi, I am {studentData.name || 'Student'}
                </Typography>
                <Box>
                  {studentData.resumeLink && !editMode && (
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      href={studentData.resumeLink}
                      target="_blank"
                      sx={{ mt: 0, textTransform: 'none', fontWeight: 600 }}
                    >
                      View Resume
                    </Button>
                  )}
                  <IconButton onClick={() => setEditMode(!editMode)}>
                    <Edit />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 500, mt: 1 }}>
                {studentData.major || 'Your Department'} {studentData.year ? `(${studentData.year})` : ''}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, maxWidth: '600px', lineHeight: 1.6 }}>
                {studentData.description || 'Write a short description about yourself.'}
              </Typography>
              {editMode && (
                <Box sx={{ mt: 3 }}>
                  <EditableField label="Name" value={studentData.name} onSave={(v) => handleProfileUpdate({ name: v })} />
                  <EditableField label="Major" value={studentData.major} onSave={(v) => handleProfileUpdate({ major: v })} />
                  <EditableField label="Year" value={studentData.year} onSave={(v) => handleProfileUpdate({ year: v })} />
                  <EditableTextArea label="Description / Bio" value={studentData.description || ''} onSave={(v) => handleProfileUpdate({ description: v })} />
                  <FileUploadField
                    label="Resume / CV"
                    filePath={studentData.resumePath}
                    fileUrl={studentData.resumeLink}
                    onSave={(url, path) => handleProfileUpdate({ resumeLink: url, resumePath: path })}
                    onDelete={() => handleProfileUpdate({ resumeLink: '', resumePath: '' })}
                  />
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Avatar
                src={studentData.photoLink || ''}
                alt={studentData.name || 'User'}
                sx={{ width: 200, height: 200, border: '4px solid #fff', boxShadow: 3 }}
              />
            </Box>
          </Box>
        );
      case 'Research & Interests':
        return <StudentExperienceResearch />;
      case 'Courses Enrolled':
        return <StudentCoursesEnrolled />;
      case 'Opportunities Interested In':
        return <OpportunityFeed />;
      default:
        return <Typography>Invalid selection</Typography>;
    }
  };

  return (
    <DashboardLayout
      handleSignOut={handleSignOut}
      selectedMenu={selectedMenu}
      onMenuSelect={setSelectedMenu}
      menuItems={menuItems}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default StudentDashboard;
