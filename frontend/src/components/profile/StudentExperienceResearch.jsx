/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/profile/StudentExperienceResearch.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Chip, Stack, IconButton, CircularProgress, Alert, Paper, Divider, Link as MuiLink } from '@mui/material';
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
  const [crudError, setCrudError] = useState(null); // Error during save/update/delete


  // Update local state if the prop changes (e.g., parent re-fetches)
  useEffect(() => {
    setDisplayTags(studentData?.experienceTags || []);
  }, [studentData?.experienceTags]);


  // --- Effect for fetching STRUCTURED experiences ---
  useEffect(() => {
    let unsubscribe = () => {};
    const currentUser = auth.currentUser;

    if (currentUser?.uid) {
      setLoadingExperiences(true);
      setExperienceError(null);
      const experiencesCollectionRef = collection(db, 'users', currentUser.uid, 'experiences');
      // Order by start date descending? Or type then start date?
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
      // No user logged in
      setExperiences([]);
      setLoadingExperiences(false);
    }

    // Cleanup listener
    return () => unsubscribe();
  }, []); // Fetch only once on mount (or when user changes if uid was dependency)


  // --- Tag Handlers ---
  const handleAddTag = async () => {
    const tagToAdd = newTag.trim();
    setTagError('');

    if (!tagToAdd) { setTagError('Tag cannot be empty.'); return; }
    if (displayTags.some(tag => tag.toLowerCase() === tagToAdd.toLowerCase())) {
      setTagError(`Tag "${tagToAdd}" already exists.`); setNewTag(''); return;
    }
    if (displayTags.length >= TAG_LIMIT) {
      setTagError(`You have reached the maximum limit of ${TAG_LIMIT} tags.`); setNewTag(''); return;
    }
    if (!auth.currentUser?.uid) { setTagError("Not authenticated."); return; }

    setIsProcessingTag(true);
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await updateDoc(userDocRef, { experienceTags: arrayUnion(tagToAdd) });
      setNewTag(''); // Clear input field on success
    } catch (err) {
      console.error("Error adding tag:", err); setTagError("Failed to add tag. Please try again.");
    } finally {
      setIsProcessingTag(false);
    }
  };


  const handleRemoveTag = async (tagToRemove) => {
    if (!auth.currentUser?.uid) { setTagError("Not authenticated."); return; }
    if (isProcessingTag) return; // Prevent multiple removals

    setIsProcessingTag(true); setTagError('');
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await updateDoc(userDocRef, { experienceTags: arrayRemove(tagToRemove) });
      // UI updates via onSnapshot from parent or tag state update
    } catch (err) {
      console.error("Error removing tag:", err); setTagError("Failed to remove tag. Please try again.");
    } finally {
      setIsProcessingTag(false);
    }
  };


  // --- Experience Modal Handlers ---
  const handleOpenAddExperienceModal = () => {
    setEditingExperienceData(null); // Clear any previous edit data
    setCrudError(null); // Clear previous errors
    setIsExperienceModalOpen(true);
  };

  const handleOpenEditExperienceModal = (experienceData) => {
    setEditingExperienceData(experienceData); // Set data for editing
    setCrudError(null); // Clear previous errors
    setIsExperienceModalOpen(true);
  };

  const handleCloseExperienceModal = () => {
    setIsExperienceModalOpen(false);
    // Optionally clear editing data after close animation:
    // setTimeout(() => setEditingExperienceData(null), 300);
  };

  // --- Experience CRUD Handlers ---
  const handleSaveExperience = async (formData, experienceId) => {
      const currentUser = auth.currentUser;
      if (!currentUser?.uid) {
          setCrudError("Authentication error. Cannot save.");
          throw new Error("User not authenticated."); // Throw error to be caught by form
      }

      setIsSavingExperience(true);
      setCrudError(null);
      const userId = currentUser.uid;

      try {
          if (experienceId) {
              // --- Update Existing Experience ---
              const experienceDocRef = doc(db, 'users', userId, 'experiences', experienceId);
              await updateDoc(experienceDocRef, formData);
              console.log("Experience updated successfully:", experienceId);
          } else {
              // --- Add New Experience ---
              const experiencesCollectionRef = collection(db, 'users', userId, 'experiences');
              await addDoc(experiencesCollectionRef, formData);
              console.log("Experience added successfully");
          }
          handleCloseExperienceModal(); // Close modal on success
      } catch (err) {
          console.error("Error saving experience:", err);
          setCrudError(`Failed to save experience: ${err.message}. Please try again.`);
          // Re-throw the error so the form's catch block can also see it if needed
          throw err;
      } finally {
          setIsSavingExperience(false);
      }
  };


  const handleDeleteExperience = async (experienceId) => {
    const currentUser = auth.currentUser;
    if (!currentUser?.uid) {
        setCrudError("Authentication error. Cannot delete.");
        alert("Authentication error. Cannot delete."); // Simple feedback
        return;
    }
    if (isSavingExperience) return; // Prevent delete while another operation is running

    // Confirmation Dialog
    if (!window.confirm("Are you sure you want to delete this experience entry? This action cannot be undone.")) {
        return; // User cancelled
    }

    setIsSavingExperience(true);
    setCrudError(null);
    const userId = currentUser.uid;

    try {
        const experienceDocRef = doc(db, 'users', userId, 'experiences', experienceId);
        await deleteDoc(experienceDocRef);
        console.log("Experience deleted successfully:", experienceId);
        // UI will update via onSnapshot listener
        alert("Experience deleted successfully."); // Simple feedback
    } catch (err) {
        console.error("Error deleting experience:", err);
        setCrudError(`Failed to delete experience: ${err.message}. Please try again.`);
        alert(`Failed to delete experience: ${err.message}`); // Simple feedback
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
    <Box>
      {/* --- Tags Section --- */}
      <Typography variant="h5" gutterBottom>
        My Experience & Research Interests
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Add relevant keywords, skills, or research (e.g., &apos;React&apos;, &apos;Machine Learning&apos;). Max {TAG_LIMIT}.
      </Typography>
      <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddTag(); }} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 3 }}>
        <TextField
          label={limitReached ? `Tag limit (${TAG_LIMIT}) reached` : "Add New Tag"}
          variant="outlined" size="small" value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          disabled={isProcessingTag || limitReached}
          sx={{ flexGrow: 1 }}
        />
        <Button
          type="submit" variant="contained"
          startIcon={isProcessingTag ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutlineIcon />}
          disabled={isProcessingTag || !newTag.trim() || limitReached}
        > Add </Button>
      </Box>
      {tagError && <Alert severity="warning" sx={{ mb: 2 }}>{tagError}</Alert>}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
          Current Tags ({displayTags.length}/{TAG_LIMIT}):
      </Typography>
      {displayTags.length > 0 ? (
        <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
          {displayTags.map((tag) => (
            <Chip
              key={tag} label={tag}
              onDelete={isProcessingTag ? undefined : () => handleRemoveTag(tag)}
              deleteIcon={<CancelIcon />}
              disabled={isProcessingTag}
            />
          ))}
        </Stack>
      ) : ( <Typography variant="body2" color="text.secondary"> No tags added yet. </Typography> )}

      <Divider sx={{ my: 4 }} />

      {/* --- Structured Experience Section --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom component="div">Detailed Experience</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddExperienceModal} size="small" disabled={isSavingExperience}>
          Add Experience
        </Button>
      </Box>

      {/* Display CRUD errors here */}
       {crudError && <Alert severity="error" sx={{ mb: 2 }}>{crudError}</Alert>}

      {/* Loading and Empty States */}
      {loadingExperiences && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3}}><CircularProgress size={24} /></Box>}
      {experienceError && !loadingExperiences && <Alert severity="error">{experienceError}</Alert>}
      {!loadingExperiences && !experienceError && experiences.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
          No detailed experiences added yet. Click &quot;Add Experience&quot; to get started.
        </Typography>
      )}

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
          userId={auth.currentUser?.uid} // Pass current user's ID
          isSaving={isSavingExperience} // Pass saving state to disable form controls
       />

    </Box>
  );
};

export default StudentExperienceResearch;