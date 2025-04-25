/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/profile/StudentExperienceResearch.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Chip, Stack, IconButton, CircularProgress, Alert as MuiAlert, Paper, Divider, Link as MuiLink, Snackbar } from '@mui/material';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, query, onSnapshot, orderBy, addDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase'; // Adjust path if needed
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';     // For Edit button
import DeleteIcon from '@mui/icons-material/Delete'; // For Delete button
import AddIcon from '@mui/icons-material/Add';       // For Add Experience button
import ExperienceForm from './ExperienceForm'; // Assuming it's in the same directory

// --- Define the tag limit ---
const TAG_LIMIT = 15;

// --- Helper function to format Dates (Optional but Recommended) ---
// You might want to install date-fns: npm install date-fns
// import { format } from 'date-fns';
const formatExperienceDate = (timestamp) => {
  if (!timestamp?.toDate) return 'N/A';
  try {
      // Example format, adjust as needed
      // return format(timestamp.toDate(), 'MMM yyyy');
      return timestamp.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short'});
  } catch (e) {
      return 'Invalid Date';
  }
};
// --- End Date Helper ---

// --- Snackbar Alert ForwardRef ---
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
// --- End Snackbar Alert ---


const StudentExperienceResearch = ({ studentData }) => {
  // State for Tags
  const [newTag, setNewTag] = useState('');
  const [displayTags, setDisplayTags] = useState(studentData?.experienceTags || []);
  const [isProcessingTag, setIsProcessingTag] = useState(false); // Renamed for clarity
  const [tagError, setTagError] = useState('');

  // State for Structured Experiences
  const [experiences, setExperiences] = useState([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);
  const [experienceError, setExperienceError] = useState(null); // Error during fetch

  // --- State for Experience Modal ---
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperienceData, setEditingExperienceData] = useState(null); // null for add, object for edit
  const [isSavingExperience, setIsSavingExperience] = useState(false); // Loading state for save/update/delete
  // const [crudError, setCrudError] = useState(null); // Error during save/update/delete

  // --- Snackbar State ---
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  // Use authenticated user's ID
  const userId = auth.currentUser?.uid; // Define userId here

  // Update local state if the prop changes (e.g., parent re-fetches)
  useEffect(() => {
    setDisplayTags(studentData?.experienceTags || []);
  }, [studentData?.experienceTags]);


  // --- Effect for fetching STRUCTURED experiences ---
  useEffect(() => {
    let unsubscribe = () => {};
    // const currentUser = auth.currentUser; // Use userId defined above

    if (userId) { // Use userId
      setLoadingExperiences(true);
      setExperienceError(null);
      const experiencesCollectionRef = collection(db, 'users', userId, 'experiences'); // Use userId
      const q = query(experiencesCollectionRef, orderBy('startDate', 'desc'));

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedExperiences = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExperiences(fetchedExperiences);
        setLoadingExperiences(false);
      }, (error) => {
        console.error("Error listening to experiences:", error);
        setExperienceError("Failed to load experiences.");
        setLoadingExperiences(false);
      });

    } else {
      setExperiences([]);
      setLoadingExperiences(false);
      // Consider setting an error if user should be logged in
      // setExperienceError("Please log in to manage experiences.");
    }
    // Cleanup listener
    return () => unsubscribe();
  }, [userId]); // Depend on userId


  // --- Snackbar Handler (NEW) ---
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
        return;
    }
    setSnackbarOpen(false);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  // --- End Snackbar Handler ---


  // --- Tag Handlers (MODIFIED for Snackbar) ---
  const handleAddTag = async () => {
    const tagToAdd = newTag.trim();
    setTagError(''); // Keep inline tag error
    if (!tagToAdd) { setTagError('Tag cannot be empty.'); return; }
    if (displayTags.some(tag => tag.toLowerCase() === tagToAdd.toLowerCase())) {
      setTagError(`Tag "${tagToAdd}" already exists.`); setNewTag(''); return;
    }
    if (displayTags.length >= TAG_LIMIT) {
      setTagError(`You have reached the maximum limit of ${TAG_LIMIT} tags.`); setNewTag(''); return;
    }
    // Use userId defined earlier
    if (!userId) { showSnackbar("Not authenticated.", "error"); return; }

    setIsProcessingTag(true);
    const userDocRef = doc(db, 'users', userId); // Use userId
    try {
      await updateDoc(userDocRef, { experienceTags: arrayUnion(tagToAdd) });
      setNewTag('');
      // Optionally show success snackbar
      showSnackbar(`Tag "${tagToAdd}" added!`, 'success');
    } catch (err) {
      console.error("Error adding tag:", err);
      // Use snackbar for error feedback
      showSnackbar("Failed to add tag. Please try again.", "error");
    } finally {
      setIsProcessingTag(false);
    }
  };


  const handleRemoveTag = async (tagToRemove) => {
    // Use userId defined earlier
    if (!userId) { showSnackbar("Not authenticated.", "error"); return; }
    if (isProcessingTag) return;

    setIsProcessingTag(true); setTagError(''); // Clear inline error on attempt
    const userDocRef = doc(db, 'users', userId); // Use userId
    try {
      await updateDoc(userDocRef, { experienceTags: arrayRemove(tagToRemove) });
      // Optionally show success snackbar
      showSnackbar(`Tag "${tagToRemove}" removed.`, 'success');
    } catch (err) {
      console.error("Error removing tag:", err);
      // Use snackbar for error feedback
      showSnackbar("Failed to remove tag. Please try again.", "error");
    } finally {
      setIsProcessingTag(false);
    }
  };


  // --- Experience Modal Handlers ---
  const handleOpenAddExperienceModal = () => {
    setEditingExperienceData(null); // Clear any previous edit data
    // setCrudError(null); // Clear previous errors
    setIsExperienceModalOpen(true);
  };

  const handleOpenEditExperienceModal = (experienceData) => {
    setEditingExperienceData(experienceData); // Set data for editing
    // setCrudError(null); // Clear previous errors
    setIsExperienceModalOpen(true);
  };

  const handleCloseExperienceModal = () => {
    setIsExperienceModalOpen(false);
    // Optionally clear editing data after close animation:
    setTimeout(() => setEditingExperienceData(null), 300);
  };


  // --- Experience CRUD Handlers (MODIFIED for Snackbar) ---
  const handleSaveExperience = async (formData, experienceId) => {
    // const currentUser = auth.currentUser; // Use userId defined earlier
    if (!userId) { // Use userId
        showSnackbar("Authentication error. Cannot save.", "error");
        throw new Error("User not authenticated.");
    }

    setIsSavingExperience(true);
    // setCrudError(null); // Remove if not using crudError state

    try {
        let message = '';
        if (experienceId) { // Update
            const experienceDocRef = doc(db, 'users', userId, 'experiences', experienceId);
            await updateDoc(experienceDocRef, formData);
            message = 'Experience updated successfully!';
        } else { // Add
            const experiencesCollectionRef = collection(db, 'users', userId, 'experiences');
            await addDoc(experiencesCollectionRef, formData);
            message = 'Experience added successfully!';
        }
        handleCloseExperienceModal();
        showSnackbar(message, 'success'); // Show success message
    } catch (err) {
        console.error("Error saving experience:", err);
        showSnackbar(`Failed to save experience: ${err.message}`, 'error'); // Show error message
        throw err; // Re-throw so ExperienceForm can also catch it
    } finally {
        setIsSavingExperience(false);
    }
  };


  const handleDeleteExperience = async (experienceId) => {
    // const currentUser = auth.currentUser; // Use userId defined earlier
    if (!userId) { // Use userId
        showSnackbar("Authentication error. Cannot delete.", "error");
        return;
    }
    if (isSavingExperience) return;

    if (!window.confirm("Are you sure you want to delete this experience entry? This action cannot be undone.")) {
        return;
    }

    setIsSavingExperience(true);
    // setCrudError(null); // Remove if not using crudError state

    try {
        const experienceDocRef = doc(db, 'users', userId, 'experiences', experienceId);
        await deleteDoc(experienceDocRef);
        console.log("Experience deleted successfully:", experienceId);
        showSnackbar("Experience deleted successfully.", 'success'); // Show success message
    } catch (err) {
        console.error("Error deleting experience:", err);
        showSnackbar(`Failed to delete experience: ${err.message}`, 'error'); // Show error message
    } finally {
        setIsSavingExperience(false);
    }
  };
  // --- End Experience CRUD Handlers ---


  // Group experiences by type for rendering
  const groupedExperiences = experiences.reduce((acc, exp) => {
    const type = exp.type || 'other'; // Group undefined types as 'other'
    if (!acc[type]) { acc[type] = []; }
    acc[type].push(exp);
    return acc;
  }, {});


  // Calculate if the limit is reached to disable input/button
  const limitReached = displayTags.length >= TAG_LIMIT;

  return (
    <Box sx={{p:3}}>
      {/* --- Tags Section --- */}
      {/* --- Tags Section (Keep as is, uses tagError state for inline feedback) --- */}
      <Typography variant="h5" gutterBottom> My Experience & Research Interests </Typography>
       <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}> Add relevant keywords, skills, or research. Max {TAG_LIMIT}. </Typography>
       <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddTag(); }} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 3 }}>
             <TextField label={limitReached ? `Tag limit (${TAG_LIMIT}) reached` : "Add New Tag"} variant="outlined" size="small" value={newTag} onChange={(e) => setNewTag(e.target.value)} disabled={isProcessingTag || limitReached} sx={{ flexGrow: 1 }} />
             <Button type="submit" variant="contained" startIcon={isProcessingTag ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutlineIcon />} disabled={isProcessingTag || !newTag.trim() || limitReached}> Add </Button>
       </Box>
       {tagError && <MuiAlert severity="warning" sx={{ mb: 2 }}>{tagError}</MuiAlert>} {/* Keep inline tag error */}
       <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}> Tags ({displayTags.length}/{TAG_LIMIT}): </Typography>
       {displayTags.length > 0 ? ( <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap> {displayTags.map((tag) => ( <Chip key={tag} label={tag} onDelete={isProcessingTag ? undefined : () => handleRemoveTag(tag)} deleteIcon={<CancelIcon />} disabled={isProcessingTag} /> ))} </Stack> ) : ( <Typography variant="body2" color="text.secondary"> No tags added yet. </Typography> )}

      <Divider sx={{ my: 4 }} />

      {/* --- Structured Experience Section --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom component="div">Experiences</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddExperienceModal} size="small" disabled={isSavingExperience}> Add Experience </Button>
      </Box>

      {/* Display fetch errors */}
      {experienceError && !loadingExperiences && <MuiAlert severity="error" sx={{ mb: 2 }}>{experienceError}</MuiAlert>} {/* Keep fetch error */}

      {/* Loading and Empty States (Keep as is) */}
      {loadingExperiences && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3}}><CircularProgress size={24} /></Box>}
       {!loadingExperiences && !experienceError && experiences.length === 0 && ( <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}> No detailed experiences added yet. Click &quot;Add Experience&quot; to get started. </Typography> )}

      {/* Render Experience Groups */}
      {!loadingExperiences && !experienceError && experiences.length > 0 && (
        <Stack spacing={4} sx={{ mt: 2 }}>
          {Object.entries(groupedExperiences).map(([type, exps]) => (
              <Box key={type}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', textTransform: 'capitalize' }}>
                    {/* Simple title based on type */}
                    {type === 'work' ? 'Work Experience' :
                     type === 'research' ? 'Research Experience' :
                     type === 'project' ? 'Projects' :
                     type === 'volunteer' ? 'Volunteer Experience' :
                     'Other Experience' }
                </Typography>
                <Stack spacing={2}>
                  {exps.map(exp => (
                    <Paper key={exp.id} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                       {/* Add overlay if deleting this specific item? Maybe too complex for now */}
                       {/* {isSavingExperience && editingExperienceData?.id === exp.id && <CircularProgress size={16} sx={{position: 'absolute', top: 8, right: 8}}/> } */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                           <Box>
                              <Typography sx={{ fontWeight: 'bold' }}>{exp.title || 'N/A'}</Typography>
                              <Typography variant="body2" color="text.secondary">{exp.organization || 'N/A'}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                  {formatExperienceDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatExperienceDate(exp.endDate)}
                              </Typography>
                           </Box>
                           {/* Action Buttons */}
                           <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton size="small" onClick={() => handleOpenEditExperienceModal(exp)} disabled={isSavingExperience} aria-label="Edit experience">
                                    <EditIcon fontSize='small'/>
                                </IconButton>
                                <IconButton size="small" onClick={() => handleDeleteExperience(exp.id)} disabled={isSavingExperience} color="error" aria-label="Delete experience">
                                    <DeleteIcon fontSize='small' />
                                </IconButton>
                           </Box>
                        </Box>
                        {exp.description && <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{exp.description}</Typography>}
                        {exp.link && <MuiLink href={exp.link} target="_blank" rel="noopener noreferrer" variant="caption" sx={{ display: 'block', mt: 0.5 }}>Visit Link</MuiLink>}
                    </Paper>
                  ))}
                </Stack>
              </Box>
            ))}
        </Stack>
      )}

      {/* --- Render ExperienceForm Modal --- */}
      {/* Render only when needed, or always and rely on 'open' prop */}
      <ExperienceForm
          open={isExperienceModalOpen}
          onClose={handleCloseExperienceModal}
          onSave={handleSaveExperience} // This function handles Firestore add/update
          initialData={editingExperienceData}
          userId={userId} // Pass current user's ID
          isSaving={isSavingExperience} // Pass saving state to disable form controls
       />

       {/* --- Snackbar Component (NEW) --- */}
       <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                {snackbarMessage}
            </Alert>
       </Snackbar>
       {/* --- End Snackbar --- */}

    </Box>
  );
};

export default StudentExperienceResearch;