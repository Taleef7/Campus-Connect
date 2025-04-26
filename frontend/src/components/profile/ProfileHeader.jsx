/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/components/profile/ProfileHeader.jsx
import React, { useState } from 'react';
import { Box, Avatar, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const ProfileHeader = ({
  coverLink,
  photoLink,
  professorName, // Assuming name is passed for initials fallback
  onEditCover,
  onViewCover,
  onEditPhoto,
  onViewPhoto,
}) => {
  const [coverHover, setCoverHover] = useState(false);
  const [photoHover, setPhotoHover] = useState(false);

  const getInitials = () => {
    if (!professorName) return '?';
    const parts = professorName.split(' ');
    return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '?';
  };

  const initials = getInitials();

  const handleCoverMouseEnter = () => setCoverHover(true);
  const handleCoverMouseLeave = () => setCoverHover(false);
  const handlePhotoMouseEnter = () => setPhotoHover(true);
  const handlePhotoMouseLeave = () => setPhotoHover(false);

  const handleCoverClick = () => {
    if (coverLink) { onViewCover(); }
    else { onEditCover(); }
  };

  // --- Modify handlePhotoClick ---
  const handlePhotoClick = (e) => { // Accept event 'e'
    e.stopPropagation(); // <<< ADD THIS LINE to stop bubbling
    if (photoLink) {
      onViewPhoto();
    } else {
      onEditPhoto();
    }
  };
  // --- End modification ---

  const handleCoverEditButtonClick = (e) => { e.stopPropagation(); onEditCover(); };
  const handlePhotoEditButtonClick = (e) => { e.stopPropagation(); onEditPhoto(); };

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 300, sm: 300 },
        mb: { xs: 8, sm: 10 }, // Adjusted margin based on avatar size
        // --- THEME BACKGROUND ---
        // Use coverLink if available, otherwise use theme secondary color
        backgroundImage: coverLink ? `url('${coverLink}')` : 'none', // Remove gradient
        // Use theme's secondary color (Steel Gray) as default background
        bgcolor: coverLink ? 'transparent' : 'secondary.main',
        // --- END THEME BACKGROUND ---
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 1, // Use theme's border radius? theme.shape.borderRadius
        cursor: 'pointer',
        '&:hover .cover-hover-edit': { opacity: 1 },
      }}
      onClick={handleCoverClick}
      onMouseEnter={handleCoverMouseEnter}
      onMouseLeave={handleCoverMouseLeave}
    >
      {/* Edit Cover Button (style should still work on dark bg) */}
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
        onClick={handleCoverEditButtonClick}
        aria-label="Edit cover photo"
      >
        <EditIcon fontSize="small"/>
      </IconButton>

      {/* Avatar */}
      <Box
        sx={{
          width: { xs: 100, sm: 120, md: 140 }, // Slightly adjusted sizes
          height: { xs: 100, sm: 120, md: 140 },
          position: 'absolute',
          bottom: { xs: -50, sm: -60, md: -70 }, // Adjust overlap based on size
          left: { xs: '50%', sm: 24 }, // Indent more on larger screens
          transform: { xs: 'translateX(-50%)', sm: 'none' },
          border: '4px solid', // Use theme paper color for border
          borderColor: 'background.paper', // Ensure good contrast
          borderRadius: '50%',
          bgcolor: 'grey.300', // Fallback bg for avatar itself
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 3,
          '&:hover .photo-hover-edit': { opacity: 1 },
        }}
        onClick={handlePhotoClick}
        onMouseEnter={handlePhotoMouseEnter}
        onMouseLeave={handlePhotoMouseLeave}
      >
        <Avatar
          src={photoLink || ''}
          alt={professorName || 'User'} // Generic alt
          sx={{
            width: '100%', height: '100%',
            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }, // Adjust font size
            // Use theme primary colors for Avatar fallback
            bgcolor: 'primary.main',
            color: 'primary.contrastText'
          }}
        >
          {!photoLink && initials}
        </Avatar>
        {/* Edit Photo Button (style should still work) */}
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
          onClick={handlePhotoEditButtonClick}
          aria-label="Edit profile photo"
        >
          <EditIcon fontSize="small"/>
        </IconButton>
      </Box>
    </Box>
  );
};

export default ProfileHeader;