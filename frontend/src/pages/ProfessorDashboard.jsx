/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// frontend/src/pages/ProfessorDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Avatar,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '../firebase'; // your Firebase app
import DeleteIcon from '@mui/icons-material/Delete';
import ProfessorCourses from "./ProfessorCourses";
import ProfessorResearch from './ResearchAndInterests';




// Icons
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

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

function a11yProps(index) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

const ProfessorDashboard = () => {
  const [user, setUser] = useState(null);
  const [professorData, setProfessorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // States for editing each field
  const [editNameMode, setEditNameMode] = useState(false);
  const [tempName, setTempName] = useState('');

  // Photo editing states
  const [photoHover, setPhotoHover] = useState(false);
  const [editPhotoMode, setEditPhotoMode] = useState(false); // Now controls modal open
  const [photoFile, setPhotoFile] = useState(null);

  // NEW: This state is for the "view photo" modal
  // where the user sees a larger preview, plus "edit" or "delete" options
  const [viewPhotoMode, setViewPhotoMode] = useState(false);

  // ========== Cover Photo States (NEW) ==========
  // We'll store coverHover, editCoverMode, coverFile, viewCoverMode
  const [coverHover, setCoverHover] = useState(false);
  const [editCoverMode, setEditCoverMode] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [viewCoverMode, setViewCoverMode] = useState(false);

  // Resume editing states
  const [editResumeMode, setEditResumeMode] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  const [editHeadlineMode, setEditHeadlineMode] = useState(false);
  const [tempHeadline, setTempHeadline] = useState('');

  const [editPronounsMode, setEditPronounsMode] = useState(false);
  const [tempPronouns, setTempPronouns] = useState('');

  const [editAboutMode, setEditAboutMode] = useState(false);
  const [tempAbout, setTempAbout] = useState('');

  const navigate = useNavigate();
  const storage = getStorage(app);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/professor-login');
        return;
      }
      setUser(currentUser);

      // Fetch professor's document from Firestore
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfessorData(data);

        // Initialize local states
        if (data.name) setTempName(data.name);
        if (data.headline) setTempHeadline(data.headline);
        if (data.pronouns) setTempPronouns(data.pronouns);
        if (data.about) setTempAbout(data.about);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // ---------------------
  // Name Field
  // ---------------------
  const handleNameEdit = () => setEditNameMode(true);
  const handleNameCancel = () => {
    setTempName(professorData?.name || '');
    setEditNameMode(false);
  };
  const handleNameSave = async () => {
    if (!user?.uid) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { name: tempName });
      setProfessorData((prev) => ({ ...prev, name: tempName }));
      setEditNameMode(false);
    } catch (error) {
      console.error('Error updating name:', error);
    }
  };


  // =============== Photo Field ===============
  // get initials if no photo
  const getInitials = () => {
    if (!professorData?.name) return 'P';
    const parts = professorData.name.split(' ');
    return parts.map((p) => p[0]?.toUpperCase() || '').join('') || 'P';
  };

  // Called when user hovers over the avatar container
  const handlePhotoMouseEnter = () => setPhotoHover(true);
  const handlePhotoMouseLeave = () => setPhotoHover(false);

  const handlePhotoClick = () => {
    // If there's a photo, we open the "view photo" modal
    // If there's no photo, maybe do nothing or open edit?
    if (professorData?.photoLink) {
      setViewPhotoMode(true);
    } else {
      // If no photo, we can open the edit modal directly
      setEditPhotoMode(true);
    }
  };

  // Called when user clicks the pen icon on the avatar
  const handlePhotoEditClick = () => {
    setEditPhotoMode(true);
    setPhotoFile(null);
    // Also close the "view photo" modal if it's open
    setViewPhotoMode(false);
  };

  // Called when user picks a file in the modal
  const handlePhotoFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      console.log('Selected photo file:', e.target.files[0].name);
      setPhotoFile(e.target.files[0]);
    }
  };

  // Called when user hits SAVE in the modal
  const handlePhotoSave = async () => {
    console.log('Photo save clicked. photoFile:', photoFile);
    // If no user or no file, do nothing
    if (!user?.uid || !photoFile) {
      console.log('No user or no photo file selected');
      return;
    }
    try {
      // docRef for Firestore
      const docRef = doc(db, 'users', user.uid);

      // Remove old photo if it exists
      if (professorData?.photoPath) {
        console.log('Deleting old photo from storage:', professorData.photoPath);
        const oldRef = ref(storage, professorData.photoPath);
        await deleteObject(oldRef).catch(() => {});
      }

      // Upload new file
      const path = `photos/${user.uid}/${photoFile.name}`;
      console.log('Uploading new photo to:', path);
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, photoFile);
      console.log('Upload complete, fetching downloadURL...');
      const downloadURL = await getDownloadURL(storageRef);
      console.log('downloadURL:', downloadURL);

      // Update Firestore with new link + path
      console.log('Updating Firestore with new photoLink + photoPath');
      await updateDoc(docRef, {
        photoLink: downloadURL,
        photoPath: path,
      });

      // Update local state
      console.log('Updating local professorData');
      setProfessorData((prev) => ({
        ...prev,
        photoLink: downloadURL,
        photoPath: path,
      }));

      // Close the modal
      setEditPhotoMode(false);
      setPhotoFile(null);
      console.log('Photo updated successfully, modal closed.');
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };


  // Called when user clicks DELETE in the modal
  const handlePhotoDelete = async () => {
    console.log('Deleting photo...');
    if (!user?.uid) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      if (professorData?.photoPath) {
        console.log('Removing from storage:', professorData.photoPath);
        const oldRef = ref(storage, professorData.photoPath);
        await deleteObject(oldRef).catch(() => {});
      }
      console.log('Clearing Firestore fields...');
      await updateDoc(docRef, { photoLink: '', photoPath: '' });
      setProfessorData((prev) => ({
        ...prev,
        photoLink: '',
        photoPath: '',
      }));
      setEditPhotoMode(false);
      setPhotoFile(null);
      setViewPhotoMode(false);
      console.log('Photo removed from user profile');
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  };

  // Called when user clicks CANCEL in the modal
  const handlePhotoCancel = () => {
    console.log('Photo edit cancelled');
    setEditPhotoMode(false);
    setPhotoFile(null);
  };


  // =============================
  // NEW: Cover Photo Logic
  // =============================

  // We'll store `coverLink` and `coverPath` in Firestore,
  // just like photoLink/photoPath
  // If there's a cover, show it, else fallback
  const coverLink = professorData?.coverLink || '';

  // Mouse events for the cover banner
  const handleCoverMouseEnter = () => setCoverHover(true);
  const handleCoverMouseLeave = () => setCoverHover(false);

  // If user clicks the cover (not the pen), open "view cover" if it exists
  const handleCoverClick = () => {
    if (coverLink) {
      setViewCoverMode(true);
    } else {
      // If no cover, open the edit modal
      setEditCoverMode(true);
    }
  };

  // If user clicks the pen, open the "edit cover" modal
  const handleCoverEditClick = (e) => {
    e.stopPropagation(); // prevent also opening "view" modal
    setEditCoverMode(true);
    setCoverFile(null);
    setViewCoverMode(false);
  };

  // handle file input for cover
  const handleCoverFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  // Save the cover to Storage & Firestore
  const handleCoverSave = async () => {
    if (!user?.uid || !coverFile) return;
    try {
      const docRef = doc(db, 'users', user.uid);

      // remove old cover if it exists
      if (professorData?.coverPath) {
        const oldRef = ref(storage, professorData.coverPath);
        await deleteObject(oldRef).catch(() => {});
      }

      // upload new
      const path = `cover/${user.uid}/${coverFile.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, coverFile);
      const downloadURL = await getDownloadURL(storageRef);

      // update Firestore
      await updateDoc(docRef, {
        coverLink: downloadURL,
        coverPath: path,
      });

      // update local
      setProfessorData((prev) => ({
        ...prev,
        coverLink: downloadURL,
        coverPath: path,
      }));

      setEditCoverMode(false);
      setCoverFile(null);
    } catch (error) {
      console.error('Error uploading cover:', error);
    }
  };

  // Delete the existing cover
  const handleCoverDelete = async () => {
    if (!user?.uid) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      if (professorData?.coverPath) {
        const oldRef = ref(storage, professorData.coverPath);
        await deleteObject(oldRef).catch(() => {});
      }
      await updateDoc(docRef, { coverLink: '', coverPath: '' });
      setProfessorData((prev) => ({
        ...prev,
        coverLink: '',
        coverPath: '',
      }));
      setEditCoverMode(false);
      setCoverFile(null);
      setViewCoverMode(false);
    } catch (error) {
      console.error('Error removing cover:', error);
    }
  };

  // Cancel the edit cover modal
  const handleCoverCancel = () => {
    setEditCoverMode(false);
    setCoverFile(null);
  };


  // ---------------------
  // Headline Field
  // ---------------------
  const handleHeadlineEdit = () => setEditHeadlineMode(true);
  const handleHeadlineCancel = () => {
    setTempHeadline(professorData?.headline || '');
    setEditHeadlineMode(false);
  };
  const handleHeadlineSave = async () => {
    if (!user?.uid) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { headline: tempHeadline });
      setProfessorData((prev) => ({ ...prev, headline: tempHeadline }));
      setEditHeadlineMode(false);
    } catch (error) {
      console.error('Error updating headline:', error);
    }
  };

  // ---------------------
  // Pronouns Field
  // ---------------------
  const handlePronounsEdit = () => setEditPronounsMode(true);
  const handlePronounsCancel = () => {
    setTempPronouns(professorData?.pronouns || '');
    setEditPronounsMode(false);
  };
  const handlePronounsSave = async () => {
    if (!user?.uid) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { pronouns: tempPronouns });
      setProfessorData((prev) => ({ ...prev, pronouns: tempPronouns }));
      setEditPronounsMode(false);
    } catch (error) {
      console.error('Error updating pronouns:', error);
    }
  };

  // ---------------------
  // About Field
  // ---------------------
  const handleAboutEdit = () => setEditAboutMode(true);
  const handleAboutCancel = () => {
    setTempAbout(professorData?.about || '');
    setEditAboutMode(false);
  };
  const handleAboutSave = async () => {
    if (!user?.uid) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { about: tempAbout });
      setProfessorData((prev) => ({ ...prev, about: tempAbout }));
      setEditAboutMode(false);
    } catch (error) {
      console.error('Error updating about:', error);
    }
  };

  // Resume field methods
  const handleResumeEdit = () => {
    setEditResumeMode(true);
    setResumeFile(null); // reset
  };

  const handleResumeCancel = () => {
    setEditResumeMode(false);
    setResumeFile(null);
  };

  const handleResumeFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Optional: check if file.type === 'application/pdf'
      setResumeFile(file);
    }
  };

  const handleResumeSave = async () => {
    if (!user?.uid || !resumeFile) return;
    try {
      const docRef = doc(db, 'users', user.uid);

      // 1) If there's an old resumePath, remove old file from storage
      if (professorData?.resumePath) {
        const oldRef = ref(storage, professorData.resumePath);
        await deleteObject(oldRef).catch(() => {
          // ignore if file doesn't exist
        });
      }

      // 2) Upload the new file
      const path = `resumes/${user.uid}/${resumeFile.name}`; // NEW: storing path
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, resumeFile);
      const downloadURL = await getDownloadURL(storageRef);

      // 3) Update Firestore with resumeLink + resumePath
      await updateDoc(docRef, {
        resumeLink: downloadURL,
        resumePath: path, // store the path
      });

      // 4) Update local state
      setProfessorData((prev) => ({
        ...prev,
        resumeLink: downloadURL,
        resumePath: path,
      }));

      setEditResumeMode(false);
      setResumeFile(null);
    } catch (error) {
      console.error('Error uploading resume:', error);
    }
  };

  const handleResumeDelete = async () => {
    if (!user?.uid) return;
    try {
      const docRef = doc(db, 'users', user.uid);

      // If we have a stored path, remove from storage
      if (professorData?.resumePath) {
        const resumeRef = ref(storage, professorData.resumePath);
        await deleteObject(resumeRef).catch(() => {
          // ignore if file doesn't exist
        });
      }

      // Clear from Firestore
      await updateDoc(docRef, { resumeLink: '', resumePath: '' });
      setProfessorData((prev) => ({ ...prev, resumeLink: '', resumePath: '' }));
    } catch (error) {
      console.error('Error removing resume:', error);
    }
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  // Decide which photo to show
  const photoLink = professorData?.photoLink || '';
  // If no photo, we show initials
  const initials = getInitials(); // function to get user’s initials from name

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f3f2ef', // LinkedIn-like background
    }}>

      {/* Header / Top Bar */}
      <Box
        sx={{
          backgroundColor: '#fff',
          boxShadow: 1,
          py: 2,
          px: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Campus-Connect
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          maxWidth: '1000px',
          margin: '0 auto',
          mt: 5,
          px: 2,
        }}
      >
        {/* Greeting */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Professor Dashboard
          </Typography>
          {professorData && (
            <Typography variant="body1">
              Welcome, {professorData.name || 'Professor'}!
            </Typography>
          )}
        </Box>

        {/* Card-like container for the tab layout */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            centered
            aria-label="Professor Dashboard Tabs"
            textColor="primary"
            indicatorColor="secondary"
          >
            <Tab label="Profile" {...a11yProps(0)} />
            <Tab label="Research & Interests" {...a11yProps(1)} />
            <Tab label="Courses Offered" {...a11yProps(2)} />
            <Tab label="Discussion" {...a11yProps(3)} />
          </Tabs>

          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            {/* Banner */}
            {/* =============================
                COVER BANNER (NEW CODE)
            ============================= */}
            <Box
              sx={{
                position: 'relative',
                height: 200,
                mb: 15,
                // If coverLink exists, use it; otherwise fallback
                backgroundImage: coverLink
                  ? `url('${coverLink}')`
                  : "url('https://source.unsplash.com/random/1200x300/?abstract')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover .cover-hover-edit': {
                  visibility: 'visible',
                },
              }}
              onClick={handleCoverClick}
              onMouseEnter={handleCoverMouseEnter}
              onMouseLeave={handleCoverMouseLeave}
            >
              {/*
                If user hovers over the banner, show a pen icon in the top-right corner
                to edit the cover photo
              */}
              {coverHover && (
                <IconButton
                  className="cover-hover-edit"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    visibility: 'hidden',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.6)',
                    },
                  }}
                  onClick={handleCoverEditClick}
                >
                  <EditIcon />
                </IconButton>
              )}


              {/* Avatar container */}
              <Box
                sx={{
                  width: 160,
                  height: 160,
                  position: 'absolute',
                  bottom: -55,
                  left: 20,
                  border: '3px solid white',
                  borderRadius: '50%',
                  backgroundColor: '#ccc',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover .photo-hover-edit': {
                    visibility: 'visible',
                  },
                }}
                onClick={handlePhotoClick}
                onMouseEnter={handlePhotoMouseEnter}
                onMouseLeave={handlePhotoMouseLeave}
              >
                <Avatar
                  src={photoLink || ''}
                  alt="Profile Picture"
                  sx={{ width: '100%', height: '100%', ":hover": { opacity: '0.85' } }}
                >
                  {!photoLink && initials}
                </Avatar>
                {photoHover && (
                  <IconButton
                    className="photo-hover-edit"
                    sx={{
                      position: 'absolute',
                      top: 'calc(70% - 5px)',
                      left: 'calc(70% - 25px)',
                      color: 'white',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      visibility: 'hidden',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent also opening "view photo" modal
                      handlePhotoEditClick();
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
            </Box>


            {/* Profile Info */}
            <Box sx={{ 
              textAlign: 'left', 
              mt: -5,
              ml: 2 
            }}>
              {/* Name row with edit icon */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {!editNameMode ? (
                  <>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {professorData?.name || 'Professor Name'}
                    </Typography>
                    <IconButton size="small" onClick={handleNameEdit}>
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <TextField
                      variant="outlined"
                      size="small"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                    />
                    <IconButton size="small" onClick={handleNameSave} color="success">
                      <CheckIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton size="small" onClick={handleNameCancel} color="error">
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  </>
                )}
              </Box>

              {/* Headline row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {!editHeadlineMode ? (
                  <>
                    <Typography variant="subtitle1" color="text.secondary">
                      {professorData?.headline || 'Headline or Job Title'}
                    </Typography>
                    <IconButton size="small" onClick={handleHeadlineEdit}>
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <TextField
                      variant="outlined"
                      size="small"
                      value={tempHeadline}
                      onChange={(e) => setTempHeadline(e.target.value)}
                    />
                    <IconButton size="small" onClick={handleHeadlineSave} color="success">
                      <CheckIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton size="small" onClick={handleHeadlineCancel} color="error">
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  </>
                )}
              </Box>

              {/* Pronouns row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {!editPronounsMode ? (
                  <>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Pronouns: {professorData?.pronouns || 'They/Them'}
                    </Typography>
                    <IconButton size="small" onClick={handlePronounsEdit}>
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <TextField
                      variant="outlined"
                      size="small"
                      value={tempPronouns}
                      onChange={(e) => setTempPronouns(e.target.value)}
                    />
                    <IconButton size="small" onClick={handlePronounsSave} color="success">
                      <CheckIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton size="small" onClick={handlePronounsCancel} color="error">
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  </>
                )}
              </Box>

              {/* About / short bio row */}
              {!editAboutMode ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {professorData?.about || `This is a placeholder about section. Lorem ipsum...`}
                  </Typography>
                  <IconButton size="small" onClick={handleAboutEdit}>
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    variant="outlined"
                    multiline
                    rows={3}
                    fullWidth
                    value={tempAbout}
                    onChange={(e) => setTempAbout(e.target.value)}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <IconButton size="small" onClick={handleAboutSave} color="success">
                      <CheckIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton size="small" onClick={handleAboutCancel} color="error">
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {/* Resume row */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Resume:</strong>{' '}
                  {professorData?.resumeLink ? (
                    <Button 
                      variant="text"
                      component="a"
                      href={professorData.resumeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ textTransform: 'none' }}
                    >
                      View PDF
                    </Button>
                  ) : (
                    'No resume uploaded'
                  )}
                </Typography>

                {!editResumeMode ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" onClick={handleResumeEdit}>
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                    {professorData?.resumeLink && (
                      <IconButton size="small" onClick={handleResumeDelete} color="error">
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                    <Button variant="outlined" component="label">
                      {resumeFile ? `Selected: ${resumeFile.name}` : 'Select PDF'}
                      <input
                        type="file"
                        accept="application/pdf"
                        hidden
                        onChange={handleResumeFileChange}
                      />
                    </Button>

                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <IconButton size="small" onClick={handleResumeSave} color="success">
                        <CheckIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton size="small" onClick={handleResumeCancel} color="error">
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </TabPanel>

          {/* Research & Interests Tab */}
          {/* <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>Research & Interests</Typography>
            <Typography variant="body2">
              This tab displays your Research & Interests details.
            </Typography>
          </TabPanel> */}
          <TabPanel value={tabValue} index={1}>
            <ProfessorResearch />
          </TabPanel>


          {/* Courses Offered Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>Courses Offered</Typography>
            <ProfessorCourses />
          </TabPanel>

          {/* Discussion Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>Discussion</Typography>
            <Typography variant="body2">
              Here you can view and manage discussions with interested students.
            </Typography>
          </TabPanel>
        </Paper>
      </Box>


      {/* =============================
          VIEW COVER MODAL (NEW)
      ============================= */}
      <Dialog
        open={viewCoverMode}
        onClose={() => setViewCoverMode(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Cover Photo</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {coverLink ? (
            <img
              src={coverLink}
              alt="Cover Preview"
              style={{ width: '100%', borderRadius: '8px' }}
            />
          ) : (
            <Typography>No cover photo</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {/* Edit => close the view cover modal, open the edit cover modal */}
          <Button
            onClick={() => {
              setViewCoverMode(false);
              setEditCoverMode(true);
              setCoverFile(null);
            }}
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
          {/* Delete => remove the cover */}
          {coverLink && (
            <Button
              onClick={handleCoverDelete}
              color="error"
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          )}
          <Button onClick={() => setViewCoverMode(false)} startIcon={<CloseIcon />}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* =============================
          EDIT COVER MODAL (NEW)
      ============================= */}
      <Dialog
        open={editCoverMode}
        onClose={handleCoverCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Update Cover Photo</DialogTitle>
        <DialogContent>
          <Button variant="outlined" component="label">
            {coverFile ? `Selected: ${coverFile.name}` : 'Select Cover'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleCoverFileChange}
            />
          </Button>

          {/* Show Delete button only if there's an existing cover */}
          {professorData?.coverLink && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleCoverDelete}
                startIcon={<DeleteIcon />}
              >
                Remove Current Cover
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCoverCancel} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button onClick={handleCoverSave} startIcon={<CheckIcon />} color="success">
            Save
          </Button>
        </DialogActions>
      </Dialog>


      {/* VIEW PHOTO MODAL (for just viewing the bigger photo, plus Edit & Delete) */}
      <Dialog
        open={viewPhotoMode}
        onClose={() => setViewPhotoMode(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Profile Photo</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {photoLink ? (
            <img
              src={photoLink}
              alt="Profile Preview"
              style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
          ) : (
            <Avatar sx={{ width: 100, height: 100 }}>
              {initials}
            </Avatar>
          )}
        </DialogContent>
        <DialogActions>
          {/* Edit => close the view modal, open the edit modal */}
          <Button
            onClick={() => {
              setViewPhotoMode(false);
              handlePhotoEditClick();
            }}
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
          {/* Delete => remove the photo */}
          {photoLink && (
            <Button
              onClick={handlePhotoDelete}
              color="error"
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          )}
          <Button onClick={() => setViewPhotoMode(false)} startIcon={<CloseIcon />}>
            Close
          </Button>
        </DialogActions>
      </Dialog>


      {/* PHOTO EDIT MODAL */}
      <Dialog open={editPhotoMode} onClose={handlePhotoCancel} maxWidth="xs" fullWidth>
        <DialogTitle>Update Profile Photo</DialogTitle>
        <DialogContent>
          <Button variant="outlined" component="label">
            {photoFile ? `Selected: ${photoFile.name}` : 'Select Photo'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoFileChange}
            />
          </Button>

          {/* Show Delete button only if there's an existing photo */}
          {professorData?.photoLink && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handlePhotoDelete}
                startIcon={<DeleteIcon />}
              >
                Remove Current Photo
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePhotoCancel} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button onClick={handlePhotoSave} startIcon={<CheckIcon />} color="success">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfessorDashboard;