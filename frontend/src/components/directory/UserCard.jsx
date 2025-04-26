/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import { Card, CardContent, Typography, Avatar, Box, Chip, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '?';
};

const UserCard = ({ user }) => {
  const { name, photoLink, role, major, year, department, interests, experienceTags, id } = user;

  const roleInfo = role === 'student'
    ? `${major || 'Undecided Major'} - ${year || 'Unknown Year'}`
    : `${department || 'No Department'}`;

  const profileLink = `/profile/${id}`;

  return (
    <Card
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid #dce3ec',
        borderRadius: 3,
        padding: 1,
        backgroundColor: '#ffffff',
        transition: '0.3s',
        boxShadow: '0 2px 8px rgba(17, 45, 78, 0.08)',
        '&:hover': {
          boxShadow: '0px 8px 20px rgba(17, 45, 78, 0.15)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={photoLink || undefined}
            alt={name}
            sx={{
              width: 56,
              height: 56,
              mr: 2,
              bgcolor: role === 'student' ? '#3f72af' : '#f4a261',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              transition: '0.3s ease',
              '&:hover': {
                boxShadow: '0 0 12px 4px rgba(63, 114, 175, 0.5)',
                transform: 'scale(1.05)',
              },
            }}
          >
            {!photoLink && getInitials(name)}
          </Avatar>

          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', color: '#112d4e' }}>
              {name || 'Unnamed User'}
            </Typography>
            <Typography variant="body2" noWrap sx={{ color: '#6c757d' }}>
              {roleInfo}
            </Typography>
          </Box>
        </Box>

        {role && (
          <Chip
            icon={role === 'student' ? <SchoolIcon fontSize="small" /> : <BusinessCenterIcon fontSize="small" />}
            label={role.charAt(0).toUpperCase() + role.slice(1)}
            size="small"
            color={role === 'student' ? 'secondary' : 'primary'}
            sx={{ mb: 1.5 }}
          />
        )}

        {experienceTags && experienceTags.length > 0 && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Stack
              direction="row"
              flexWrap="wrap"
              spacing={0.5}
              useFlexGap
              sx={{ maxHeight: '52px', overflow: 'hidden' }}
            >
              {experienceTags.slice(0, 6).map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
              {experienceTags.length > 6 && (
                <Chip label="..." size="small" variant="outlined" />
              )}
            </Stack>
          </Box>
        )}

        {interests && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Interests:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                maxHeight: 40,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                color: '#6c757d',
              }}
            >
              {Array.isArray(interests) ? interests.slice(0, 3).join(', ') : String(interests)}
              {Array.isArray(interests) && interests.length > 3 ? '...' : ''}
            </Typography>
          </Box>
        )}
      </CardContent>

      <Box sx={{ p: 1, pt: 0, display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
        <Button
          component={RouterLink}
          to={profileLink}
          size="small"
          variant="outlined"
          sx={{
            borderColor: '#3f72af',
            color: '#3f72af',
            fontWeight: 'bold',
            '&:hover': {
              borderColor: '#112d4e',
              backgroundColor: '#f0f4f8',
              color: '#112d4e',
            },
          }}
        >
          View Profile
        </Button>
      </Box>
    </Card>
  );
};

export default UserCard;
