/* eslint-disable react/prop-types */
// frontend/src/components/opportunities/InterestedStudentsDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, Typography, CircularProgress, Box, Link as MuiLink, Divider, IconButton
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // For linking to profiles
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path if needed
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description'; // Icon for resume
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Icon for profile link

// Helper function to get initials (can be moved to utils)
const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '?';
};

const InterestedStudentsDialog = ({ open, onClose, opportunityId, opportunityTitle, professorId }) => {
  const [interestedStudents, setInterestedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data only when the dialog is open and an opportunityId is provided
    if (open && opportunityId && professorId) {
      const fetchInterestedStudents = async () => {
        setLoading(true);
        setError(null);
        setInterestedStudents([]); // Clear previous results
        console.log(`Workspaceing interested students for opportunity: ${opportunityId} by professor: ${professorId}`);

        try {
          const interestsCollectionRef = collection(db, 'interests');
          // --- MODIFIED QUERY ---
          const q = query(
                interestsCollectionRef,
                where('professorId', '==', professorId), // <-- ADDED filter by professorId
                where('opportunityId', '==', opportunityId),
                orderBy('timestamp', 'desc')
            );
            // --- END MODIFIED QUERY ---

          const querySnapshot = await getDocs(q);
          const studentsList = querySnapshot.docs.map(doc => ({
            id: doc.id, // The ID of the interest document itself
            ...doc.data() // Includes studentId, studentName, studentEmail, studentResumeLink, timestamp
          }));

          console.log("Fetched interested students:", studentsList);
          setInterestedStudents(studentsList);

        } catch (err) {
            console.error("Error fetching interested students:", err);
            // Check if the error is permissions or maybe missing index now
            if (err.code === 'permission-denied') {
                setError("You don't have permission to view this data.");
            } else if (err.code === 'failed-precondition') {
                 setError("Query requires a Firestore index. Check console for link.");
                 console.error("INDEX REQUIRED: Check the Firebase console error link for this query:", err);
            } else {
                setError("Failed to load interested students.");
            }
        } finally {
          setLoading(false);
        }
      };

      fetchInterestedStudents();
    }
  }, [open, opportunityId, professorId]); // Re-fetch if dialog opens or opportunityId changes

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Interested Students for: {opportunityTitle || 'Opportunity'}
           <IconButton aria-label="close" onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
                <CloseIcon />
            </IconButton>
      </DialogTitle>
      <DialogContent dividers={true}> {/* Add dividers */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
        ) : error ? (
          <Typography color="error" sx={{ p: 2 }}>{error}</Typography>
        ) : interestedStudents.length > 0 ? (
          <List disablePadding>
            {interestedStudents.map((interest, index) => (
              <React.Fragment key={interest.id}>
                <ListItem alignItems="flex-start" sx={{ py: 1.5 }}> {/* Added padding */}
                  <ListItemAvatar>
                    {/* --- Use studentPhotoLink for Avatar source --- */}
                    <Avatar
                       src={interest.studentPhotoLink || undefined} // Use photo link if available
                       alt={interest.studentName}
                    >
                       {/* Fallback to initials if no photo link */}
                       {!interest.studentPhotoLink && getInitials(interest.studentName)}
                    </Avatar>
                    {/* --- End Avatar Update --- */}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                         <Typography variant="body1" component="span" sx={{ fontWeight: 'medium' }}>
                             {interest.studentName || 'Unknown Student'}
                         </Typography>
                    }
                    secondary={
                      <>
                        {/* Email */}
                        <Typography component="div" variant="body2" color="text.primary" sx={{ mb: 0.5 }}> {/* Use div for block */}
                            {interest.studentEmail || 'No Email'}
                        </Typography>

                        {/* Links Box */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
                            {/* Resume Link */}
                            {interest.studentResumeLink ? (
                            <MuiLink
                                href={interest.studentResumeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="body2"
                                sx={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                                <DescriptionIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Resume/CV
                            </MuiLink>
                            ) : (
                                <Typography component="span" variant="caption" color="text.secondary"> (No Resume) </Typography>
                            )}

                            {/* Profile Link Button */}
                            <Button
                                component={RouterLink} // Use React Router Link
                                to={`/profile/${interest.studentId}`} // Dynamic link to student's profile
                                size="small"
                                variant="text" // Use text variant for less emphasis
                                startIcon={<AccountCircleIcon />}
                                sx={{ p: '2px 4px', textTransform: 'none' }} // Adjust padding
                            >
                                View Profile
                            </Button>
                        </Box>

                        {/* Timestamp */}
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Interested On: {interest.timestamp?.toDate().toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < interestedStudents.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography sx={{ p: 3, textAlign: 'center' }} color="text.secondary">
              No students have expressed interest in this opportunity yet.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InterestedStudentsDialog;