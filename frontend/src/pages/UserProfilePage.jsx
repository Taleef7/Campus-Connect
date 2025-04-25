/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// frontend/src/pages/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Container, Paper, Box, Typography, CircularProgress, Button, Chip, Link as MuiLink, Tabs, Tab, Stack, Alert, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description'; // For resume link
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProfileHeader from '../components/profile/ProfileHeader';

// Helper function to display text or a fallback message
const displayText = (text, fallback = '(Not specified)') => {
  // Return fallback if text is null, undefined, or an empty string after trimming
  return text?.trim() ? text : fallback;
};


// --- Re-use Date Formatting Helper ---
const formatExperienceDate = (timestamp) => {
    // Make sure timestamp is valid and has toDate method (Firestore Timestamp)
    if (!timestamp || typeof timestamp.toDate !== 'function') return 'N/A';
    try {
        // Format as 'Mon YYYY' e.g., "Apr 2023"
        return timestamp.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
    } catch (e) {
        console.error("Error formatting date:", e, timestamp);
        return 'Invalid Date';
    }
};
// --- End Date Helper ---


// --- TabPanel Component (Needs to be defined here or imported) ---
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// --- a11yProps function (Needs to be defined here or imported) ---
function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}
// --- End Helper Components ---


const UserProfilePage = () => {
  const { userId } = useParams(); // Get the userId from the URL parameter
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // --- State for controlling the tabs on this page ---
  const [tabValue, setTabValue] = useState(0);

   // State for Professor Offered courses
   const [offeredCourses, setOfferedCourses] = useState([]);
   const [loadingOfferedCourses, setLoadingOfferedCourses] = useState(false);
   const [offeredCoursesError, setOfferedCoursesError] = useState(null);
   const [offeredCoursesFetched, setOfferedCoursesFetched] = useState(false);

   // +++ State for Student Enrolled courses +++
   const [enrolledCourses, setEnrolledCourses] = useState([]);
   const [loadingEnrolledCourses, setLoadingEnrolledCourses] = useState(false);
   const [enrolledCoursesError, setEnrolledCoursesError] = useState(null);
   const [enrolledCoursesFetched, setEnrolledCoursesFetched] = useState(false);

   // --- State for Detailed Experiences (NEW) ---
   const [detailedExperiences, setDetailedExperiences] = useState([]);
   const [loadingDetailedExperiences, setLoadingDetailedExperiences] = useState(false);
   const [detailedExperiencesError, setDetailedExperiencesError] = useState(null);
   const [detailedExperiencesFetched, setDetailedExperiencesFetched] = useState(false);


  // --- useEffect for fetching main profile data ---
  useEffect(() => {
    const fetchUserProfile = async () => {
        if (!userId) { setError("No user ID provided."); setLoading(false); return; }
        setLoading(true); setError(null); setProfileData(null);
        // Reset all fetched states on user change
        setOfferedCourses([]); setOfferedCoursesFetched(false); setOfferedCoursesError(null);
        setEnrolledCourses([]); setEnrolledCoursesFetched(false); setEnrolledCoursesError(null);
        setDetailedExperiences([]); setDetailedExperiencesFetched(false); setDetailedExperiencesError(null); // Reset detailed experiences
        setTabValue(0); // Reset to first tab

        try {
            const userDocRef = doc(db, 'users', userId);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                setProfileData({ id: docSnap.id, ...docSnap.data() });
            } else { setError("User profile not found."); setProfileData(null); }
        } catch (err) { console.error("Error fetching user profile:", err); setError("Failed to load profile."); }
        finally { setLoading(false); }
    };
    fetchUserProfile();
}, [userId]);


  // --- Combined useEffect for fetching tab-specific data ---
  useEffect(() => {
    if (!profileData) return; // Need profile data first

    const currentRole = profileData.role;
    const currentUserId = profileData.id;

    // Fetch Professor Offered Courses (Tab 2)
    if (tabValue === 2 && currentRole === 'professor' && !offeredCoursesFetched && !loadingOfferedCourses) {
        // ... (fetching logic for offered courses - keep as is) ...
         const fetchOfferedCourses = async () => {
            setLoadingOfferedCourses(true); setOfferedCoursesError(null);
            try {
                const coursesCollectionRef = collection(db, 'courses');
                const q = query(coursesCollectionRef, where('professorId', '==', currentUserId), orderBy('courseName', 'asc'));
                const querySnapshot = await getDocs(q);
                const fetchedCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOfferedCourses(fetchedCourses);
            } catch (err) { console.error("Error fetching offered courses:", err); setOfferedCoursesError("Failed to load courses."); }
            finally { setLoadingOfferedCourses(false); setOfferedCoursesFetched(true); }
        };
        fetchOfferedCourses();
    }
    // Fetch Student Enrolled Courses (Tab 2)
    else if (tabValue === 2 && currentRole === 'student' && !enrolledCoursesFetched && !loadingEnrolledCourses) {
        // ... (fetching logic for enrolled courses - keep as is) ...
        const fetchEnrolledCourses = async () => {
            setLoadingEnrolledCourses(true); setEnrolledCoursesError(null);
            try {
                const enrolledCoursesCollectionRef = collection(db, 'users', currentUserId, 'enrolledCourses');
                const q = query(enrolledCoursesCollectionRef, orderBy('semester', 'desc'));
                const querySnapshot = await getDocs(q);
                const fetchedCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setEnrolledCourses(fetchedCourses);
            } catch (err) { console.error("Error fetching enrolled courses:", err); setEnrolledCoursesError("Failed to load enrolled courses."); }
            finally { setLoadingEnrolledCourses(false); setEnrolledCoursesFetched(true); }
       };
       fetchEnrolledCourses();
    }
    // --- Fetch Detailed Experiences (Tab 1 - NEW LOGIC) ---
    else if (tabValue === 1 && !detailedExperiencesFetched && !loadingDetailedExperiences) {
        const fetchDetailedExperiences = async () => {
            setLoadingDetailedExperiences(true);
            setDetailedExperiencesError(null);
            console.log(`Workspaceing detailed experiences for user: ${currentUserId}`);
            try {
                const experiencesCollectionRef = collection(db, 'users', currentUserId, 'experiences');
                // Order by start date descending for consistency
                const q = query(experiencesCollectionRef, orderBy('startDate', 'desc'));
                const querySnapshot = await getDocs(q); // Use getDocs for public view
                const fetchedExperiences = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setDetailedExperiences(fetchedExperiences);
            } catch (err) {
                // Firestore permission errors might occur if rules aren't set correctly
                console.error("Error fetching detailed experiences:", err);
                if (err.code === 'permission-denied') {
                     setDetailedExperiencesError("Cannot load experiences due to permissions.");
                } else {
                    setDetailedExperiencesError("Failed to load detailed experiences.");
                }
            } finally {
                setLoadingDetailedExperiences(false);
                setDetailedExperiencesFetched(true); // Mark as fetched (even if error occurred)
            }
        };
        fetchDetailedExperiences();
    }
    // --- End Fetch Detailed Experiences ---

}, [tabValue, profileData, userId, offeredCoursesFetched, enrolledCoursesFetched, detailedExperiencesFetched, loadingOfferedCourses, loadingEnrolledCourses, loadingDetailedExperiences]); // Added detailed experience states


  // --- Tab Change Handler ---
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // --- Grouping Logic for Detailed Experiences (Helper) ---
  const groupExperiencesByType = (experiences) => {
    return experiences.reduce((acc, exp) => {
        const type = exp.type || 'other'; // Group undefined types as 'other'
        if (!acc[type]) { acc[type] = []; }
        acc[type].push(exp);
        return acc;
    }, {});
};
const groupedDetailedExperiences = groupExperiencesByType(detailedExperiences);
// --- End Grouping Logic ---


  // // Determine role-specific info for display
  // const roleInfo = profileData?.role === 'student'
  //   ? `${profileData?.major || 'Undecided Major'} - ${profileData?.year || 'Unknown Year'}`
  //   : `${profileData?.department || 'No Department'}`;


  return (
    // Using DashboardLayout, passing null to hide sign out for public view
    <DashboardLayout handleSignOut={null}>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            {/* Back Button */}
            <Button component={RouterLink} to="/directory" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Back to Directory
            </Button>

            {/* Loading State */}
            {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}> <CircularProgress /> </Box>
            )}

            {/* Error State */}
            {error && (
                  <Typography color="error" sx={{ textAlign: 'center', mt: 5 }}>{error}</Typography>
            )}

            {/* Profile Display */}
            {!loading && !error && profileData && (
                <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <ProfileHeader
                    coverLink={profileData.coverLink || null}
                    photoLink={profileData.photoLink || null}
                    professorName={profileData.name}
                    // Disable editing controls
                    onEditCover={() => {}} onViewCover={() => {}}
                    onEditPhoto={() => {}} onViewPhoto={() => {}}
                />
                  {/* --- Tabs for Profile Sections --- */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="User profile sections">
                    {/* Tab 0: Always Show */}
                    <Tab label="Profile" {...a11yProps(0)} />
                    {/* Tab 1: Always Show */}
                    <Tab label="Experience & Research" {...a11yProps(1)} />

                    {/* +++ CORRECTED: Conditionally Render Tab 2 based on ROLE +++ */}
                    {/* Show "Courses Offered" tab for professors */}
                    {profileData.role === 'professor' && (
                        <Tab label="Courses Offered" {...a11yProps(2)} />
                    )}
                     {/* Show "Courses Enrolled" tab for students */}
                    {profileData.role === 'student' && ( // This block renders the tab for students
                        <Tab label="Courses Enrolled" {...a11yProps(2)} />
                    )}
                     {/* +++ End Correction +++ */}

                </Tabs>
                </Box>

                  {/* --- Tab Panel 0: Main Profile Info --- */}
                  <TabPanel value={tabValue} index={0}>
                      {/* Moved existing profile display logic here */}
                      <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                          {displayText(profileData.name, 'Unnamed User')}
                      </Typography>
                      <Chip
                          label={profileData.role?.charAt(0).toUpperCase() + profileData.role?.slice(1) || 'User'}
                          size="small"
                          color={profileData.role === 'student' ? 'secondary' : 'primary'}
                          sx={{ mb: 2 }}
                      />

                        {/* === Conditional Rendering based on Role === */}

                        {/* --- Professor Specific Fields --- */}
                        {profileData.role === 'professor' && (
                            <>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 0.5 }}>
                                    {/* Display Headline */}
                                    {displayText(profileData.headline, '(No headline provided)')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    {/* Display Pronouns */}
                                    Pronouns: {displayText(profileData.pronouns)}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {/* Display Department */}
                                    Department: {displayText(profileData.department)}
                                </Typography>
                                {/* Display About Section */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>About</Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {displayText(profileData.about, '(No about section provided)')}
                                    </Typography>
                                </Box>
                            </>
                        )}

                        {/* --- Student Specific Fields --- */}
                        {profileData.role === 'student' && (
                            <>
                                <Typography variant="body1" sx={{ mb: 0.5 }}>
                                    {/* Display Major */}
                                    Major: {displayText(profileData.major)}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {/* Display Year */}
                                    Year: {displayText(profileData.year)}
                                </Typography>
                                {/* Display Description/Bio Section */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>Description / Bio</Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {displayText(profileData.description, '(No description provided)')}
                                    </Typography>
                                </Box>
                            </>
                        )}

                        {/* --- Common Fields (Resume) --- */}
                        {profileData.resumeLink && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>Resume/CV</Typography>
                                <Button
                                    variant="outlined" component="a" href={profileData.resumeLink}
                                    target="_blank" rel="noopener noreferrer"
                                    startIcon={<DescriptionIcon />}
                                    sx={{ textTransform: 'none' }} size="small"
                                >
                                    View Document
                                </Button>
                            </Box>
                        )}


                    </TabPanel>


                    {/* --- Panel 1: Experience & Research --- */}
                    <TabPanel value={tabValue} index={1}>
                        {/* --- Tags Display (Existing) --- */}
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
                            {profileData.role === 'professor' ? 'Experience & Research Keywords' : 'Experience & Interest Tags'}
                        </Typography>
                        {profileData.experienceTags && profileData.experienceTags.length > 0 ? (
                            <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mb: 4 }}> {/* Added margin bottom */}
                                {profileData.experienceTags.map((tag) => (
                                    <Chip key={tag} label={tag} size="small" />
                                ))}
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}> {/* Added margin bottom */}
                                No tags specified yet.
                            </Typography>
                        )}
                        {/* --- End Tags Display --- */}

                        <Divider sx={{ mb: 3 }} /> {/* Separator */}

                            {/* --- Detailed Experiences Display (NEW) --- */}
                        {loadingDetailedExperiences && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3}}><CircularProgress size={24} /></Box>}
                        {detailedExperiencesError && !loadingDetailedExperiences && <Alert severity="error">{detailedExperiencesError}</Alert>}
                        {!loadingDetailedExperiences && !detailedExperiencesError && detailedExperiences.length === 0 && detailedExperiencesFetched && (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                                No detailed experiences listed for this user.
                            </Typography>
                        )}

                        {/* Render Experience Groups */}
                        {!loadingDetailedExperiences && !detailedExperiencesError && detailedExperiences.length > 0 && (
                            <Stack spacing={4} sx={{ mt: 2 }}>
                            {Object.entries(groupedDetailedExperiences).map(([type, exps]) => (
                                <Box key={type}>
                                    {/* Display Type Title */}
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', textTransform: 'capitalize' }}>
                                        {type === 'work' ? 'Work Experience' :
                                        type === 'research' ? 'Research Experience' :
                                        type === 'project' ? 'Projects' :
                                        type === 'volunteer' ? 'Volunteer Experience' :
                                        'Other Experience' }
                                    </Typography>
                                    {/* List Experiences of this type */}
                                    <Stack spacing={2}>
                                    {exps.map(exp => (
                                        <Paper key={exp.id} variant="outlined" sx={{ p: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                {/* Main Info */}
                                                <Box>
                                                    <Typography sx={{ fontWeight: 'bold' }}>{exp.title || 'N/A'}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{exp.organization || 'N/A'}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatExperienceDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatExperienceDate(exp.endDate)}
                                                    </Typography>
                                                </Box>
                                                {/* No Edit/Delete Buttons here */}
                                            </Box>
                                            {/* Description */}
                                            {exp.description && <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{exp.description}</Typography>}
                                            {/* Link */}
                                            {exp.link && <MuiLink href={exp.link} target="_blank" rel="noopener noreferrer" variant="caption" sx={{ display: 'block', mt: 0.5 }}>Visit Link</MuiLink>}
                                        </Paper>
                                    ))}
                                    </Stack>
                                </Box>
                                ))}
                            </Stack>
                        )}
                            {/* --- End Detailed Experiences Display --- */}
                    </TabPanel>


                    {/* --- Panel 2: Courses Offered (Professor Only) --- */}
                    {(profileData.role === 'professor' || profileData.role === 'student') && (
                        <TabPanel value={tabValue} index={2}>
                        {/* --- Professor Courses --- */}
                        {profileData.role === 'professor' && (
                            <>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>Courses Offered</Typography>
                                {/* Loading State */}
                                {loadingOfferedCourses && <CircularProgress size={24} />}
                                {/* Error State */}
                                {offeredCoursesError && <Alert severity="error">{offeredCoursesError}</Alert>}
                                {/* Empty State */}
                                {!loadingOfferedCourses && !offeredCoursesError && offeredCourses.length === 0 && offeredCoursesFetched && (
                                    <Typography variant="body2" color="text.secondary">No courses listed yet.</Typography>
                                )}
                                {/* Course List Display */}
                                {!loadingOfferedCourses && !offeredCoursesError && offeredCourses.length > 0 && (
                                    // This Stack and map needs to be INSIDE the conditional rendering braces
                                    <Stack spacing={2}>
                                        {offeredCourses.map(course => (
                                            <Paper key={course.id} variant="outlined" sx={{ p: 1.5 }}>
                                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5}}>
                                                    <Typography variant="body1" sx={{fontWeight: 'medium'}}>{course.courseName}</Typography>
                                                    <Chip label={course.status || 'N/A'} size="small" color={course.status === 'Ongoing' ? 'info' : 'default'}/>
                                                </Box>
                                                {course.description &&
                                                    <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>{course.description}</Typography>
                                                }
                                                {course.link && (
                                                    <MuiLink href={course.link} target="_blank" rel="noopener noreferrer" variant="body2">Go to Course</MuiLink>
                                                )}
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </>
                        )}
                        {/* --- Student Courses --- */}
                        {profileData.role === 'student' && (
                            <>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>Courses Enrolled</Typography>
                                {/* Loading State */}
                                {loadingEnrolledCourses && <CircularProgress size={24} />}
                                {/* Error State */}
                                {enrolledCoursesError && <Alert severity="error">{enrolledCoursesError}</Alert>}
                                {/* Empty State */}
                                {!loadingEnrolledCourses && !enrolledCoursesError && enrolledCourses.length === 0 && enrolledCoursesFetched && (
                                    <Typography variant="body2" color="text.secondary">No enrolled courses listed yet.</Typography>
                                )}
                                {/* Course List Display */}
                                {!loadingEnrolledCourses && !enrolledCoursesError && enrolledCourses.length > 0 && (
                                    // This Stack and map needs to be INSIDE the conditional rendering braces
                                    <Stack spacing={2}>
                                        {enrolledCourses.map(course => (
                                            <Paper key={course.id} variant="outlined" sx={{ p: 1.5 }}>
                                                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5}}>
                                                    <Typography variant="body1" sx={{fontWeight: 'medium'}}>{course.courseCodeName}</Typography>
                                                    <Chip label={course.status} size="small" color={course.status === 'Ongoing' ? 'info' : 'default'}/>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">Semester: {course.semester || 'N/A'}</Typography>
                                                {course.instructorName && (
                                                    <Typography variant="body2" color="text.secondary">Instructor: {course.instructorName}</Typography>
                                                )}
                                                {course.grade && ( // Only display if grade exists and is not empty
                                                        <Typography variant="body2" color="text.secondary">Grade: {course.grade}</Typography>
                                                    )}
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </>
                        )}
                    </TabPanel>
                    )}
                          {/* You could add placeholders here later for Courses/Interests fetched separately */}
                </Paper>
            )}

            {/* Fallback if profileData is somehow null after loading without error */}
            {!loading && !error && !profileData && (
                  <Typography sx={{ textAlign: 'center', mt: 5 }}>Profile data could not be loaded.</Typography>
            )}
        </Container>
    </DashboardLayout>
  );
};

export default UserProfilePage;