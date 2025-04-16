/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// frontend/src/pages/ProfessorDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Tabs, Tab, Paper, IconButton, TextField, // Removed Avatar from here unless needed elsewhere
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Avatar // Kept Avatar for modal
} from '@mui/material';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '../firebase';

// Import components
import ProfessorCourses from "./ProfessorCourses";
import ProfessorResearch from './ResearchAndInterests';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProfileHeader from '../components/profile/ProfileHeader';
// Removed EditableField, EditableTextArea, FileUploadField imports as they are now in ProfileInfoSection
import ProfileInfoSection from '../components/profile/ProfileInfoSection'; // <-- Import ProfileInfoSection

// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

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
        <Box sx={{ p: 3 }}>
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
  const [tabValue, setTabValue] = useState(0);

  // Modals & Photo/Cover Files State
  const [editPhotoMode, setEditPhotoMode] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [viewPhotoMode, setViewPhotoMode] = useState(false);
  const [editCoverMode, setEditCoverMode] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [viewCoverMode, setViewCoverMode] = useState(false);
  // No specific state needed here for fields anymore

  // --- Hooks ---
  const navigate = useNavigate();
  const storage = getStorage(app);

  // --- Effects ---
  useEffect(() => {
    setUiLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { navigate('/professor-login'); setUiLoading(false); return; }
      // --- CHECK if email is verified FIRST ---
      if (!currentUser.emailVerified) {
        console.warn(`User ${currentUser.uid} email not verified. Redirecting.`);
        // Optional: Show message
        // await signOut(auth);
        navigate('/professor-login'); // Redirect to login
        setUiLoading(false);
        return;
    }
     // --- End Email Verification Check ---
      setUser(currentUser);
      try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
              const data = docSnap.data();
              // --- ROLE CHECK ---
              if (data.role !== 'professor') {
                console.warn(`User ${currentUser.uid} attempted to access professor dashboard but has role: ${data.role}`);
                await signOut(auth); // Log out the user
                navigate('/professor-login'); // Redirect to professor login
                setUiLoading(false);
                return; // Stop further processing
              }
              // --- End ROLE CHECK ---
              setProfessorData(data); // Set data only if role is correct
          } else {
              console.error("Firestore document missing for authenticated user:", currentUser.uid);
              await signOut(auth);
              navigate('/professor-login');
              setUiLoading(false);
              return;
          }
      } catch (error) {
          console.error("Error fetching professor data:", error);
          await signOut(auth);
          navigate('/professor-login');
      } finally {
          setUiLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // --- Event Handlers ---
  const handleSignOut = async () => {
    try { await signOut(auth); navigate('/'); } catch (error) { console.error("Sign out error:", error); }
  };

  const handleTabChange = (event, newValue) => { setTabValue(newValue); };

  // Field Save Handlers (Passed down to ProfileInfoSection)
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
     if (!window.confirm('Are you sure you want to delete the profile photo?')) return; // Added confirmation
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
      if (!window.confirm('Are you sure you want to delete the cover photo?')) return; // Added confirmation
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

  // --- Render Logic ---
  if (uiLoading) {
    return ( <DashboardLayout> <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}> <CircularProgress /> </Box> </DashboardLayout> );
  }

  // Only proceed to render dashboard content if professorData is loaded and role check passed
  if (!professorData) {
    return ( <DashboardLayout handleSignOut={handleSignOut}><Typography>Error loading data or unauthorized.</Typography></DashboardLayout>);
  }

  const photoLink = professorData?.photoLink || '';
  const coverLink = professorData?.coverLink || '';
  // resumeLink is no longer needed here, it's passed directly below

  return (
    <DashboardLayout handleSignOut={handleSignOut} dashboardPath='/professor-dashboard'>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
         <Typography variant="h4" gutterBottom> Professor Dashboard </Typography>
         {professorData && ( <Typography variant="h6" color="text.secondary"> Welcome, {professorData.name || 'Professor'}! </Typography> )}
       </Box>

      <Paper elevation={3} sx={{ borderRadius: 2, position: 'relative' }}>
         {isSaving && ( <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> <CircularProgress /> </Box> )}

        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" aria-label="Professor Dashboard Tabs" textColor="primary" indicatorColor="primary" sx={{ borderBottom: 1, borderColor: 'divider' }} >
          <Tab label="Profile" {...a11yProps(0)} />
          <Tab label="Research & Interests" {...a11yProps(1)} />
          <Tab label="Courses Offered" {...a11yProps(2)} />
          <Tab label="Discussion" {...a11yProps(3)} />
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
          />
        </TabPanel>

        {/* Other Tabs */}
        <TabPanel value={tabValue} index={1}> <ProfessorResearch /> </TabPanel>
        <TabPanel value={tabValue} index={2}> <ProfessorCourses /> </TabPanel>
        <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>Discussion</Typography>
            <Typography variant="body2" color="text.secondary">This section is under development...</Typography>
        </TabPanel>
      </Paper>

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

    </DashboardLayout>
  );
};

export default ProfessorDashboard;