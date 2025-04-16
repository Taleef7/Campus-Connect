/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// frontend/src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from 'react'; // Import React
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Tabs, Tab, Paper, CircularProgress, Avatar, // Added Tabs, Tab, Paper, CircularProgress, Avatar
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton // Added Modals and IconButton for potential photo edit
} from '@mui/material';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'; // Import storage functions
import { app } from '../firebase'; // Import app

// Import reusable components
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProfileHeader from '../components/profile/ProfileHeader'; // Reuse ProfileHeader
import EditableField from '../components/common/EditableField'; // Reuse EditableField
import EditableTextArea from '../components/common/EditableTextArea'; // Reuse EditableTextArea
import FileUploadField from '../components/common/FileUploadField'; // Reuse FileUploadField

// Icons (Optional, but needed if reusing ProfileHeader with edit icons etc.)
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

// TabPanel helper component (copy from ProfessorDashboard or create common component)
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-dashboard-tabpanel-${index}`}
      aria-labelledby={`student-dashboard-tab-${index}`}
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

// a11yProps helper function for Tabs
function a11yProps(index) {
  return {
    id: `student-dashboard-tab-${index}`,
    'aria-controls': `student-dashboard-tabpanel-${index}`,
  };
}


const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [uiLoading, setUiLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0); // State for current tab index
  const [errorMsg, setErrorMsg] = useState(""); // Added state for error messages
  const navigate = useNavigate();
  const storage = getStorage(app); // Initialize storage

  // State for Profile Picture editing (similar to ProfessorDashboard)
  const [editPhotoMode, setEditPhotoMode] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [viewPhotoMode, setViewPhotoMode] = useState(false);
  // Note: Students likely don't have cover photos, so we omit cover state/handlers

  // --- Effects ---
  useEffect(() => {
    setUiLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/student-login');
        setUiLoading(false);
        return;
      }
      // --- CHECK if email is verified FIRST ---
        if (!currentUser.emailVerified) {
          console.warn(`User ${currentUser.uid} email not verified. Redirecting.`);
          // Optional: You could show a "Please Verify" message instead of immediate logout
          // await signOut(auth); // Maybe don't sign out here, let them stay logged in but blocked
          setErrorMsg("Your email is not verified. Please check your inbox for the verification link."); // Add setErrorMsg state if needed, or redirect differently
          navigate('/student-login'); // Redirect to login, maybe with a message param?
          setUiLoading(false);
          return; // Stop processing
      }
      // --- End Email Verification Check ---
      setUser(currentUser);
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
        // --- ROLE CHECK ---
        if (data.role !== 'student') {
          console.warn(`User ${currentUser.uid} attempted to access student dashboard but has role: ${data.role}`);
          await signOut(auth); // Log out the user
          navigate('/student-login'); // Redirect to student login (or landing page)
          setUiLoading(false);
          return; // Stop further processing
        }
        // --- End ROLE CHECK ---
          setStudentData(data); // Set data only if role is correct
        } else {
          // This case means user exists in Auth but not Firestore (shouldn't happen with current signup)
          console.error("Firestore document missing for authenticated user:", currentUser.uid);
          await signOut(auth); // Log out inconsistent user
          navigate('/student-login');
          setUiLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        // Handle fetch error state? Maybe redirect to login after logging out.
         await signOut(auth);
         navigate('/student-login');
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // --- Save Handlers for Profile Fields ---
  // Generic field update function
  const handleProfileUpdate = async (fieldData) => {
      if (!user?.uid) return;
      setIsSaving(true);
      const docRef = doc(db, 'users', user.uid);
      try {
          await updateDoc(docRef, fieldData);
          setStudentData((prev) => ({ ...prev, ...fieldData }));
      } catch (error) {
          console.error(`Error updating student profile field(s):`, error);
          alert(`Error saving profile: ${error.message}`);
      } finally {
          setIsSaving(false);
      }
  };

  // Specific handlers using the generic function
  const handleNameSave = (newName) => handleProfileUpdate({ name: newName.trim() });
  const handleMajorSave = (newMajor) => handleProfileUpdate({ major: newMajor.trim() }); // Added Major
  const handleYearSave = (newYear) => handleProfileUpdate({ year: newYear.trim() }); // Added Year
  const handleDescriptionSave = (newDescription) => handleProfileUpdate({ description: newDescription.trim() }); // Added Description

  // Resume Handlers (similar to professor's)
  const handleResumeSave = async (newResumeFile) => {
    if (!user?.uid || !newResumeFile) return;
    setIsSaving(true);
    const oldPath = studentData?.resumePath;
    const newPath = `resumes/${user.uid}/${Date.now()}_${newResumeFile.name}`; // Using same path structure for simplicity
    try {
        const docRef = doc(db, 'users', user.uid);
        if (oldPath) { const oldRef = ref(storage, oldPath); await deleteObject(oldRef).catch(err => console.warn("Old resume delete failed:", err)); }
        const storageRef = ref(storage, newPath);
        await uploadBytes(storageRef, newResumeFile);
        const downloadURL = await getDownloadURL(storageRef);
        await updateDoc(docRef, { resumeLink: downloadURL, resumePath: newPath });
        setStudentData((prev) => ({ ...prev, resumeLink: downloadURL, resumePath: newPath }));
    } catch (error) { console.error('Error uploading resume:', error); alert(`Error uploading resume: ${error.message}`); }
    finally { setIsSaving(false); }
  };

  const handleResumeDelete = async () => {
     const pathToDelete = studentData?.resumePath;
     if (!user?.uid || !pathToDelete) return;
     if (!window.confirm('Are you sure you want to delete the resume?')) return;
     setIsSaving(true);
     try {
         const docRef = doc(db, 'users', user.uid);
         const storageRef = ref(storage, pathToDelete);
         await deleteObject(storageRef);
         await updateDoc(docRef, { resumeLink: '', resumePath: '' });
         setStudentData((prev) => ({ ...prev, resumeLink: '', resumePath: '' }));
     } catch (error) { console.error('Error removing resume:', error); alert(`Error removing resume: ${error.message}`); }
     finally { setIsSaving(false); }
  };

  // --- Photo Handlers (Copied/Adapted from ProfessorDashboard) ---
  const handleTriggerViewPhoto = () => { (studentData?.photoLink) ? setViewPhotoMode(true) : handleTriggerEditPhoto(); };
  const handleTriggerEditPhoto = () => { setEditPhotoMode(true); setPhotoFile(null); setViewPhotoMode(false); };
  const handlePhotoFileChange = (e) => { if (e.target.files && e.target.files[0]) { setPhotoFile(e.target.files[0]); } };
  const handlePhotoCancel = () => { setEditPhotoMode(false); setPhotoFile(null); };
  const handlePhotoSave = async () => {
    if (!user?.uid || !photoFile) return;
    setIsSaving(true);
    const oldPath = studentData?.photoPath;
    const newPath = `photos/${user.uid}/${Date.now()}_${photoFile.name}`; // Using same photos path
    try {
      const docRef = doc(db, 'users', user.uid);
      if (oldPath) { const oldRef = ref(storage, oldPath); await deleteObject(oldRef).catch(err => console.warn("Old photo delete failed:", err)); }
      const storageRef = ref(storage, newPath);
      await uploadBytes(storageRef, photoFile);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(docRef, { photoLink: downloadURL, photoPath: newPath });
      setStudentData((prev) => ({ ...prev, photoLink: downloadURL, photoPath: newPath }));
      setEditPhotoMode(false); setPhotoFile(null);
    } catch (error) { console.error('Error uploading photo:', error); alert(`Error uploading photo: ${error.message}`);}
    finally { setIsSaving(false); }
  };
  const handlePhotoDelete = async () => {
    const pathToDelete = studentData?.photoPath;
    if (!user?.uid || !pathToDelete) return;
    if (!window.confirm('Are you sure you want to delete the profile photo?')) return;
    setIsSaving(true);
    try {
        const docRef = doc(db, 'users', user.uid);
        const storageRef = ref(storage, pathToDelete);
        await deleteObject(storageRef);
        await updateDoc(docRef, { photoLink: '', photoPath: '' });
        setStudentData((prev) => ({ ...prev, photoLink: '', photoPath: '' }));
        setEditPhotoMode(false); setViewPhotoMode(false); setPhotoFile(null);
    } catch (error) { console.error('Error removing photo:', error); alert(`Error removing photo: ${error.message}`); }
    finally { setIsSaving(false); }
  };

  // --- Render Logic ---
  if (uiLoading) {
     return ( <DashboardLayout handleSignOut={handleSignOut}> <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}> <CircularProgress /> </Box> </DashboardLayout> );
   }

  // Only proceed to render dashboard content if studentData is loaded and role check passed
  if (!studentData) {
    // This case might occur briefly or if there was an error caught above
    // You might want a more specific error message or redirect here too
     return ( <DashboardLayout handleSignOut={handleSignOut}><Typography>Error loading data or unauthorized.</Typography></DashboardLayout>);
   }

  const photoLink = studentData?.photoLink || '';
  const resumeLink = studentData?.resumeLink || '';

  return (
    <DashboardLayout handleSignOut={handleSignOut} dashboardPath='/student-dashboard'>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom> Student Dashboard </Typography>
        {studentData && ( <Typography variant="h6" color="text.secondary"> Welcome, {studentData.name || 'Student'}! </Typography> )}
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 2, position: 'relative' }}>
        {isSaving && ( <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> <CircularProgress /> </Box> )}

        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" aria-label="Student Dashboard Tabs" textColor="primary" indicatorColor="primary" sx={{ borderBottom: 1, borderColor: 'divider' }} >
          <Tab label="Profile" {...a11yProps(0)} />
          <Tab label="Research & Interests" {...a11yProps(1)} />
          <Tab label="Courses Enrolled" {...a11yProps(2)} />
          <Tab label="Posts Interested In" {...a11yProps(3)} />
        </Tabs>

        {/* --- Profile Tab (US3.1 & US3.2) --- */}
        <TabPanel value={tabValue} index={0}>
           {/* Use ProfileHeader - Adapt props as needed (no cover photo handling) */}
           <ProfileHeader
             // coverLink={null} // Explicitly no cover link
             photoLink={photoLink}
             professorName={studentData?.name} // Pass student name
             // No cover handlers needed
             // onEditCover={() => {}}
             // onViewCover={() => {}}
             onEditPhoto={handleTriggerEditPhoto} // Use photo handlers
             onViewPhoto={handleTriggerViewPhoto}
           />
           {/* Profile Info Section */}
           <Box sx={{ textAlign: 'left', pt: 2, pl: { xs: 0, sm: 2 } }}>
                <EditableField
                    label="Full Name"
                    value={studentData?.name}
                    onSave={handleNameSave}
                    typographyVariant="h5" // Adjust styling as needed
                    textFieldProps={{ size: 'small' }}
                    containerSx={{ mb: 1, fontWeight: 'bold' }}
                    isSaving={isSaving}
                />
                <EditableField
                    label="Major"
                    value={studentData?.major}
                    onSave={handleMajorSave}
                    typographyVariant="body1"
                    placeholder="(e.g., Computer Science)"
                    emptyText="Major: (Not set)"
                    textFieldProps={{ size: 'small' }}
                    containerSx={{ mb: 1 }}
                    isSaving={isSaving}
                />
                 <EditableField
                    label="Year"
                    value={studentData?.year}
                    onSave={handleYearSave}
                    typographyVariant="body1"
                    placeholder="(e.g., Sophomore, Junior, PhD Year 2)"
                    emptyText="Year: (Not set)"
                    textFieldProps={{ size: 'small' }}
                    containerSx={{ mb: 2 }}
                    isSaving={isSaving}
                />
                 <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>Description / Bio</Typography>
                    <EditableTextArea
                        label="Description / Bio"
                        value={studentData?.description} // Changed field name
                        onSave={handleDescriptionSave}
                        placeholder="(Tell professors a bit about yourself)"
                        emptyText="(No description provided)"
                        textFieldProps={{ rows: 4 }}
                        isSaving={isSaving}
                    />
                </Box>
                 <FileUploadField
                    label="Resume/CV"
                    fileLink={resumeLink}
                    accept=".pdf,.doc,.docx" // Allow common doc types
                    onSave={handleResumeSave}
                    onDelete={handleResumeDelete}
                    isSaving={isSaving}
                    viewButtonText="View Document"
                    selectButtonText="Upload Resume/CV"
                    noFileText="No resume/CV uploaded"
                    containerSx={{ mt: 2 }}
                 />
           </Box>
        </TabPanel>

        {/* --- Placeholder Tabs --- */}
        <TabPanel value={tabValue} index={1}>
           <Typography variant="h6">Research & Interests</Typography>
           <Typography variant="body2" color="textSecondary">(Content for US3.3 will go here)</Typography>
           {/* Future: Component to list/edit interests */}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
           <Typography variant="h6">Courses Enrolled</Typography>
            <Typography variant="body2" color="textSecondary">(Content for US3.4 will go here)</Typography>
           {/* Future: List of courses */}
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
            <Typography variant="h6">Posts Interested In</Typography>
            <Typography variant="body2" color="textSecondary">(Content for US3.5 will go here)</Typography>
           {/* Future: List of bookmarked/applied posts */}
        </TabPanel>
      </Paper>

       {/* --- Photo Modals (Copied/Adapted from ProfessorDashboard) --- */}
       <Dialog open={viewPhotoMode} onClose={() => !isSaving && setViewPhotoMode(false)} maxWidth="sm" fullWidth>
         <DialogTitle>Profile Photo</DialogTitle>
         <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {photoLink ? ( <img src={photoLink} alt="Profile Preview" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }} /> ) : ( <Avatar sx={{ width: 150, height: 150, fontSize: '4rem' }}>{studentData?.name?.[0] || '?'}</Avatar> )}
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
             {studentData?.photoLink && ( <Button variant="outlined" color="error" onClick={handlePhotoDelete} startIcon={<DeleteIcon />} fullWidth size="small" disabled={isSaving}> Remove Current Photo </Button> )}
          </DialogContent>
         <DialogActions>
             <Button onClick={handlePhotoCancel} disabled={isSaving}>Cancel</Button>
             <Button onClick={handlePhotoSave} color="primary" variant="contained" disabled={!photoFile || isSaving}>Save</Button>
         </DialogActions>
       </Dialog>

    </DashboardLayout>
  );
};

export default StudentDashboard;