/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// frontend/src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from 'react'; // Import React
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Tabs, Tab, Paper, CircularProgress, Avatar, Container, // Added Tabs, Tab, Paper, CircularProgress, Avatar, Container
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider, Stack // Added Modals and IconButton for potential photo edit
} from '@mui/material';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'; // Import storage functions
import { app } from '../firebase'; // Import app

// Import reusable components
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProfileHeader from '../components/profile/ProfileHeader'; // Reuse ProfileHeader
import EditableField from '../components/common/EditableField'; // Reuse EditableField
import EditableTextArea from '../components/common/EditableTextArea'; // Reuse EditableTextArea
import FileUploadField from '../components/common/FileUploadField'; // Reuse FileUploadField
import OpportunityFeed from '../components/opportunities/OpportunityFeed'; // Make sure this import exists and path is correct
import StudentExperienceResearch from '../components/profile/StudentExperienceResearch'; // Adjust path if needed
import StudentCoursesEnrolled from '../components/profile/StudentCoursesEnrolled'; // Adjust path if needed

// Icons (Optional, but needed if reusing ProfileHeader with edit icons etc.)
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';


// TabPanel helper component - Reduce padding
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
      <div role="tabpanel" hidden={value !== index} id={`student-dashboard-tabpanel-${index}`} aria-labelledby={`student-dashboard-tab-${index}`} {...other} >
          {/* --- REDUCED PADDING --- */}
          {value === index && (<Box sx={{ p: 2 }}>{children}</Box>)}
           {/* --- END REDUCED PADDING --- */}
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
  // --- UPDATED useEffect for Realtime Data ---
  useEffect(() => {
    setUiLoading(true);
    let firestoreUnsubscribe = () => {}; // Initialize unsubscribe function for Firestore

    // Listen for Auth changes
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
        // Clean up previous Firestore listener if user changes or logs out
        firestoreUnsubscribe();

        if (!currentUser) {
            navigate('/student-login');
            setUiLoading(false);
            setUser(null); // Clear user
            setStudentData(null); // Clear data
            return;
        }
        if (!currentUser.emailVerified) {
             console.warn(`User ${currentUser.uid} email not verified.`);
             setErrorMsg("Verify your email.");
             navigate('/student-login'); // Or show verify message page
             setUiLoading(false);
             setUser(null); // Clear user
             setStudentData(null); // Clear data
             return;
        }

        // Set authenticated user
        setUser(currentUser);

        // Set up the Firestore listener for the user's document
        const docRef = doc(db, 'users', currentUser.uid);

        // onSnapshot returns an unsubscribe function
        firestoreUnsubscribe = onSnapshot(docRef, (docSnap) => {
            // Runs whenever the document changes
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Role check
                if (data.role !== 'student') {
                    console.warn(`User ${currentUser.uid} is not a student.`);
                    signOut(auth).then(() => navigate('/student-login'));
                    setStudentData(null);
                } else {
                    // Update state with the latest data
                    setStudentData({ id: docSnap.id, ...data });
                    setErrorMsg(''); // Clear errors on success
                }
            } else {
                console.error("Firestore document missing for authenticated user:", currentUser.uid);
                setErrorMsg("Error loading profile data.");
                signOut(auth).then(() => navigate('/student-login'));
                setStudentData(null);
            }
            setUiLoading(false); // Stop loading after first snapshot/error
        }, (error) => {
            // Handle listener errors
            console.error("Error listening to student data:", error);
            setErrorMsg("Failed to load profile in real-time.");
            setStudentData(null);
            setUiLoading(false);
            // Maybe logout on persistent errors
            // signOut(auth).then(() => navigate('/student-login'));
        });

    });

    // Cleanup function: Unsubscribe from both listeners
    return () => {
        authUnsubscribe();
        firestoreUnsubscribe();
    };
}, [navigate]); // Dependency array


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

  // --- Style object for Tab hover effect ---
  const tabHoverSx = {
    borderRadius: 1, // Optional: slightly round corners on hover
    '&:hover': {
        backgroundColor: 'action.hover', // Use theme's hover color
        // Or specify a color: e.g., backgroundColor: 'rgba(0, 0, 0, 0.04)'
    },
  };
  // --- End Style object ---


  return (
    <DashboardLayout handleSignOut={handleSignOut} dashboardPath='/student-dashboard'>
            {/* --- WRAP CONTENT IN CONTAINER --- */}
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    {studentData && (<Typography variant="h5" color="text.secondary" gutterBottom> Welcome, {studentData.name || 'Student'}! </Typography>)}
                </Box>

                <Paper elevation={3} sx={{ borderRadius: 3, position: 'relative' }}>
                    {isSaving && (<Box sx={{ /* ... Saving overlay ... */ }}> <CircularProgress /> </Box>)}

                    {/* --- TABS: USE fullWidth VARIANT --- */}
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="fullWidth" // Changed from standard/centered
                        // centered // Not needed with fullWidth
                        aria-label="Student Dashboard Tabs"
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        {/* Apply hover sx to each Tab */}
                        <Tab label="Profile" {...a11yProps(0)} sx={tabHoverSx} />
                        <Tab label="Experience and Research" {...a11yProps(1)} sx={tabHoverSx} />
                        <Tab label="Courses Enrolled" {...a11yProps(2)} sx={tabHoverSx} />
                        <Tab label="Opportunities Interested In" {...a11yProps(3)} sx={tabHoverSx} />
                    </Tabs>
                    {/* --- END TABS --- */}


                    {/* --- Profile Tab (US3.1 & US3.2) --- */}
                    <TabPanel value={tabValue} index={0}>
                        <ProfileHeader
                           // coverLink={null}
                           photoLink={photoLink}
                           professorName={studentData?.name}
                           // onEditCover={() => {}}
                           // onViewCover={() => {}}
                           onEditPhoto={handleTriggerEditPhoto}
                           onViewPhoto={handleTriggerViewPhoto}
                        />
                        {/* --- RESTRUCTURED PROFILE INFO --- */}
                     <Box sx={{ pt: 2, pl: { xs: 0, sm: 1 } }}> {/* Add padding around the whole content */}
                        <Stack spacing={3}> {/* Increased spacing for main sections */}

                             {/* --- Basic Info Section --- */}
                             <Box>
                                 {/* Name - Keep prominent */}
                                 <EditableField
                                     label="Full Name"
                                     value={studentData?.name}
                                     onSave={handleNameSave}
                                     typographyVariant="h5" // Make name slightly larger
                                     // You might need to adjust EditableField internally or use sx here if variant alone isn't enough
                                     // sx={{ '& .MuiTypography-root': { fontWeight: 'medium' } }} // Example of targeting internal Typography
                                     textFieldProps={{ size: 'small' }}
                                     isSaving={isSaving}
                                 />
                                 {/* Group Major and Year */}
                                 <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 4 }} sx={{ mt: 1.5 }}> {/* Stack row on small screens+ */}
                                     <EditableField
                                         label="Major"
                                         value={studentData?.major}
                                         onSave={handleMajorSave}
                                         typographyVariant="body1"
                                         placeholder="(e.g., Computer Science)"
                                         emptyText="(Not set)"
                                         textFieldProps={{ size: 'small' }}
                                         isSaving={isSaving}
                                         containerSx={{ flexGrow: 1 }} // Allow fields to grow in row layout
                                     />
                                     <EditableField
                                         label="Year"
                                         value={studentData?.year}
                                         onSave={handleYearSave}
                                         typographyVariant="body1"
                                         placeholder="(e.g., Sophomore)"
                                         emptyText="(Not set)"
                                         textFieldProps={{ size: 'small' }}
                                         isSaving={isSaving}
                                         containerSx={{ flexGrow: 1 }} // Allow fields to grow in row layout
                                     />
                                 </Stack>
                             </Box>

                             <Divider /> {/* Separator */}

                             {/* --- Description/Bio Section --- */}
                             <Box>
                                 <EditableTextArea
                                     label="About / Bio" // Label here is mostly for edit mode now
                                     value={studentData?.description}
                                     onSave={handleDescriptionSave}
                                     placeholder="(Tell professors a bit about yourself)"
                                     emptyText="(No description provided)"
                                     typographyVariant="body2" // Use body2 for potentially long text
                                     textFieldProps={{ rows: 4 }}
                                     isSaving={isSaving}
                                 />
                             </Box>

                            <Divider /> {/* Separator */}

                             {/* --- Resume/CV Section --- */}
                             <Box>
                                 <Typography variant="h6" gutterBottom sx={{ fontWeight: 'light' }}>
                                     Resume / CV
                                 </Typography>
                                 <FileUploadField
                                    //  label="Resume/CV" // Still useful for accessibility/edit mode
                                     fileLink={resumeLink}
                                     accept=".pdf,.doc,.docx"
                                     onSave={handleResumeSave}
                                     onDelete={handleResumeDelete}
                                     isSaving={isSaving}
                                     viewButtonText="View Document"
                                     selectButtonText="Upload Resume/CV"
                                     noFileText="No resume/CV uploaded"
                                 />
                             </Box>

                        </Stack>
                     </Box>
                      {/* --- END RESTRUCTURED PROFILE INFO --- */}
                    </TabPanel>

                    {/* --- Other TabPanels (Keep as is, padding reduced in TabPanel component) --- */}
                    <TabPanel value={tabValue} index={1}>
                        <StudentExperienceResearch studentData={studentData} />
                    </TabPanel>
                    <TabPanel value={tabValue} index={2}>
                        <StudentCoursesEnrolled studentData={studentData} />
                    </TabPanel>
                    <TabPanel value={tabValue} index={3}>
                         {/* Check if OpportunityFeed should be here or if this is for posts student *is* interested in */}
                         <OpportunityFeed />
                         {/* Or if it's for posts interested in: Needs different component */}
                         {/* <Typography variant="h6" gutterBottom>My Interested Opportunities</Typography> */}
                         {/* <MyInterestedOpportunities studentId={user?.uid} /> */}
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
      </Container>
    </DashboardLayout>
  );
};

export default StudentDashboard;