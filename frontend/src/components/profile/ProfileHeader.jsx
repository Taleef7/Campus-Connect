/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/components/profile/ProfileHeader.jsx
import React, { useState } from 'react';
import { Box, Avatar, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const ProfileHeader = ({
  coverLink,
  photoLink,
  professorName,
  onEditCover, // Prop to trigger opening the edit cover modal
  onViewCover, // Prop to trigger opening the view cover modal/action
  onEditPhoto, // Prop to trigger opening the edit photo modal
  onViewPhoto, // Prop to trigger opening the view photo modal/action
}) => {
  // State for hover effects is now local to this component
  const [coverHover, setCoverHover] = useState(false);
  const [photoHover, setPhotoHover] = useState(false);

  // Helper to get initials is now local
  const getInitials = () => {
    if (!professorName) return '?';
    const parts = professorName.split(' ');
    return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '?';
  };

  const initials = getInitials();

  // Handlers for local hover state
  const handleCoverMouseEnter = () => setCoverHover(true);
  const handleCoverMouseLeave = () => setCoverHover(false);
  const handlePhotoMouseEnter = () => setPhotoHover(true);
  const handlePhotoMouseLeave = () => setPhotoHover(false);

  // Click handlers now call the functions passed via props
  const handleCoverClick = () => {
    if (coverLink) {
      onViewCover(); // Call prop function
    } else {
      onEditCover(); // Open edit directly if no cover
    }
  };

  const handlePhotoClick = () => {
    if (photoLink) {
      onViewPhoto(); // Call prop function
    } else {
      onEditPhoto(); // Open edit directly if no photo
    }
  };

  const handleCoverEditButtonClick = (e) => {
      e.stopPropagation(); // Prevent triggering handleCoverClick
      onEditCover(); // Call prop function
  };

  const handlePhotoEditButtonClick = (e) => {
      e.stopPropagation(); // Prevent triggering handlePhotoClick
      onEditPhoto(); // Call prop function
  };


  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 150, sm: 200 },
        mb: 15, // Maintain margin for avatar overlap
        backgroundImage: coverLink
          ? `url('${coverLink}')`
          : "linear-gradient(to right, #64b5f6, #1976d2)", // Default gradient
        backgroundColor: '#e0e0e0',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 1,
        cursor: 'pointer',
        '&:hover .cover-hover-edit': { opacity: 1 }, // Show edit button on hover
      }}
      onClick={handleCoverClick} // Uses internal handler which calls prop
      onMouseEnter={handleCoverMouseEnter}
      onMouseLeave={handleCoverMouseLeave}
    >
      {/* Edit Cover Button */}
      <IconButton
        className="cover-hover-edit"
        size="small"
        sx={{
          position: 'absolute', top: 8, right: 8, color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          opacity: coverHover ? 1 : 0,
          transition: 'opacity 0.2s',
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        }}
        onClick={handleCoverEditButtonClick} // Uses internal handler which calls prop
        aria-label="Edit cover photo"
      >
        <EditIcon fontSize="small"/>
      </IconButton>

      {/* Avatar */}
      <Box
        sx={{
          width: { xs: 120, sm: 160 },
          height: { xs: 120, sm: 160 },
          position: 'absolute',
          bottom: -55,
          left: { xs: '50%', sm: 20 },
          transform: { xs: 'translateX(-50%)', sm: 'none' },
          border: '4px solid white',
          borderRadius: '50%',
          backgroundColor: 'grey.300',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 3,
          '&:hover .photo-hover-edit': { opacity: 1 }, // Show edit button on hover
        }}
        onClick={handlePhotoClick} // Uses internal handler which calls prop
        onMouseEnter={handlePhotoMouseEnter}
        onMouseLeave={handlePhotoMouseLeave}
      >
        <Avatar
          src={photoLink || ''}
          alt={professorName || 'Professor'}
          sx={{
            width: '100%', height: '100%',
            fontSize: { xs: '3rem', sm: '4rem' },
            backgroundColor: 'primary.main',
            color: 'primary.contrastText'
          }}
        >
          {!photoLink && initials}
        </Avatar>
        {/* Edit Photo Button */}
        <IconButton
          className="photo-hover-edit"
          size="small"
          sx={{
            position: 'absolute', bottom: 5, right: 5,
            color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.4)',
            opacity: photoHover ? 1 : 0,
            transition: 'opacity 0.2s',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
          }}
          onClick={handlePhotoEditButtonClick} // Uses internal handler which calls prop
          aria-label="Edit profile photo"
        >
          <EditIcon fontSize="small"/>
        </IconButton>
      </Box>
    </Box>
  );
};

export default ProfileHeader;