/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/components/common/FileUploadField.jsx
import React, { useState, useRef } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile'; // Optional: Icon for button

const FileUploadField = ({
  label,                // Title for the section (e.g., "Resume")
  fileLink,             // URL of the currently uploaded file (if any)
  accept,               // File type string for the input (e.g., "application/pdf")
  onSave,               // Async function to call when saving (receives file object)
  onDelete,             // Async function to call when deleting
  isSaving = false,     // Prop to disable buttons during save/delete
  viewButtonText = "View File",
  selectButtonText = "Select File",
  noFileText = "No file uploaded",
  containerSx = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null); // To potentially clear the input

  const handleEditClick = () => {
    setSelectedFile(null); // Clear previous selection when entering edit mode
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Attempt to clear the actual file input
    }
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setSelectedFile(null);
     if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSaveClick = async () => {
    if (!selectedFile) return;
    try {
      await onSave(selectedFile); // Pass the file object to the parent's save function
      setIsEditing(false); // Exit edit mode on success
      setSelectedFile(null); // Clear selection
       if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(`Error saving ${label}:`, error);
      // Error handling (e.g., alert) should ideally be in the parent's onSave
    }
  };

  const handleDeleteClick = async () => {
     if (!fileLink) return; // Should not happen if delete icon isn't shown, but good practice
     // Optional: Add confirmation dialog here
     if (window.confirm(`Are you sure you want to delete the ${label}?`)) {
        try {
             await onDelete(); // Call parent's delete function
             // State updates should happen in the parent via professorData change
         } catch (error) {
             console.error(`Error deleting ${label}:`, error);
              // Error handling should ideally be in the parent's onDelete
         }
     }
  };

  return (
    <Box sx={{ mt: 2, ...containerSx }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>{label}</Typography>
      {!isEditing ? (
        // Display Mode
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {fileLink ? (
            <Button
              variant="outlined" component="a" href={fileLink}
              target="_blank" rel="noopener noreferrer"
              sx={{ textTransform: 'none' }}
              size="small"
            >
              {viewButtonText}
            </Button>
          ) : (
            <Typography variant="body2" color="text.secondary">{noFileText}</Typography>
          )}
          <IconButton size="small" onClick={handleEditClick} aria-label={`Edit ${label}`} disabled={isSaving}>
            <EditIcon fontSize="small" />
          </IconButton>
          {fileLink && (
            <IconButton size="small" onClick={handleDeleteClick} color="error" aria-label={`Delete ${label}`} disabled={isSaving}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ) : (
        // Edit Mode
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, maxWidth: 300 }}>
          <Button
            variant="outlined" component="label" size="small"
            startIcon={<UploadFileIcon />}
            disabled={isSaving}
          >
            {selectedFile ? `Selected: ${selectedFile.name}` : selectButtonText}
            <input
              ref={fileInputRef}
              type="file" accept={accept} hidden
              onChange={handleFileChange}
              disabled={isSaving}
            />
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleSaveClick} color="success" size="small" variant="contained" disabled={!selectedFile || isSaving}>
              Save
            </Button>
            <Button onClick={handleCancelClick} color="inherit" size="small" variant="outlined" disabled={isSaving}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FileUploadField;