/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Chip, Stack, IconButton, CircularProgress, Alert as MuiAlert, Paper, Divider, Link as MuiLink, Snackbar } from '@mui/material';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, query, onSnapshot, orderBy, addDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase'; // Adjust path if needed
import ExperienceForm from './ExperienceForm';

// --- Icons ---
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// --- Define the tag limit ---
const TAG_LIMIT = 15;

// --- Helper function to format Dates ---
const formatExperienceDate = (timestamp) => {
    if (!timestamp?.toDate) return 'N/A';
    try {
        return timestamp.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
    } catch (e) {
        console.error("Error formatting date:", e, timestamp);
        return 'Invalid Date';
    }
};

// --- Snackbar Alert ForwardRef ---
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ProfessorExperienceResearch = ({ professorData }) => {
  const [newTag, setNewTag] = useState('');
  const [displayTags, setDisplayTags] = useState(professorData?.experienceTags || []);
  const [isProcessingTag, setIsProcessingTag] = useState(false);
  const [tagError, setTagError] = useState('');
  const [experiences, setExperiences] = useState([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);
  const [experienceError, setExperienceError] = useState(null);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperienceData, setEditingExperienceData] = useState(null);
  const [isSavingExperience, setIsSavingExperience] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    setDisplayTags(professorData?.experienceTags || []);
  }, [professorData?.experienceTags]);

  useEffect(() => {
    let unsubscribe = () => {};
    if (userId) {
      setLoadingExperiences(true);
      setExperienceError(null);
      const experiencesCollectionRef = collection(db, 'users', userId, 'experiences');
      const q = query(experiencesCollectionRef, orderBy('startDate', 'desc'));

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedExperiences = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExperiences(fetchedExperiences);
        setLoadingExperiences(false);
      }, (error) => {
        console.error("Error listening to professor experiences:", error);
        setExperienceError("Failed to load detailed experiences.");
        setLoadingExperiences(false);
      });
    } else {
      setExperiences([]);
      setLoadingExperiences(false);
      setExperienceError("Cannot load experiences: User not authenticated.");
    }
    return () => unsubscribe();
  }, [userId]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleAddTag = async () => {
    const tagToAdd = newTag.trim();
    setTagError('');
    if (!tagToAdd) { setTagError('Tag cannot be empty.'); return; }
    if (displayTags.some(tag => tag.toLowerCase() === tagToAdd.toLowerCase())) {
      setTagError(`Tag "${tagToAdd}" already exists.`); setNewTag(''); return;
    }
    if (displayTags.length >= TAG_LIMIT) {
      setTagError(`Tag limit (${TAG_LIMIT}) reached.`); setNewTag(''); return;
    }
    if (!userId) { setTagError("Not authenticated."); return; }

    setIsProcessingTag(true);
    const userDocRef = doc(db, 'users', userId);
    try {
      await updateDoc(userDocRef, { experienceTags: arrayUnion(tagToAdd) });
      setNewTag('');
      showSnackbar(`Tag "${tagToAdd}" added successfully!`, 'success');
    } catch (err) {
      console.error("Error adding tag:", err);
      setTagError("Failed to add tag.");
      showSnackbar('Failed to add tag.', 'error');
    } finally {
      setIsProcessingTag(false);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    if (!userId) { setTagError("Not authenticated."); return; }
    if (isProcessingTag) return;
    setIsProcessingTag(true); setTagError('');
    const userDocRef = doc(db, 'users', userId);
    try {
      await updateDoc(userDocRef, { experienceTags: arrayRemove(tagToRemove) });
      showSnackbar(`Tag "${tagToRemove}" removed.`, 'success');
    } catch (err) {
      console.error("Error removing tag:", err);
      setTagError("Failed to remove tag.");
      showSnackbar('Failed to remove tag.', 'error');
    } finally {
      setIsProcessingTag(false);
    }
  };

  const handleOpenAddExperienceModal = () => { setEditingExperienceData(null); setIsExperienceModalOpen(true); };
  const handleOpenEditExperienceModal = (experienceData) => { setEditingExperienceData(experienceData); setIsExperienceModalOpen(true); };
  const handleCloseExperienceModal = () => { setIsExperienceModalOpen(false); };

  const handleSaveExperience = async (formData, experienceId) => {
    if (!userId) {
      showSnackbar("Authentication error. Cannot save.", "error");
      throw new Error("User not authenticated.");
    }
    setIsSavingExperience(true);
    try {
      let message = '';
      if (experienceId) {
        const experienceDocRef = doc(db, 'users', userId, 'experiences', experienceId);
        await updateDoc(experienceDocRef, formData);
        message = 'Experience updated successfully!';
      } else {
        const experiencesCollectionRef = collection(db, 'users', userId, 'experiences');
        await addDoc(experiencesCollectionRef, formData);
        message = 'Experience added successfully!';
      }
      handleCloseExperienceModal();
      showSnackbar(message, 'success');
    } catch (err) {
      console.error("Error saving experience:", err);
      showSnackbar(`Failed to save experience: ${err.message}`, 'error');
      throw err;
    } finally {
      setIsSavingExperience(false);
    }
  };

  const handleDeleteExperience = async (experienceId) => {
    if (!userId) { showSnackbar("Authentication error.", "error"); return; }
    if (isSavingExperience) return;
    if (!window.confirm("Are you sure you want to delete this experience?")) return;

    setIsSavingExperience(true);
    try {
      const experienceDocRef = doc(db, 'users', userId, 'experiences', experienceId);
      await deleteDoc(experienceDocRef);
      showSnackbar("Experience deleted successfully.", 'success');
    } catch (err) {
      console.error("Error deleting experience:", err);
      showSnackbar(`Failed to delete experience: ${err.message}`, 'error');
    } finally {
      setIsSavingExperience(false);
    }
  };

  const groupedExperiences = experiences.reduce((acc, exp) => {
    const type = exp.type || 'other';
    if (!acc[type]) { acc[type] = []; }
    acc[type].push(exp);
    return acc;
  }, {});
  const limitReached = displayTags.length >= TAG_LIMIT;

  return (
    <Box sx={{ p: 1, mt: 4 }}>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
           Areas of Expertise
          </Typography>
        </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Add relevant keywords for your work, research areas, or skills. Max {TAG_LIMIT}.
      </Typography>

      <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddTag(); }} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 3 }}>
        <TextField label={limitReached ? `Tag limit (${TAG_LIMIT}) reached` : "Add New Tag/Keyword"} variant="outlined" size="small" value={newTag} onChange={(e) => setNewTag(e.target.value)} disabled={isProcessingTag || limitReached} sx={{ flexGrow: 1 }} />
        <Button type="submit" variant="contained" startIcon={isProcessingTag ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutlineIcon />} disabled={isProcessingTag || !newTag.trim() || limitReached}>
          Add
        </Button>
      </Box>

      {tagError && <Alert severity="warning" sx={{ mb: 2 }}>{tagError}</Alert>}

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
        Current Tags/Keywords ({displayTags.length}/{TAG_LIMIT}):
      </Typography>

      {displayTags.length > 0 ? (
        <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
          {displayTags.map((tag) => (
            <Chip key={tag} label={tag} onDelete={isProcessingTag ? undefined : () => handleRemoveTag(tag)} deleteIcon={<CancelIcon />} disabled={isProcessingTag} />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No tags added yet.
        </Typography>
      )}

      <Divider sx={{ my: 4 }} />

      {/* --- Corrected My Experience Section --- */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { xs: 'center', sm: 'space-between' },
          alignItems: 'center',
          textAlign: { xs: 'center', sm: 'left' },
          gap: { xs: 1.5, sm: 0 },
          mb: 2
        }}
      >
        <Typography variant="h5" component="div" sx={{ whiteSpace: 'nowrap' }}>
          My Experience
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddExperienceModal} size="small" disabled={isSavingExperience}>
          Add Experience
        </Button>
      </Box>

      {experienceError && !loadingExperiences && <Alert severity="error" sx={{ mb: 2 }}>{experienceError}</Alert>}
      {loadingExperiences && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress size={24} /></Box>}

      {!loadingExperiences && !experienceError && experiences.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
          No detailed experiences added yet.
        </Typography>
      )}

      {!loadingExperiences && !experienceError && experiences.length > 0 && (
        <Stack spacing={4} sx={{ mt: 2 }}>
          {Object.entries(groupedExperiences).map(([type, exps]) => (
            <Box key={type}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', textTransform: 'capitalize' }}>
                {type === 'work' ? 'Work Experience' : type === 'research' ? 'Research Experience' : type === 'project' ? 'Projects' : type === 'volunteer' ? 'Volunteer Experience' : 'Other Experience'}
              </Typography>

              <Stack spacing={2}>
                {exps.map(exp => (
                  <Paper key={exp.id} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 'bold' }}>{exp.title || 'N/A'}</Typography>
                        <Typography variant="body2" color="text.secondary">{exp.organization || 'N/A'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatExperienceDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatExperienceDate(exp.endDate)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleOpenEditExperienceModal(exp)} disabled={isSavingExperience} aria-label="Edit experience">
                          <EditIcon fontSize='small' />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteExperience(exp.id)} disabled={isSavingExperience} color="error" aria-label="Delete experience">
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Box>
                    </Box>

                    {exp.description && <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{exp.description}</Typography>}
                    {exp.link && <MuiLink href={exp.link} target="_blank" rel="noopener noreferrer" variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                      Visit Link
                    </MuiLink>}
                  </Paper>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <ExperienceForm
        open={isExperienceModalOpen}
        onClose={handleCloseExperienceModal}
        onSave={handleSaveExperience}
        initialData={editingExperienceData}
        userId={userId}
        isSaving={isSavingExperience}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default ProfessorExperienceResearch;
