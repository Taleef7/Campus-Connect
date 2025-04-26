import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, CircularProgress,
  Snackbar, Alert, Slide, Card, CardContent, CardActionArea, CardMedia
} from '@mui/material';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc, onSnapshot, collection, getDocs, updateDoc, setDoc, deleteDoc, query, where
} from 'firebase/firestore';
import imageCompression from 'browser-image-compression';

import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProfessorCourses from './ProfessorCourses';
import ProfessorExperienceResearch from './ResearchAndInterests';
import OpportunityListItem from '../components/opportunities/OpportunityListItem';
import AddOpportunityForm from '../components/opportunities/AddOpportunityForm';
import InterestedStudentsDialog from '../components/opportunities/InterestedStudentsDialog';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileInfoSection from '../components/profile/ProfileInfoSection';

import expImg from '../assets/exp.jpeg';
import coursesImg from '../assets/courses.jpeg';
import oppImg from '../assets/opp.jpeg';

const ProfessorDashboard = () => {
  const [user, setUser] = useState(null);
  const [professorData, setProfessorData] = useState(null);
  const [tabValue, setTabValue] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
  const [selectedOpportunityTitle, setSelectedOpportunityTitle] = useState('');

  const tabTitles = ['Experience & Research', 'Courses Offered', 'Opportunities'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
        const docRef = doc(db, 'users', currentUser.uid);
        onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfessorData({ id: docSnap.id, ...docSnap.data() });
          }
        });
      } else {
        signOut(auth);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchOpportunities(user.uid);
  }, [user]);

  const fetchOpportunities = async (professorId) => {
    try {
      const q = query(collection(db, 'opportunities'), where('professorId', '==', professorId));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOpportunities(list);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    }
  };

  const handleSaveOpportunity = async (data) => {
    try {
      if (data.id) {
        const ref = doc(db, 'opportunities', data.id);
        await updateDoc(ref, {
          ...data,
          professorId: user.uid
        });
      } else {
        const newRef = doc(collection(db, 'opportunities'));
        await setDoc(newRef, {
          ...data,
          id: newRef.id,
          professorId: user.uid,
          createdAt: new Date()
        });
      }

      await fetchOpportunities(user.uid);
      setShowForm(false);
      setEditingOpportunity(null);
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error saving opportunity:", err);
    }
  };

  const handleEditOpportunity = (opportunity) => {
    setEditingOpportunity(opportunity);
    setShowForm(true);
  };

  const handleDeleteOpportunity = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this opportunity?');
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'opportunities', id));
      await fetchOpportunities(user.uid);
    } catch (err) {
      console.error('Failed to delete opportunity:', err);
    }
  };

  const handleViewInterested = (opportunityId) => {
    const opp = opportunities.find(o => o.id === opportunityId);
    setSelectedOpportunityId(opportunityId);
    setSelectedOpportunityTitle(opp?.title || '');
  };

  const handleCloseInterested = () => {
    setSelectedOpportunityId(null);
    setSelectedOpportunityTitle('');
  };

  if (!professorData) return <CircularProgress />;

  return (
    <DashboardLayout dashboardPath="/professor-dashboard" handleSignOut={() => signOut(auth)}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Box sx={{ width: 320, backgroundColor: '#f3f3f3', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box width="100%">
            <ProfileHeader professorData={professorData} user={user} />
            <ProfileInfoSection professorData={professorData} user={user} />
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
              {/* Cover Image with Edit */}
              <Box sx={{ position: 'relative', height: 240, mb: 3, borderRadius: 4, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${professorData.coverLink})`,
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
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file || !user?.uid || !professorData?.id) {
                      console.error("Missing file or user info");
                      return;
                    }

                    try {
                      // Compress the image
                      const options = {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 800,
                        useWebWorker: true,
                      };
                      const compressedFile = await imageCompression(file, options);

                      // Convert to base64
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        const base64 = reader.result;

                        await updateDoc(doc(db, 'users', professorData.id), {
                          coverLink: base64
                        });

                        setProfessorData((prev) => ({
                          ...prev,
                          coverLink: base64
                        }));

                        console.log("✅ Cover image uploaded to Firestore (base64).");
                      };
                      reader.readAsDataURL(compressedFile);
                    } catch (err) {
                      console.error("❌ Error compressing or uploading cover image:", err);
                    }
                  }}
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

              {/* Dashboard cards */}
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
                {tabValue === 0 && <ProfessorExperienceResearch professorData={professorData} />}
                {tabValue === 1 && <ProfessorCourses />}
                {tabValue === 2 && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <Button variant="contained" onClick={() => { setShowForm(true); setEditingOpportunity(null); }}>
                        + Post New Opportunity
                      </Button>
                    </Box>
                    {opportunities.map((opp) => (
                      <OpportunityListItem
                        key={opp.id}
                        opportunity={opp}
                        onEdit={handleEditOpportunity}
                        onDelete={handleDeleteOpportunity}
                        onViewInterested={handleViewInterested}
                        viewMode="professor"
                      />
                    ))}
                  </>
                )}
              </Box>
            </Slide>
          )}
        </Box>
      </Box>

      <AddOpportunityForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingOpportunity(null); }}
        onSave={handleSaveOpportunity}
        professorId={user?.uid}
        initialData={editingOpportunity}
      />

      <InterestedStudentsDialog
        open={Boolean(selectedOpportunityId)}
        onClose={handleCloseInterested}
        opportunityId={selectedOpportunityId}
        opportunityTitle={selectedOpportunityTitle}
        professorId={user?.uid}
      />

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="success" variant="filled">Opportunity saved successfully!</Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default ProfessorDashboard;
