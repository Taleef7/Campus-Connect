import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Tabs, Tab, Paper, CircularProgress, Avatar, Container, 
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider, Stack 
} from '@mui/material';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'; 
import { app } from '../firebase'; 

// Import reusable components
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProfileHeader from '../components/profile/ProfileHeader'; 
import EditableField from '../components/common/EditableField'; 
import EditableTextArea from '../components/common/EditableTextArea'; 
import FileUploadField from '../components/common/FileUploadField'; 
import OpportunityFeed from '../components/opportunities/OpportunityFeed'; 
import StudentExperienceResearch from '../components/profile/StudentExperienceResearch'; 
import StudentCoursesEnrolled from '../components/profile/StudentCoursesEnrolled';

// Icons 
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
  const [tabValue, setTabValue] = useState(0); 
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const storage = getStorage(app); 

  const [editPhotoMode, setEditPhotoMode] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [viewPhotoMode, setViewPhotoMode] = useState(false);
  // State for Cover Photo editing
  const [editCoverMode, setEditCoverMode] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [viewCoverMode, setViewCoverMode] = useState(false); // If you want a view dialog

  useEffect(() => {
    setUiLoading(true);
    let firestoreUnsubscribe = () => {}; 

    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
        
        firestoreUnsubscribe();

        if (!currentUser) {
            navigate('/auth');
            setUiLoading(false);
            setUser(null); 
            setStudentData(null); 
            return;
        }
        // if (!currentUser.emailVerified) {
        //      console.warn(`User ${currentUser.uid} email not verified.`);
        //      setErrorMsg("Verify your email.");
        //      navigate('/student-login'); 
        //      setUiLoading(false);
        //      setUser(null); 
        //      setStudentData(null); 
        //      return;
        // }

        setUser(currentUser);

        const docRef = doc(db, 'users', currentUser.uid);

        firestoreUnsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.role !== 'student') {
                    console.warn(`User ${currentUser.uid} is not a student.`);
                    signOut(auth).then(() => navigate('/auth'));
                    setStudentData(null);
                } else {
                    
                    setStudentData({ id: docSnap.id, ...data });
                    setErrorMsg(''); 
                }
            } else {
                console.error("Firestore document missing for authenticated user:", currentUser.uid);
                setErrorMsg("Error loading profile data.");
                signOut(auth).then(() => navigate('/auth'));
                setStudentData(null);
            }
            setUiLoading(false); 
        }, (error) => {
            console.error("Error listening to student data:", error);
            setErrorMsg("Failed to load profile in real-time.");
            setStudentData(null);
            setUiLoading(false);
        });

    });

    return () => {
        authUnsubscribe();
        firestoreUnsubscribe();
    };
}, [navigate]); 


  // --- Event Handlers ---
  const handleSignOut = async () => {
    try { await signOut(auth); navigate('/'); } catch (error) { console.error("Sign out error:", error); }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };


  // --- Save Handlers for Profile Fields ---

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

  const handleNameSave = (newName) => handleProfileUpdate({ name: newName.trim() });
  const handleMajorSave = (newMajor) => handleProfileUpdate({ major: newMajor.trim() }); 
  const handleYearSave = (newYear) => handleProfileUpdate({ year: newYear.trim() }); 
  const handleDescriptionSave = (newDescription) => handleProfileUpdate({ description: newDescription.trim() }); 

  // Resume Handlers 
  const handleResumeSave = async (newResumeFile) => {
    if (!user?.uid || !newResumeFile) return;
    setIsSaving(true);
    const oldPath = studentData?.resumePath;
    const newPath = `resumes/${user.uid}/${Date.now()}_${newResumeFile.name}`; 
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

  // --- Photo Handlers  ---
  const handleTriggerViewPhoto = () => { (studentData?.photoLink) ? setViewPhotoMode(true) : handleTriggerEditPhoto(); };
  const handleTriggerEditPhoto = () => { setEditPhotoMode(true); setPhotoFile(null); setViewPhotoMode(false); };
  const handlePhotoFileChange = (e) => { if (e.target.files && e.target.files[0]) { setPhotoFile(e.target.files[0]); } };
  const handlePhotoCancel = () => { setEditPhotoMode(false); setPhotoFile(null); };
  const handlePhotoSave = async () => {
    if (!user?.uid || !photoFile) return;
    setIsSaving(true);
    const oldPath = studentData?.photoPath;
    const newPath = `photos/${user.uid}/${Date.now()}_${photoFile.name}`; 
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

  // --- Cover Photo Handlers ---
  const handleTriggerViewCover = () => { if (studentData?.coverLink) { setViewCoverMode(true); } }; // Only view if exists
  const handleTriggerEditCover = () => { setEditCoverMode(true); setCoverFile(null); setViewCoverMode(false); };
  const handleCoverFileChange = (e) => { if (e.target.files && e.target.files[0]) { setCoverFile(e.target.files[0]); } };
  const handleCoverCancel = () => { setEditCoverMode(false); setCoverFile(null); };

  const handleCoverSave = async () => {
    if (!user?.uid || !coverFile) return;
    setIsSaving(true);
    const oldPath = studentData?.coverPath;
  
    const newPath = `covers/${user.uid}/${Date.now()}_${coverFile.name}`;
    try {
      const docRef = doc(db, 'users', user.uid);
    
      if (oldPath) {
        const oldRef = ref(storage, oldPath);
        await deleteObject(oldRef).catch(err => console.warn("Old cover delete failed:", err));
      }
    
      const storageRef = ref(storage, newPath);
      await uploadBytes(storageRef, coverFile);
      const downloadURL = await getDownloadURL(storageRef);
    
      await updateDoc(docRef, { coverLink: downloadURL, coverPath: newPath });
      // setStudentData((prev) => ({ ...prev, coverLink: downloadURL, coverPath: newPath }));
      setEditCoverMode(false); setCoverFile(null);
      // showSnackbar("Cover photo updated!", "success");
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      alert(`Error uploading cover photo: ${error.message}`); // Replace with Snackbar if integrated
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverDelete = async () => {
    const pathToDelete = studentData?.coverPath;
    if (!user?.uid || !pathToDelete) return;
    if (!window.confirm('Are you sure you want to delete the cover photo?')) return; // Keep confirm or use Dialog
    setIsSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      const storageRef = ref(storage, pathToDelete);
      await deleteObject(storageRef);
      
      await updateDoc(docRef, { coverLink: '', coverPath: '' });
      // setStudentData((prev) => ({ ...prev, coverLink: '', coverPath: '' }));
      setEditCoverMode(false); setViewCoverMode(false); setCoverFile(null);
       // showSnackbar("Cover photo deleted.", "success");
    } catch (error) {
      console.error('Error removing cover photo:', error);
      alert(`Error removing cover photo: ${error.message}`); // Replace with Snackbar
    } finally {
      setIsSaving(false);
    }
  };
  // --- End Cover Photo Handlers ---


  // --- Render Logic ---
  if (uiLoading) {
     return ( <DashboardLayout> <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}> <CircularProgress /> </Box> </DashboardLayout> );
   }

  if (!studentData) {

     return ( <DashboardLayout><Typography>Error loading data or unauthorized.</Typography></DashboardLayout>);
   }

  const photoLink = studentData?.photoLink || '';
  const resumeLink = studentData?.resumeLink || '';

  // --- Style object for Tab hover effect ---
  const tabHoverSx = {
    borderRadius: 1, 
    '&:hover': {
        backgroundColor: 'action.hover', 
    },
  };
  // --- End Style object ---


  return (
    <DashboardLayout>
            {/* --- WRAP CONTENT IN CONTAINER --- */}
            <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
                <Box sx={{ mb: 5, textAlign: 'center' }}>
                    {studentData && (<Typography variant="h5" color="text.secondary" gutterBottom data-testid="dashboard-welcome-message"> Welcome, {studentData.name || 'Student'}! </Typography>)}
                </Box>

                <Paper elevation={3} sx={{ borderRadius: 3, position: 'relative' }}>
                    {isSaving && (<Box sx={{ /* ... Saving overlay ... */ }}> <CircularProgress /> </Box>)}

                    {/* --- TABS: USE fullWidth VARIANT --- */}
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="fullWidth" 
                        aria-label="Student Dashboard Tabs"
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                        data-testid="dashboard-tabs-container"
                    >
                        {/* Apply hover sx to each Tab */}
                        <Tab data-testid="tab-profile" label="Profile" {...a11yProps(0)} sx={tabHoverSx} />
                        <Tab data-testid="tab-experience" label="Experience" {...a11yProps(1)} sx={tabHoverSx} />
                        <Tab data-testid="tab-courses" label="Courses" {...a11yProps(2)} sx={tabHoverSx} />
                        <Tab data-testid="tab-opportunities" label="Opportunities" {...a11yProps(3)} sx={tabHoverSx} />
                    </Tabs>
                    {/* --- END TABS --- */}


                    {/* --- Profile Tab (US3.1 & US3.2) --- */}
                    <TabPanel value={tabValue} index={0}>
                        <ProfileHeader
                           photoLink={photoLink}
                           coverLink={studentData?.coverLink || null} 
                           professorName={studentData?.name}
                           onEditCover={handleTriggerEditCover}  
                           onViewCover={handleTriggerViewCover}
                           onEditPhoto={handleTriggerEditPhoto}
                           onViewPhoto={handleTriggerViewPhoto}
                        />
                        {/* --- PROFILE INFO --- */}
                     <Box sx={{ pt: 2, pl: { xs: 0, sm: 1 } }}> 
                        <Stack spacing={3}> 

                             <Box>
                                 <EditableField
                                     testIdPrefix="profile-name"
                                     label="Full Name"
                                     value={studentData?.name}
                                     onSave={handleNameSave}
                                     typographyVariant="h5" 
                                     textFieldProps={{ size: 'small' }}
                                     isSaving={isSaving}
                                 />
                                 {/* Group Major and Year */}
                                 <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 4 }} sx={{ mt: 1.5 }}> 
                                     <EditableField
                                         testIdPrefix="profile-major"
                                         label="Major"
                                         value={studentData?.major}
                                         onSave={handleMajorSave}
                                         typographyVariant="body1"
                                         placeholder="(e.g., Computer Science)"
                                         emptyText="(Not set)"
                                         textFieldProps={{ size: 'small' }}
                                         isSaving={isSaving}
                                         containerSx={{ flexGrow: 1 }} 
                                     />
                                     <EditableField
                                         testIdPrefix="profile-year"
                                         label="Year"
                                         value={studentData?.year}
                                         onSave={handleYearSave}
                                         typographyVariant="body1"
                                         placeholder="(e.g., Sophomore)"
                                         emptyText="(Not set)"
                                         textFieldProps={{ size: 'small' }}
                                         isSaving={isSaving}
                                         containerSx={{ flexGrow: 1 }} 
                                     />
                                 </Stack>
                             </Box>

                             <Divider /> 

                             <Box>
                              {/* This Typography is just the section title */}
                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
                                About
                              </Typography>
                              <EditableTextArea
                                testIdPrefix="profile-description"
                                value={studentData?.description}
                                onSave={handleDescriptionSave}
                                placeholder="(Tell professors a bit about yourself)"
                                emptyText="(No description provided)"
                                // --- CHANGE TYPOGRAPHY VARIANT ---
                                typographyVariant="body1" // Changed from body2 (default)
                                // --- END CHANGE ---
                                textFieldProps={{ rows: 4 }}
                                isSaving={isSaving}
                              />
                            </Box>

                            <Divider /> 

                             {/* --- Resume/CV Section --- */}
                             <Box>
                                 <Typography variant="h6" gutterBottom sx={{ fontWeight: 'light' }}>
                                     Resume / CV
                                 </Typography>
                                 <FileUploadField
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
                      {/* --- END PROFILE INFO --- */}
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <StudentExperienceResearch studentData={studentData} />
                    </TabPanel>
                    <TabPanel value={tabValue} index={2}>
                        <StudentCoursesEnrolled studentData={studentData} />
                    </TabPanel>
                    <TabPanel value={tabValue} index={3}>
                         <OpportunityFeed />
                     </TabPanel>
                </Paper>


            {/* --- Photo Modals --- */}
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

            {/* --- Cover Photo Modals (NEW) --- */}
      {/* View Cover Dialog (Optional - only if you want a separate view click) */}
       <Dialog open={viewCoverMode} onClose={() => !isSaving && setViewCoverMode(false)} maxWidth="md">
           <DialogTitle>Cover Photo</DialogTitle>
           <DialogContent>
               {studentData?.coverLink ? (
                   <img src={studentData.coverLink} alt="Cover Preview" style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
               ) : <Typography>No cover photo set.</Typography>}
           </DialogContent>
           <DialogActions>
                <Button onClick={handleTriggerEditCover} startIcon={<EditIcon />} disabled={isSaving}>Edit</Button>
               {studentData?.coverLink && ( <Button onClick={handleCoverDelete} color="error" startIcon={<DeleteIcon />} disabled={isSaving}>Delete</Button> )}
               <Button onClick={() => setViewCoverMode(false)} startIcon={<CloseIcon />} disabled={isSaving}>Close</Button>
           </DialogActions>
       </Dialog>

       {/* Edit Cover Dialog */}
       <Dialog open={editCoverMode} onClose={() => !isSaving && handleCoverCancel()} maxWidth="sm" fullWidth>
         <DialogTitle>Update Cover Photo</DialogTitle>
         <DialogContent>
            {/* Basic File Input Button */}
           <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }} disabled={isSaving}>
              {coverFile ? `Selected: ${coverFile.name}` : 'Select New Cover Image'}
              <input type="file" accept="image/*" hidden onChange={handleCoverFileChange} disabled={isSaving}/>
           </Button>
            {/* Display preview if file selected */}
            {coverFile && (
                <Box sx={{ my: 1, textAlign: 'center' }}>
                    <Typography variant="caption">Preview:</Typography>
                    <img src={URL.createObjectURL(coverFile)} alt="Cover Preview" style={{ maxWidth: '100%', height: 'auto', display: 'block', marginTop: '4px' }} />
                </Box>
            )}
            {/* Delete Button */}
           {studentData?.coverLink && (
             <Button variant="outlined" color="error" onClick={handleCoverDelete} startIcon={<DeleteIcon />} fullWidth size="small" disabled={isSaving} sx={{mt: 1}}>
               Remove Current Cover Photo
             </Button>
            )}
         </DialogContent>
        <DialogActions>
           <Button onClick={handleCoverCancel} disabled={isSaving}>Cancel</Button>
           <Button onClick={handleCoverSave} color="primary" variant="contained" disabled={!coverFile || isSaving}>Save</Button>
        </DialogActions>
       </Dialog>
       {/* --- End Cover Photo Modals --- */}
      </Container>
    </DashboardLayout>
  );
};

export default StudentDashboard;