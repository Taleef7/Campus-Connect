/* eslint-disable react/prop-types */
// src/components/profile/ProfessorExperienceResearch.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Chip, Stack, CircularProgress, Alert } from '@mui/material';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../../firebase'; // Adjust path if needed
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';

// Use the same tag limit
const TAG_LIMIT = 15;

// Accept professorData prop
const ProfessorExperienceResearch = ({ professorData }) => {
  const [newTag, setNewTag] = useState('');
  // Use experienceTags field, default to empty array
  const [displayTags, setDisplayTags] = useState(professorData?.experienceTags || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Update local state if the prop changes
  useEffect(() => {
    setDisplayTags(professorData?.experienceTags || []);
  }, [professorData?.experienceTags]);

  const handleAddTag = async () => {
    const tagToAdd = newTag.trim();
    setError('');

    if (!tagToAdd) { setError('Tag cannot be empty.'); return; }
    if (displayTags.some(tag => tag.toLowerCase() === tagToAdd.toLowerCase())) { setError(`Tag "${tagToAdd}" already exists.`); setNewTag(''); return; }
    if (displayTags.length >= TAG_LIMIT) { setError(`Maximum limit of ${TAG_LIMIT} tags reached.`); setNewTag(''); return; }
    if (!auth.currentUser) { setError("Not authenticated."); return; }

    setIsProcessing(true);
    const userDocRef = doc(db, 'users', auth.currentUser.uid);

    try {
      await updateDoc(userDocRef, {
        experienceTags: arrayUnion(tagToAdd)
      });
      // No optimistic update needed if parent uses onSnapshot
      setNewTag('');
      console.log("Tag added request sent:", tagToAdd);
    } catch (err) {
      console.error("Error adding tag:", err);
      setError("Failed to add tag. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
     if (!auth.currentUser) { setError("Not authenticated."); return; }
     if (isProcessing) return;

    setIsProcessing(true);
    setError('');
    const userDocRef = doc(db, 'users', auth.currentUser.uid);

    try {
      await updateDoc(userDocRef, {
        experienceTags: arrayRemove(tagToRemove)
      });
      // No optimistic update needed if parent uses onSnapshot
      console.log("Tag removed request sent:", tagToRemove);
    } catch (err) {
      console.error("Error removing tag:", err);
      setError("Failed to remove tag. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const limitReached = displayTags.length >= TAG_LIMIT;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        My Experience & Research Keywords
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Add relevant keywords describing your expertise, research areas, technologies (e.g., &apos;Machine Learning&apos;, &apos;HCI&apos;, &apos;VLSI Design&apos;, &apos;NLP&apos;). Max {TAG_LIMIT}.
      </Typography>

      {/* Add Tag Form */}
      <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddTag(); }} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 3 }}>
        <TextField
          label={limitReached ? `Tag limit (${TAG_LIMIT}) reached` : "Add New Tag/Keyword"}
          variant="outlined"
          size="small"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          disabled={isProcessing || limitReached}
          sx={{ flexGrow: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutlineIcon />}
          disabled={isProcessing || !newTag.trim() || limitReached}
        >
          Add
        </Button>
      </Box>

      {/* Error Alert */}
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Display Tags */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
        Current Tags ({displayTags.length}/{TAG_LIMIT}):
      </Typography>
      {displayTags.length > 0 ? (
        <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
          {displayTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={isProcessing ? undefined : () => handleRemoveTag(tag)}
              deleteIcon={<CancelIcon />}
              disabled={isProcessing}
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
           You haven&apos;t added any experience or keyword tags yet.
        </Typography>
      )}
    </Box>
  );
};

export default ProfessorExperienceResearch;