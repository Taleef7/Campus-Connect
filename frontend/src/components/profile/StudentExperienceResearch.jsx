/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/profile/StudentExperienceResearch.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Chip, Stack, IconButton, CircularProgress, Alert } from '@mui/material';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../../firebase'; // Adjust path if needed
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';

// --- Define the tag limit ---
const TAG_LIMIT = 15;

const StudentExperienceResearch = ({ studentData }) => {
  // State for the input field
  const [newTag, setNewTag] = useState('');
  // State to hold the tags currently displayed (initialized from props)
  const [displayTags, setDisplayTags] = useState(studentData?.experienceTags || []);
  // State for loading/processing tag updates
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Update local state if the prop changes (e.g., parent re-fetches)
  useEffect(() => {
    setDisplayTags(studentData?.experienceTags || []);
  }, [studentData?.experienceTags]);

  const handleAddTag = async () => {
    const tagToAdd = newTag.trim();
    setError(''); // Clear previous error

    if (!tagToAdd) {
      setError('Tag cannot be empty.');
      return;
    }
    if (displayTags.some(tag => tag.toLowerCase() === tagToAdd.toLowerCase())) {
       setError(`Tag "${tagToAdd}" already exists.`);
       setNewTag('');
       return;
    }

    // +++ Check if the tag limit has been reached +++
    if (displayTags.length >= TAG_LIMIT) {
        setError(`You have reached the maximum limit of ${TAG_LIMIT} tags.`);
        setNewTag(''); // Clear input as they can't add more
        return; // Prevent adding the tag
    }
    // +++ End Limit Check +++

    if (!auth.currentUser) {
      setError("Not authenticated.");
      return;
    }

    setIsProcessing(true);
    setError('');
    const userDocRef = doc(db, 'users', auth.currentUser.uid);

    try {
      // Use arrayUnion to add the tag (it prevents duplicates on the Firestore side too)
      await updateDoc(userDocRef, {
        experienceTags: arrayUnion(tagToAdd)
      });
      setNewTag(''); // Clear input field
      console.log("Tag added request sent:", tagToAdd);
    } catch (err) {
      console.error("Error adding tag:", err);
      setError("Failed to add tag. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    if (!auth.currentUser) {
      setError("Not authenticated.");
      return;
    }
    // Prevent multiple removals at once
    if (isProcessing) return;

    setIsProcessing(true);
    setError('');
    const userDocRef = doc(db, 'users', auth.currentUser.uid);

    try {
      // Use arrayRemove to remove the tag
      await updateDoc(userDocRef, {
        experienceTags: arrayRemove(tagToRemove)
      });
      // Update local state
      console.log("Tag removed request sent:", tagToRemove);
      // UI will update automatically when the onSnapshot listener provides the new studentData prop
    } catch (err) {
      console.error("Error removing tag:", err);
      setError("Failed to remove tag. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate if the limit is reached to disable input/button
  const limitReached = displayTags.length >= TAG_LIMIT;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        My Experience & Research Interests
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Add relevant keywords, skills, or research (e.g., &apos;React&apos;, &apos;Machine Learning&apos;, &apos;Project Management&apos;). Max {TAG_LIMIT}.
      </Typography>

      {/* --- Add Tag Form --- */}
      <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddTag(); }} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 3 }}>
        <TextField
          label={limitReached ? `Tag limit (${TAG_LIMIT}) reached` : "Add New Tag"} // Update label when limit reached
          variant="outlined"
          size="small"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          // Disable input if processing or limit is reached
          disabled={isProcessing || limitReached}
          sx={{ flexGrow: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutlineIcon />}
          // Disable button if processing, input is empty, or limit is reached
          disabled={isProcessing || !newTag.trim() || limitReached}
        >
          Add
        </Button>
      </Box>

       {/* Display Error if any */}
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {/* --- Display Existing Tags --- */}
      {/* Show current count vs limit */}
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
              disabled={isProcessing} // Disable chip interactions while processing
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
           You haven&apos;t added any experience or interest tags yet.
        </Typography>
      )}
    </Box>
  );
};

export default StudentExperienceResearch;