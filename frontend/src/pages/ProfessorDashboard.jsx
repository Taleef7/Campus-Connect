import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Tabs, Tab, Paper, CircularProgress, Avatar, Container, 
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider, Stack 
} from '@mui/material';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, addDoc, Timestamp, query, where, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '../firebase';

import ProfessorCourses from "./ProfessorCourses";
import ProfessorResearch from './ResearchAndInterests';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProfileHeader from '../components/profile/ProfileHeader';

import ProfileInfoSection from '../components/profile/ProfileInfoSection'; 
import AddOpportunityForm from '../components/opportunities/AddOpportunityForm'; 
import OpportunityListItem from '../components/opportunities/OpportunityListItem'; 
import InterestedStudentsDialog from '../components/opportunities/InterestedStudentsDialog';
import ProfessorExperienceResearch from '../components/profile/ProfessorExperienceResearch';

// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// TabPanel helper component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// a11yProps helper function
function a11yProps(index) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

const ProfessorDashboard = () => {
  // --- State Variables ---
  const [user, setUser] = useState(null);
  const [professorData, setProfessorData] = useState(null);
  const [uiLoading, setUiLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); 
  const [tabValue, setTabValue] = useState(0);

  // Modals & Photo/Cover Files State
  const [editPhotoMode, setEditPhotoMode] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [viewPhotoMode, setViewPhotoMode] = useState(false);
  const [editCoverMode, setEditCoverMode] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [viewCoverMode, setViewCoverMode] = useState(false);
  

  // --- State for Add Opportunity Dialog ---
  const [isAddOppDialogOpen, setAddOppDialogOpen] = useState(false);
  const [opportunities, setOpportunities] = useState([]); 
  const [loadingOpportunities, setLoadingOpportunities] = useState(true); 
  const [editingOpportunity, setEditingOpportunity] = useState(null); 
  // --- End State --

  // --- State for Interested Students Dialog ---
  const [isInterestedDialogOpen, setIsInterestedDialogOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);
  const [selectedOpportunityTitle, setSelectedOpportunityTitle] = useState('');
  // --- End State ---

  // --- Hooks ---
  const navigate = useNavigate();
  const storage = getStorage(app);

  // +++ UPDATED useEffect for Realtime Professor Data +++
  useEffect(() => {
    setUiLoading(true);
    let firestoreUnsubscribe = () => {}; 

    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
        
        firestoreUnsubscribe();

        if (!currentUser) {
            navigate('/professor-login');
            setUiLoading(false);
            setUser(null);
            setProfessorData(null);
            return;
        }
        if (!currentUser.emailVerified) {
             console.warn(`User ${currentUser.uid} email not verified.`);
             navigate('/professor-login');
             setUiLoading(false);
             setUser(null);
             setProfessorData(null);
             return;
        }

        setUser(currentUser);

        const docRef = doc(db, 'users', currentUser.uid);
        firestoreUnsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
  
                if (data.role !== 'professor') {
                    console.warn(`User ${currentUser.uid} is not a professor.`);
                    signOut(auth).then(() => navigate('/professor-login'));
                    setProfessorData(null);
                } else {
                    
                    setProfessorData({ id: docSnap.id, ...data });
                }
            } else {
                console.error("Firestore document missing for professor:", currentUser.uid);
                setErrorMsg("Error loading profile data.");
                signOut(auth).then(() => navigate('/professor-login'));
                setProfessorData(null);
            }
            setUiLoading(false);
        }, (error) => {
            console.error("Error listening to professor data:", error);
            setErrorMsg("Failed to load profile in real-time.");
            setProfessorData(null);
            setUiLoading(false);
        });
    });

    return () => {
        authUnsubscribe();
        firestoreUnsubscribe();
    };
}, [navigate]); 


  useEffect(() => {
    if (!user) {
        console.log("Opportunity Fetch Effect: No user, skipping fetch.");

        setLoadingOpportunities(false);
        setOpportunities([]); 
        return;
    };

    console.log(`Opportunity Fetch Effect: Setting up listener for user ${user.uid}`);
    setLoadingOpportunities(true);
    const opportunitiesCollectionRef = collection(db, 'opportunities');
    const q = query(
        opportunitiesCollectionRef,
        where('professorId', '==', user.uid),
        orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        // --- Log inside snapshot callback ---
        console.log(`onSnapshot triggered: Found ${querySnapshot.size} opportunities.`);
        const fetchedOpportunities = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        console.log("Fetched data:", fetchedOpportunities);
        setOpportunities(fetchedOpportunities); 
        console.log("setOpportunities called.");
        setLoadingOpportunities(false);
        console.log("setLoadingOpportunities(false) called.");
        // --- End logging inside callback ---
    }, (error) => {
        console.error("Error fetching opportunities via onSnapshot:", error);
        setLoadingOpportunities(false);
    });

    return () => {
        console.log("Opportunity Fetch Effect: Cleaning up listener.");
        unsubscribe();
    };

  }, [user]); 
  // --- End Opportunity Fetch Effect ---


  // --- Event Handlers ---
  const handleSignOut = async () => {
    try { await signOut(auth); navigate('/'); } catch (error) { console.error("Sign out error:", error); }
  };

  const handleTabChange = (event, newValue) => { setTabValue(newValue); };

  const handleNameSave = async (newName) => {
    if (!user?.uid || !newName.trim()) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { name: newName.trim() });
      setProfessorData((prev) => ({ ...prev, name: newName.trim() }));
    } catch (error) { console.error('Error updating name:', error); alert(`Error saving name: ${error.message}`); }
    finally { setIsSaving(false); }
  };
  const handleHeadlineSave = async (newHeadline) => {
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { headline: newHeadline });
      setProfessorData((prev) => ({ ...prev, headline: newHeadline }));
    } catch (error) { console.error('Error updating headline:', error); alert(`Error saving headline: ${error.message}`);}
    finally { setIsSaving(false); }
  };
  const handlePronounsSave = async (newPronouns) => {
     if (!user?.uid) return;
     setIsSaving(true);
     try {
       const docRef = doc(db, 'users', user.uid);
       await updateDoc(docRef, { pronouns: newPronouns });
       setProfessorData((prev) => ({ ...prev, pronouns: newPronouns }));
     } catch (error) { console.error('Error updating pronouns:', error); alert(`Error saving pronouns: ${error.message}`); }
     finally { setIsSaving(false); }
  };
  const handleAboutSave = async (newAbout) => {
      if (!user?.uid) return;
      setIsSaving(true);
      try {
          const docRef = doc(db, 'users', user.uid);
          await updateDoc(docRef, { about: newAbout });
          setProfessorData((prev) => ({ ...prev, about: newAbout }));
      } catch (error) { console.error('Error updating about:', error); alert(`Error saving about section: ${error.message}`);}
      finally { setIsSaving(false); }
  };
  const handleResumeSave = async (newResumeFile) => {
    if (!user?.uid || !newResumeFile) return;
    setIsSaving(true);
    const oldPath = professorData?.resumePath;
    const newPath = `resumes/${user.uid}/${Date.now()}_${newResumeFile.name}`;
    try {
        const docRef = doc(db, 'users', user.uid);
        if (oldPath) { const oldRef = ref(storage, oldPath); await deleteObject(oldRef).catch(err => console.warn("Old resume delete failed:", err)); }
        const storageRef = ref(storage, newPath);
        await uploadBytes(storageRef, newResumeFile);
        const downloadURL = await getDownloadURL(storageRef);
        await updateDoc(docRef, { resumeLink: downloadURL, resumePath: newPath });
        setProfessorData((prev) => ({ ...prev, resumeLink: downloadURL, resumePath: newPath }));
    } catch (error) { console.error('Error uploading resume:', error); alert(`Error uploading resume: ${error.message}`); }
    finally { setIsSaving(false); }
  };
  const handleResumeDelete = async () => {
     const pathToDelete = professorData?.resumePath;
     if (!user?.uid || !pathToDelete) return;
     if (!window.confirm('Are you sure you want to delete the resume?')) return; // Added confirmation
     setIsSaving(true);
     try {
         const docRef = doc(db, 'users', user.uid);
         const storageRef = ref(storage, pathToDelete);
         await deleteObject(storageRef);
         await updateDoc(docRef, { resumeLink: '', resumePath: '' });
         setProfessorData((prev) => ({ ...prev, resumeLink: '', resumePath: '' }));
     } catch (error) { console.error('Error removing resume:', error); alert(`Error removing resume: ${error.message}`); }
     finally { setIsSaving(false); }
  };

  // +++ Add Handler for Department +++
  const handleDepartmentSave = async (newDepartment) => {
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      const departmentToSave = newDepartment.trim();
      await updateDoc(docRef, { department: departmentToSave });
      setProfessorData((prev) => ({ ...prev, department: departmentToSave }));
      console.log("Department updated successfully!");
    } catch (error) {
      console.error('Error updating department:', error);
      alert(`Error saving department: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  // +++ End Department Handler +++


  // Modal Trigger Handlers
  const handleTriggerViewPhoto = () => { (professorData?.photoLink) ? setViewPhotoMode(true) : handleTriggerEditPhoto(); };
  const handleTriggerEditPhoto = () => { setEditPhotoMode(true); setPhotoFile(null); setViewPhotoMode(false); };
  const handleTriggerViewCover = () => { (professorData?.coverLink) ? setViewCoverMode(true) : handleTriggerEditCover(); };
  const handleTriggerEditCover = () => { setEditCoverMode(true); setCoverFile(null); setViewCoverMode(false); };

  // Photo/Cover File Handlers (Used by Modals)
  const handlePhotoFileChange = (e) => { if (e.target.files && e.target.files[0]) { setPhotoFile(e.target.files[0]); } };
  const handlePhotoCancel = () => { setEditPhotoMode(false); setPhotoFile(null); };
  const handlePhotoSave = async () => {
    if (!user?.uid || !photoFile) return;
    setIsSaving(true);
    const oldPath = professorData?.photoPath;
    const newPath = `photos/${user.uid}/${Date.now()}_${photoFile.name}`;
    try {
      const docRef = doc(db, 'users', user.uid);
      if (oldPath) { const oldRef = ref(storage, oldPath); await deleteObject(oldRef).catch(err => console.warn("Old photo delete failed:", err)); }
      const storageRef = ref(storage, newPath);
      await uploadBytes(storageRef, photoFile);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(docRef, { photoLink: downloadURL, photoPath: newPath });
      setProfessorData((prev) => ({ ...prev, photoLink: downloadURL, photoPath: newPath }));
      setEditPhotoMode(false); setPhotoFile(null);
    } catch (error) { console.error('Error uploading photo:', error); alert(`Error uploading photo: ${error.message}`);}
    finally { setIsSaving(false); }
  };
  const handlePhotoDelete = async () => {
    const pathToDelete = professorData?.photoPath;
    if (!user?.uid || !pathToDelete) return;
     if (!window.confirm('Are you sure you want to delete the profile photo?')) return; 
    setIsSaving(true);
    try {
        const docRef = doc(db, 'users', user.uid);
        const storageRef = ref(storage, pathToDelete);
        await deleteObject(storageRef);
        await updateDoc(docRef, { photoLink: '', photoPath: '' });
        setProfessorData((prev) => ({ ...prev, photoLink: '', photoPath: '' }));
        setEditPhotoMode(false); setViewPhotoMode(false); setPhotoFile(null);
    } catch (error) { console.error('Error removing photo:', error); alert(`Error removing photo: ${error.message}`); }
    finally { setIsSaving(false); }
  };
  const handleCoverFileChange = (e) => { if (e.target.files && e.target.files[0]) { setCoverFile(e.target.files[0]); } };
  const handleCoverCancel = () => { setEditCoverMode(false); setCoverFile(null); };
  const handleCoverSave = async () => {
    if (!user?.uid || !coverFile) return;
    setIsSaving(true);
    const oldPath = professorData?.coverPath;
    const newPath = `covers/${user.uid}/${Date.now()}_${coverFile.name}`;
    try {
        const docRef = doc(db, 'users', user.uid);
        if (oldPath) { const oldRef = ref(storage, oldPath); await deleteObject(oldRef).catch(err => console.warn("Old cover delete failed:", err)); }
        const storageRef = ref(storage, newPath);
        await uploadBytes(storageRef, coverFile);
        const downloadURL = await getDownloadURL(storageRef);
        await updateDoc(docRef, { coverLink: downloadURL, coverPath: newPath });
        setProfessorData((prev) => ({ ...prev, coverLink: downloadURL, coverPath: newPath }));
        setEditCoverMode(false); setCoverFile(null);
    } catch (error) { console.error('Error uploading cover:', error); alert(`Error uploading cover: ${error.message}`); }
    finally { setIsSaving(false); }
  };
  const handleCoverDelete = async () => {
     const pathToDelete = professorData?.coverPath;
     if (!user?.uid || !pathToDelete) return;
      if (!window.confirm('Are you sure you want to delete the cover photo?')) return;
     setIsSaving(true);
     try {
         const docRef = doc(db, 'users', user.uid);
         const storageRef = ref(storage, pathToDelete);
         await deleteObject(storageRef);
         await updateDoc(docRef, { coverLink: '', coverPath: '' });
         setProfessorData((prev) => ({ ...prev, coverLink: '', coverPath: '' }));
         setEditCoverMode(false); setViewCoverMode(false); setCoverFile(null);
     } catch (error) { console.error('Error removing cover:', error); alert(`Error removing cover: ${error.message}`); }
     finally { setIsSaving(false); }
  };

  // --- Opportunity Handlers ---
  const handleOpenAddOpportunityDialog = () => {
    setEditingOpportunity(null); 
    setAddOppDialogOpen(true);
  };
  const handleOpenEditOpportunityDialog = (opportunity) => {
      setEditingOpportunity(opportunity);
      setAddOppDialogOpen(true); 
  };
  const handleCloseOpportunityDialog = () => {
    setAddOppDialogOpen(false);
    setEditingOpportunity(null); 
  };

  const handleSaveOpportunity = async (formData) => { 
      if (!user || !professorData) return;
      setIsProcessing(true);
      try {
          const docData = {
              ...formData, 
              professorId: user.uid,
              professorName: professorData.name || 'Unknown',
              department: professorData.department || '',
          };

          if (editingOpportunity) {
              const docRef = doc(db, 'opportunities', editingOpportunity.id);
              
              await updateDoc(docRef, docData);
              console.log("Opportunity updated successfully!");
          } else {
              
              docData.createdAt = Timestamp.now();
              const opportunitiesCollectionRef = collection(db, 'opportunities');
              await addDoc(opportunitiesCollectionRef, docData);
              console.log("Opportunity added successfully!");
          }

          handleCloseOpportunityDialog(); 

      } catch (error) {
          console.error("Error saving opportunity:", error);
          alert(`Failed to save opportunity: ${error.message}`);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleDeleteOpportunity = async (opportunityId) => {
      if (!opportunityId) return;
      if (!window.confirm('Are you sure you want to delete this opportunity post?')) return;
      setIsProcessing(true);
      try {
          const docRef = doc(db, 'opportunities', opportunityId);
          await deleteDoc(docRef);
          console.log("Opportunity deleted successfully!");

      } catch (error) {
          console.error("Error deleting opportunity:", error);
          alert(`Failed to delete opportunity: ${error.message}`);
      } finally {
          setIsProcessing(false);
      }
  };

  // --- Updated View Interested Handler ---
  const handleViewInterested = (opportunityId) => {
      const selectedOpp = opportunities.find(opp => opp.id === opportunityId);
      setSelectedOpportunityTitle(selectedOpp?.title || ''); 
      setSelectedOpportunityId(opportunityId); 
      setIsInterestedDialogOpen(true); 
      console.log("Opening interested students dialog for:", opportunityId);
  };
  const handleCloseInterestedDialog = () => {
      setIsInterestedDialogOpen(false);
      setSelectedOpportunityId(null);
      setSelectedOpportunityTitle('');
  };
  // --- End Opportunity Handlers ---

  // --- Render Logic ---
  if (uiLoading) {
    return ( <DashboardLayout> <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}> <CircularProgress /> </Box> </DashboardLayout> );
  }

  if (!professorData) {
    return ( <DashboardLayout><Typography>Error loading data or unauthorized.</Typography></DashboardLayout>);
  }

  const photoLink = professorData?.photoLink || '';
  const coverLink = professorData?.coverLink || '';

  // --- Log state right before render ---
  console.log("ProfessorDashboard Rendering:", { loadingOpportunities, opportunitiesCount: opportunities.length });
  const tabHoverSx = {
    borderRadius: 1, 
    '&:hover': {
        backgroundColor: 'action.hover', 
    },
  };

  return (
    <DashboardLayout>
       <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
              <Box sx={{ mb: 5, textAlign: 'center' }}>
              {professorData && ( <Typography variant="h5" color="text.secondary"> Welcome, {professorData.name || 'Professor'}! </Typography> )}
              </Box>

      <Paper elevation={3} sx={{ borderRadius: 3, position: 'relative' }}>
         {isSaving && (<Box sx={{ /* ... Saving overlay ... */ }}> <CircularProgress /> </Box>)}

        <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth" 
            aria-label="Professor Dashboard Tabs"
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Profile" {...a11yProps(0)} sx={tabHoverSx}/>
          <Tab label="Experience" {...a11yProps(1)} sx={tabHoverSx}/>
          <Tab label="Courses" {...a11yProps(2)} sx={tabHoverSx}/>
          <Tab label="Opportunities" {...a11yProps(3)} sx={tabHoverSx}/> 
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <ProfileHeader
             coverLink={coverLink}
             photoLink={photoLink}
             professorName={professorData?.name}
             onEditCover={handleTriggerEditCover}
             onViewCover={handleTriggerViewCover}
             onEditPhoto={handleTriggerEditPhoto}
             onViewPhoto={handleTriggerViewPhoto}
          />
          {/* --- Render ProfileInfoSection --- */}
          <ProfileInfoSection
            professorData={professorData}
            isSaving={isSaving}
            handleNameSave={handleNameSave}
            handleHeadlineSave={handleHeadlineSave}
            handlePronounsSave={handlePronounsSave}
            handleAboutSave={handleAboutSave}
            handleResumeSave={handleResumeSave}
            handleResumeDelete={handleResumeDelete}
            handleDepartmentSave={handleDepartmentSave}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
           {professorData && <ProfessorExperienceResearch professorData={professorData} />}
        </TabPanel>
        <TabPanel value={tabValue} index={2}> <ProfessorCourses /> </TabPanel>
        <TabPanel value={tabValue} index={3}>
            <Box sx={{p:2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                 <Typography variant="h5" gutterBottom>My Posted Opportunities</Typography>
                 <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddOpportunityDialog} disabled={isSaving || isProcessing} > Post New Opportunity </Button>
            </Box>

            {loadingOpportunities ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}> <CircularProgress /> </Box>
            ) : opportunities.length > 0 ? (
                opportunities.map((opp) => (
                    <OpportunityListItem
                        key={opp.id}
                        opportunity={opp}
                        onEdit={handleOpenEditOpportunityDialog} 
                        onDelete={handleDeleteOpportunity} 
                        onViewInterested={handleViewInterested} 
                        viewMode="professor"
                    />
                ))
            ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
                    You haven&apos;t posted any opportunities yet.
                </Typography>
            )}
        </TabPanel>
      </Paper>

      <AddOpportunityForm
        open={isAddOppDialogOpen}
        onClose={handleCloseOpportunityDialog}
        onSave={handleSaveOpportunity}
        isSaving={isProcessing} 
        initialData={editingOpportunity} 
      />

      <InterestedStudentsDialog
          open={isInterestedDialogOpen}
          onClose={handleCloseInterestedDialog}
          opportunityId={selectedOpportunityId}
          opportunityTitle={selectedOpportunityTitle}
          professorId={user?.uid}
      />

       {/* --- Modals --- */}
      <Dialog open={viewCoverMode} onClose={() => !isSaving && setViewCoverMode(false)} maxWidth="md" fullWidth>
        <DialogTitle>Cover Photo</DialogTitle>
         <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {coverLink ? ( <img src={coverLink} alt="Cover Preview" style={{ width: '100%', borderRadius: '8px' }} /> ) : ( <Typography>No cover photo</Typography> )}
         </DialogContent>
        <DialogActions>
            <Button onClick={handleTriggerEditCover} startIcon={<EditIcon />} disabled={isSaving}>Edit</Button>
            {coverLink && ( <Button onClick={handleCoverDelete} color="error" startIcon={<DeleteIcon />} disabled={isSaving}>Delete</Button> )}
            <Button onClick={() => setViewCoverMode(false)} startIcon={<CloseIcon />} disabled={isSaving}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editCoverMode} onClose={() => !isSaving && handleCoverCancel()} maxWidth="xs" fullWidth>
        <DialogTitle>Update Cover Photo</DialogTitle>
        <DialogContent>
           <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }} disabled={isSaving}> {coverFile ? `Selected: ${coverFile.name}` : 'Select New Cover Image'} <input type="file" accept="image/*" hidden onChange={handleCoverFileChange} disabled={isSaving}/> </Button>
           {professorData?.coverLink && ( <Button variant="outlined" color="error" onClick={handleCoverDelete} startIcon={<DeleteIcon />} fullWidth size="small" disabled={isSaving}> Remove Current Cover </Button> )}
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCoverCancel} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleCoverSave} color="primary" variant="contained" disabled={!coverFile || isSaving}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewPhotoMode} onClose={() => !isSaving && setViewPhotoMode(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Profile Photo</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
           {photoLink ? ( <img src={photoLink} alt="Profile Preview" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }} /> ) : ( <Avatar sx={{ width: 150, height: 150, fontSize: '4rem' }}>?</Avatar> )}
        </DialogContent>
        <DialogActions>
            <Button onClick={handleTriggerEditPhoto} startIcon={<EditIcon />} disabled={isSaving}>Edit</Button>
            {photoLink && ( <Button onClick={handlePhotoDelete} color="error" startIcon={<DeleteIcon />} disabled={isSaving}>Delete</Button> )}
            <Button onClick={() => setViewPhotoMode(false)} startIcon={<CloseIcon />} disabled={isSaving}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editPhotoMode} onClose={() => !isSaving && handlePhotoCancel()} maxWidth="xs" fullWidth>
         <DialogTitle>Update Profile Photo</DialogTitle>
         <DialogContent>
            <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }} disabled={isSaving}> {photoFile ? `Selected: ${photoFile.name}` : 'Select New Profile Image'} <input type="file" accept="image/*" hidden onChange={handlePhotoFileChange} disabled={isSaving}/> </Button>
            {professorData?.photoLink && ( <Button variant="outlined" color="error" onClick={handlePhotoDelete} startIcon={<DeleteIcon />} fullWidth size="small" disabled={isSaving}> Remove Current Photo </Button> )}
         </DialogContent>
        <DialogActions>
            <Button onClick={handlePhotoCancel} disabled={isSaving}>Cancel</Button>
            <Button onClick={handlePhotoSave} color="primary" variant="contained" disabled={!photoFile || isSaving}>Save</Button>
        </DialogActions>
      </Dialog>
      </Container>
    </DashboardLayout>
  );
};

export default ProfessorDashboard;