/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/components/directory/UserCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Avatar, Box, Chip, Button } from '@mui/material';
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
  // Determine role-specific info
  const roleInfo = user.role === 'student'
    ? `${user.major || 'Undecided Major'} - ${user.year || 'Unknown Year'}`
    : `${user.department || 'No Department'}`;

  const profileLink = `/profile/${user.id}`; // Basic profile link structure (page needs creation later)

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={user.photoLink || ''}
            alt={user.name}
            sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}
          >
            {!user.photoLink && getInitials(user.name)}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div" noWrap>
              {user.name || 'Unnamed User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {roleInfo}
            </Typography>
          </Box>
        </Box>

        {user.role && (
            <Chip
                icon={user.role === 'student' ? <SchoolIcon /> : <BusinessCenterIcon />}
                label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} // Capitalize role
                size="small"
                color={user.role === 'student' ? 'secondary' : 'primary'}
                sx={{ mb: 1 }}
            />
        )}

        {/* Displaying interests (example, adjust based on your data structure) */}
        {/* Assuming interests might be an array or comma-separated string */}
        {user.interests && (
            <Box sx={{ mt: 1 }}>
                 <Typography variant="caption" color="text.secondary">Interests:</Typography>
                 <Typography variant="body2" sx={{ maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                     {Array.isArray(user.interests) ? user.interests.slice(0, 3).join(', ') : String(user.interests).substring(0, 100)}
                     {Array.isArray(user.interests) && user.interests.length > 3 ? '...' : ''}
                     {typeof user.interests === 'string' && user.interests.length > 100 ? '...' : ''}
                 </Typography>
            </Box>
        )}

      </CardContent>
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
         {/* Link to a future profile page */}
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