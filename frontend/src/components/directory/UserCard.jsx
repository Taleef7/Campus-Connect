/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/components/directory/UserCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Avatar, Box, Chip, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // Use alias to avoid conflict with MUI Link
import SchoolIcon from '@mui/icons-material/School'; // Example icon for student
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'; // Example icon for professor

// Helper function to get initials (can be moved to a utils file later)
const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '?';
};

const UserCard = ({ user }) => {
  // Added experienceTags
  const { name, photoLink, role, major, year, department, interests, experienceTags, id } = user;

  // Determine role-specific info
  const roleInfo = user.role === 'student'
    ? `${user.major || 'Undecided Major'} - ${user.year || 'Unknown Year'}`
    : `${user.department || 'No Department'}`;

  const profileLink = `/profile/${user.id}`; // Basic profile link structure (page needs creation later)

  return (
    // Ensure Card takes full height if used within a Grid structure for alignment
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid', borderColor: 'divider', justifyContent: 'space-between', borderRadius: 3, padding: 0.5, boxShadow: 3 }}>
      <CardContent sx={{ flexGrow: 1}}> {/* Let content grow */}
        {/* Avatar, Name, Role Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar
            src={photoLink || ''}
            alt={name}
            sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}
          >
            {!photoLink && getInitials(name)}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}> {/* Prevent text overflow */}
            <Typography variant="h6" component="div" noWrap>
              {name || 'Unnamed User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {roleInfo}
            </Typography>
          </Box>
        </Box>

        {/* Role Chip */}
        {role && (
            <Chip
                icon={role === 'student' ? <SchoolIcon fontSize="small"/> : <BusinessCenterIcon fontSize="small"/>}
                label={role.charAt(0).toUpperCase() + role.slice(1)} // Capitalize role
                size="small"
                color={role === 'student' ? 'secondary' : 'primary'}
                sx={{ mb: 1.5 }} // Add some margin below
            />
        )}

        {/* --- Display Experience Tags (NEW SECTION) --- */}
        {experienceTags && experienceTags.length > 0 && (
            <Box sx={{ mt: 1, mb: 1.5 }}> {/* Add margin */}
                 {/* Optional Title */}
                 {/* <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>Skills/Keywords:</Typography> */}
                 <Stack
                    direction="row"
                    flexWrap="wrap"
                    spacing={0.5} // Spacing between chips
                    useFlexGap // Handles spacing better with wrapping
                    sx={{ maxHeight: '52px', overflow: 'hidden' }} // Limit height to roughly 2 lines of small chips
                 >
                    {/* Limit number of tags shown */}
                    {experienceTags.slice(0, 6).map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                    {experienceTags.length > 6 && (
                        <Chip label="..." size="small" variant="outlined"/> // Indicator for more tags
                    )}
                 </Stack>
            </Box>
        )}
        {/* --- End Display Experience Tags --- */}


        {/* Displaying interests (Keep your existing logic if 'interests' is a different field) */}
        {interests && (
            <Box sx={{ mt: 1 }}>
                 <Typography variant="caption" color="text.secondary">Interests:</Typography>
                 <Typography variant="body2" sx={{ maxHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                     {/* Display interests (truncated) */}
                     {Array.isArray(interests) ? interests.slice(0, 3).join(', ') : String(interests)}
                     {Array.isArray(interests) && interests.length > 3 ? '...' : ''}
                 </Typography>
            </Box>
        )}

      </CardContent>

      {/* View Profile Button - Pushed to bottom */}
      <Box sx={{ p: 1, pt: 0, display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}> {/* mt: 'auto' pushes to bottom */}
        <Button
            component={RouterLink}
            to={profileLink}
            size="small"
            variant="outlined"
        >
            View Profile
        </Button>
      </Box>
    </Card>
  );
};

export default UserCard;