import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Avatar, CircularProgress,
  Snackbar, Alert, Slide, Card, CardContent, CardActionArea, CardMedia
} from '@mui/material';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc, onSnapshot, collection, getDocs, updateDoc, setDoc
} from 'firebase/firestore';

import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProfessorCourses from './ProfessorCourses';
import ProfessorExperienceResearch from './ResearchAndInterests';
import OpportunityListItem from '../components/opportunities/OpportunityListItem';
import AddOpportunityForm from '../components/opportunities/AddOpportunityForm';
import InterestedStudentsDialog from '../components/opportunities/InterestedStudentsDialog';

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
    if (!user) return;
    const fetchOpportunities = async () => {
      const snapshot = await getDocs(collection(db, 'opportunities'));
      const list = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(opp => opp.professorId === user.uid);
      setOpportunities(list);
    };
    fetchOpportunities();
  }, [user]);

  const handleSaveOpportunity = async (data) => {
    try {
      if (data.id) {
        const ref = doc(db, 'opportunities', data.id);
        await updateDoc(ref, data);
      } else {
        const newRef = doc(collection(db, 'opportunities'));
        await setDoc(newRef, { ...data, id: newRef.id });
      }
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
            <Paper elevation={3} sx={{ width: '100%', p: 3, mb: 3, borderRadius: 4, textAlign: 'center', backgroundColor: '#fff' }}>
              <Avatar src={professorData?.photoLink} sx={{ width: 100, height: 100, mx: 'auto', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">{professorData?.name}</Typography>
              <Typography variant="body2" color="text.secondary">Professor</Typography>
            </Paper>
            <Paper elevation={3} sx={{ width: '100%', p: 3, borderRadius: 4, backgroundColor: '#fff' }}>
              <Typography variant="subtitle2" color="text.secondary">Title</Typography>
              <Typography>{professorData?.headline || '—'}</Typography>
              <Typography variant="subtitle2" color="text.secondary" mt={2}>Pronouns</Typography>
              <Typography>{professorData?.pronouns || '—'}</Typography>
              <Typography variant="subtitle2" color="text.secondary" mt={2}>Department</Typography>
              <Typography>{professorData?.department || '—'}</Typography>
              <Typography variant="subtitle2" color="text.secondary" mt={2}>About</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{professorData?.about || '—'}</Typography>
            </Paper>
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
              {/* Hero Image */}
              <Paper
                elevation={3}
                sx={{
                  height: 240,
                  mb: 3,
                  borderRadius: 4,
                  backgroundImage: `url(${professorData.coverLink})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {!professorData.coverLink && (
                  <Typography variant="h5" color="white" sx={{ backdropFilter: 'blur(4px)', px: 2 }}>
                    Welcome, {professorData.name || 'Professor'}
                  </Typography>
                )}
              </Paper>

              {/* Navigation Cards */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                {tabTitles.map((title, index) => (
                  <Card key={index} sx={{ width: 240, borderRadius: 3 }}>
                    <CardActionArea onClick={() => setTabValue(index)}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={
                          index === 0
                            ? 'https://cdn-icons-png.flaticon.com/512/3382/3382703.png'
                            : index === 1
                            ? 'https://cdn-icons-png.flaticon.com/512/1159/1159633.png'
                            : 'https://cdn-icons-png.flaticon.com/512/3595/3595455.png'
                        }
                        alt={title}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h6" component="div">
                          {title}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            </>
          ) : (
            <Slide direction="up" in={tabValue !== null} mountOnEnter unmountOnExit>
              <Box>
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
                    {opportunities.length === 0 ? (
                      <Typography>You haven't posted any opportunities yet.</Typography>
                    ) : (
                      opportunities.map(opp => (
                        <OpportunityListItem
                          key={opp.id}
                          opportunity={opp}
                          onEdit={handleEditOpportunity}
                          onViewInterested={handleViewInterested}
                          viewMode="professor"
                        />
                      ))
                    )}
                  </>
                )}
              </Box>
            </Slide>
          )}
        </Box>
      </Box>

      {/* Form Dialog */}
      {showForm && (
        <AddOpportunityForm
          open={showForm}
          onClose={() => { setShowForm(false); setEditingOpportunity(null); }}
          onSave={handleSaveOpportunity}
          professorId={user?.uid}
          initialData={editingOpportunity}
        />
      )}

      {/* View Interested Dialog */}
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
