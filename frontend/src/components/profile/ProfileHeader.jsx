/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Box, Avatar, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const ProfileHeader = ({
  coverLink,
  photoLink,
  professorName,
  onEditCover,
  onViewCover,
  onEditPhoto,
  onViewPhoto,
}) => {
  const [coverHover, setCoverHover] = useState(false);

  const getInitials = () => {
    if (!professorName) return '?';
    const parts = professorName.split(' ');
    return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '?';
  };

  const initials = getInitials();

  const handleCoverClick = () => {
    if (coverLink && onViewCover) {
      onViewCover();
    } else if (onEditCover) {
      onEditCover();
    }
  };

  const handlePhotoClick = (e) => {
    e.stopPropagation();
    if (photoLink && onViewPhoto) {
      onViewPhoto();
    } else if (onEditPhoto) {
      onEditPhoto();
    }
  };

  const handleCoverEditButtonClick = (e) => {
    e.stopPropagation();
    if (onEditCover) {
      onEditCover();
    }
  };

  const handlePhotoEditButtonClick = (e) => {
    e.stopPropagation();
    if (onEditPhoto) {
      onEditPhoto();
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 300, sm: 300 },
        mb: { xs: 8, sm: 10 },
        backgroundImage: coverLink ? `url('${coverLink}')` : 'none',
        bgcolor: coverLink ? 'transparent' : 'secondary.main',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 1,
        cursor: onEditCover || onViewCover ? 'pointer' : 'default',
        '&:hover .cover-hover-edit': { opacity: 1 },
      }}
      onClick={handleCoverClick}
      onMouseEnter={() => setCoverHover(true)}
      onMouseLeave={() => setCoverHover(false)}
    >
      {/* Edit Cover Button */}
      {onEditCover && (
        <IconButton
          className="cover-hover-edit"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            opacity: coverHover ? 1 : 0,
            transition: 'opacity 0.2s',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
          }}
          onClick={handleCoverEditButtonClick}
          aria-label="Edit cover photo"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      )}

      {/* Avatar with Edit Button */}
      <Box
        sx={{
          width: { xs: 100, sm: 120, md: 140 },
          height: { xs: 100, sm: 120, md: 140 },
          position: 'absolute',
          bottom: { xs: -50, sm: -60, md: -70 },
          left: { xs: '50%', sm: 24 },
          transform: { xs: 'translateX(-50%)', sm: 'none' },
          border: '4px solid',
          borderColor: 'background.paper',
          borderRadius: '50%',
          bgcolor: 'grey.300',
          overflow: 'visible',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onEditPhoto || onViewPhoto ? 'pointer' : 'default',
          boxShadow: 3,
        }}
        onClick={handlePhotoClick}
      >
        <Avatar
          src={photoLink || ''}
          alt={professorName || 'User'}
          sx={{
            width: '100%',
            height: '100%',
            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {!photoLink && initials}
        </Avatar>

        {/* Edit Icon on Avatar */}
        {onEditPhoto && (
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: 'white',
              color: 'text.secondary',
              border: '1px solid lightgrey',
              width: 32,
              height: 32,
              transition: 'background-color 0.2s, transform 0.2s',
              '&:hover': {
                backgroundColor: 'grey.200',
                transform: 'scale(1.15)',
              },
            }}
            onClick={handlePhotoEditButtonClick}
            aria-label="Edit profile photo"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default ProfileHeader;
