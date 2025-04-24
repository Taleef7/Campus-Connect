// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProfileHeader from '../components/profile/ProfileHeader';
import EditableField from '../components/common/EditableField';
import EditableTextArea from '../components/common/EditableTextArea';
import FileUploadField from '../components/common/FileUploadField';
import StudentExperienceResearch from '../components/profile/StudentExperienceResearch';
import StudentCoursesEnrolled from '../components/profile/StudentCoursesEnrolled';
import OpportunityFeed from '../components/opportunities/OpportunityFeed';

import { AccountCircle, School, WorkOutline, Star } from '@mui/icons-material';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('Profile');

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
          <Paper elevation={2} sx={{ borderRadius: 2, p: 3, backgroundColor: '#fff', boxShadow: '0px 4px 16px rgba(0,0,0,0.05)' }}>
            <ProfileHeader
              coverLink={studentData.coverLink}
              photoLink={studentData.photoLink}
              professorName={studentData.name}
              onEditCover={() => {}}
              onEditPhoto={() => {}}
              onViewCover={() => {}}
              onViewPhoto={() => {}}
            />
            <Box sx={{ mt: 2 }}>
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
          </Paper>
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 0, mt: 0, width: '100%' }}>
        <Box sx={{ flexGrow: 1, maxWidth: '960px' }}>
          {renderContent()}
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default StudentDashboard;
