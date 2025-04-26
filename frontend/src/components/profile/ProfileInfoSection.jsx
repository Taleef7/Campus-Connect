/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/components/profile/ProfileInfoSection.jsx
import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import EditableField from './../common/EditableField'; // Adjust path if needed
import EditableTextArea from './../common/EditableTextArea'; // Adjust path if needed
import FileUploadField from './../common/FileUploadField'; // Adjust path if needed

const ProfileInfoSection = ({
  professorData,
  isSaving,
  handleNameSave,
  handleHeadlineSave,
  handlePronounsSave,
  handleAboutSave,
  handleResumeSave,
  handleResumeDelete,
  handleDepartmentSave, // <-- Destructure the new handler prop
}) => {

  const resumeLink = professorData?.resumeLink || ''; // Extract for clarity

  return (
    <Box sx={{ pt: 2, pl: { xs: 0, sm: 1 } }}>
      {/* --- Render EditableFields --- */}
      <Stack spacing={3}>
        <Box>
          <EditableField
            label="Full Name"
            value={professorData?.name}
            onSave={handleNameSave}
            typographyVariant="h5"
            placeholder="(No Name Set)"
            textFieldProps={{ size: 'small' }}
            containerSx={{ mb: 0.5, fontWeight: 'bold' }}
            isSaving={isSaving}
          />
          <EditableField
            label="Headline/Title"
            value={professorData?.headline}
            onSave={handleHeadlineSave}
            typographyVariant="subtitle1"
            placeholder="(No headline)"
            emptyText="(No headline)"
            textFieldProps={{ size: 'small' }}
            containerSx={{ mb: 0.5, '& .MuiTypography-root': { color: 'text.secondary' } }}
            isSaving={isSaving}
          />
          <EditableField
            label="Pronouns"
            value={professorData?.pronouns}
            onSave={handlePronounsSave}
            typographyVariant="body2"
            placeholder="(Not set)"
            emptyText={`Pronouns: ${professorData?.pronouns || '(Not set)'}`}
            textFieldProps={{ size: 'small' }}
            containerSx={{ mb: 2, '& .MuiTypography-root': { color: 'text.secondary' } }}
            isSaving={isSaving}
          />

          {/* +++ Add Department Field +++ */}
          <EditableField
            label="Department"
            value={professorData?.department} // Bind to department field
            onSave={handleDepartmentSave}    // Connect to the save handler
            typographyVariant="body1"        // Choose appropriate size
            placeholder="(e.g., Computer Science)"
            emptyText={`Department: ${professorData?.department || '(Not set)'}`}
            textFieldProps={{ size: 'small' }}
            containerSx={{ mb: 2 }}          // Add margin bottom
            isSaving={isSaving}
          />
          {/* +++ End Department Field +++ */}

          {/* --- Render EditableTextArea for About --- */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>About</Typography>
            <EditableTextArea
              label="About"
              value={professorData?.about}
              onSave={handleAboutSave}
              placeholder="(Provide a brief description about yourself)"
              emptyText="(No about section provided)"
              textFieldProps={{ rows: 4 }}
              isSaving={isSaving}
            />
          </Box>

          {/* --- Render FileUploadField for Resume --- */}
          <FileUploadField
            label="Resume"
            fileLink={resumeLink}
            accept="application/pdf"
            onSave={handleResumeSave}
            onDelete={handleResumeDelete}
            isSaving={isSaving}
            viewButtonText="View PDF"
            selectButtonText="Select PDF File"
            noFileText="No resume uploaded"
            containerSx={{ mt: 2 }}
          />
    </Box>
    </Stack>
    </Box>
  );
};

export default ProfileInfoSection;