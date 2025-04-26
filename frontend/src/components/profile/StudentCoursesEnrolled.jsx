/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// src/components/profile/StudentCoursesEnrolled.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Chip, TextField,
  MenuItem, Select, InputLabel, FormControl, Dialog, DialogActions,
  DialogContent, DialogTitle, CircularProgress, Alert // Added CircularProgress, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { auth, db } from '../../firebase'; // Adjust path if needed
import {
  collection, query, addDoc, deleteDoc, updateDoc, doc, onSnapshot, orderBy // Added orderBy
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Component Renamed
const StudentCoursesEnrolled = ({ studentData }) => { // Accept studentData if needed, but we mainly use auth.currentUser
  // Renamed state for clarity
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  // Updated state for the form fields
  const [courseEntry, setCourseEntry] = useState({
    courseCodeName: '', // e.g., "CS 101" or "Intro to Programming"
    semester: '',       // e.g., "Fall 2023"
    instructorName: '', // Optional instructor
    status: 'Completed',  // Default to Completed? Or Ongoing? Let's use Completed
    grade: '', // Add grade field
    // Removed description, link, courseId
    // Optional: grade: '',
  });
  const [user, setUser] = useState(null); // Still useful to trigger useEffect
  const [isFormVisible, setFormVisible] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null); // Firestore doc ID of the course being edited
  const [formError, setFormError] = useState(''); // Error state for the form

  // Auth listener (needed to get user ID for queries)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- UPDATED useEffect to use onSnapshot for Enrolled Courses Subcollection ---
  useEffect(() => {
    let unsubscribe = () => {};

    if (user) {
      setLoading(true);
      // --- UPDATED PATH: Point to the subcollection ---
      const enrolledCoursesCollectionRef = collection(db, 'users', user.uid, 'enrolledCourses');
      // Optional: Order by semester or course code
      const q = query(enrolledCoursesCollectionRef, orderBy('semester', 'desc')); // Example order

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedCourses = querySnapshot.docs.map((doc) => ({
          id: doc.id, // This is the unique ID of the document within the subcollection
          ...doc.data(),
        }));
        setEnrolledCourses(fetchedCourses);
        setLoading(false);
      }, (error) => {
        console.error('Error listening to enrolled courses:', error);
        setLoading(false);
        // Optionally set an error state
      });

    } else {
      // No user, clear courses
      setEnrolledCourses([]);
      setLoading(false);
    }

    // Cleanup listener
    return () => unsubscribe();
  }, [user]); // Re-run if user changes


  const handleRemoveCourse = async (courseDocId) => {
    if (!user) return;
    try {
      // --- UPDATED PATH ---
      const courseDocRef = doc(db, 'users', user.uid, 'enrolledCourses', courseDocId);
      await deleteDoc(courseDocRef);
      // No need to filter state - onSnapshot handles update
    } catch (err) {
      console.error('Error deleting enrolled course:', err);
       alert('Failed to delete course.'); // Provide feedback
    }
  };


  const handleEditCourse = (course) => {
    // Populate form with existing course data
    setCourseEntry({
      courseCodeName: course.courseCodeName || '',
      semester: course.semester || '',
      instructorName: course.instructorName || '',
      status: course.status || 'Completed',
      grade: course.grade || '', // <-- Populate grade field
      // grade: course.grade || '', // If grade field is added
    });
    setEditingCourseId(course.id); // Store the Firestore document ID
    setFormVisible(true);
    setFormError(''); // Clear previous form errors
  };


  const handleSaveCourse = async () => {
    // Validation for required fields
    if (!courseEntry.courseCodeName || !courseEntry.semester) {
      setFormError('Course Code/Name and Semester are required.');
      return;
    }
     if (!user) {
       setFormError('Authentication error.');
       return;
    }

    setFormError(''); // Clear error

    // Prepare data to save (excluding fields not needed or empty)
    const dataToSave = {
        courseCodeName: courseEntry.courseCodeName.trim(),
        semester: courseEntry.semester.trim(),
        instructorName: courseEntry.instructorName.trim(), // Save even if empty
        status: courseEntry.status,
        grade: courseEntry.grade.trim(),
        // grade: courseEntry.grade // If grade field is added
    };

    try {
      if (editingCourseId) {
        // --- UPDATED PATH for Update ---
        const courseDocRef = doc(db, 'users', user.uid, 'enrolledCourses', editingCourseId);
        await updateDoc(courseDocRef, dataToSave);
      } else {
        // --- UPDATED PATH for Add ---
         const enrolledCoursesCollectionRef = collection(db, 'users', user.uid, 'enrolledCourses');
        await addDoc(enrolledCoursesCollectionRef, dataToSave);
      }

      // Reset form state and close dialog
      setCourseEntry({ courseCodeName: '', semester: '', instructorName: '', status: 'Completed', grade: '' });
      setEditingCourseId(null);
      setFormVisible(false);
      // No need to refetch - onSnapshot handles update

    } catch (err) {
      console.error('Error saving enrolled course:', err);
       setFormError('Failed to save course. Please try again.'); // Show error in form
    }
  };

  // Handle input changes for the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseEntry((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // Render Loading state
  if (loading) {
     return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {/* Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom component="div"> {/* Changed variant */}
            My Courses Enrolled
          </Typography>
          {/* Add Course Button */}
          <Button
            variant="contained"
            onClick={() => {
              // Reset form for adding new
              setCourseEntry({ courseCodeName: '', semester: '', instructorName: '', status: 'Completed' });
              setEditingCourseId(null);
              setFormVisible(true);
              setFormError('');
            }}
            startIcon={<AddIcon />}
            size="small" // Make button smaller
          >
            Add Course
          </Button>
      </Box>

      {/* Course Cards Container */}
      <Box display="flex" flexWrap="wrap" gap={2}>
        {/* No courses message */}
        {enrolledCourses.length === 0 && (
          <Typography sx={{width: '100%', textAlign: 'center', color: 'text.secondary', mt: 2}}>
              You haven&apos;t added any courses yet.
          </Typography>
        )}

        {/* Mapping through enrolled courses */}
        {enrolledCourses.map((course) => (
          <Card key={course.id} sx={{ width: '250px' }}> {/* Unique key is Firestore doc ID */}
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}> {/* Flex column */}
              <Box sx={{ flexGrow: 1 }}> {/* Content takes available space */}
                <Chip
                  label={course.status || 'Completed'} // Default if missing
                  color={course.status === 'Ongoing' ? 'info' : 'default'} // Use info for ongoing
                  size="small"
                  sx={{mb: 1}}
                />
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}> {/* Smaller H6 */}
                    {course.courseCodeName || 'No Name'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Semester: {course.semester || 'N/A'}
                </Typography>
                {course.instructorName && ( // Only display if instructor exists
                   <Typography variant="body2" color="text.secondary">
                     Instructor: {course.instructorName}
                   </Typography>
                )}
                {/* +++ Display Grade if available +++ */}
                {course.grade && (
                    <Typography variant="body2" color="text.secondary">
                    Grade: {course.grade}
                    </Typography>
                )}
                {/* +++ End Grade Display +++ */}
              </Box>
              {/* Action Buttons pushed to bottom */}
              <Box sx={{mt: 1, pt: 1, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee'}}>
                <Button onClick={() => handleEditCourse(course)} color="primary" size="small" startIcon={<EditIcon/>}> Edit </Button>
                <Button onClick={() => handleRemoveCourse(course.id)} startIcon={<DeleteIcon />} color="error" size="small"> Delete </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Add/Edit Course Dialog */}
      <Dialog open={isFormVisible} onClose={() => setFormVisible(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingCourseId ? 'Edit Enrolled Course' : 'Add Enrolled Course'}</DialogTitle>
        <DialogContent>
           {/* Display form error if any */}
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

          <TextField
            label="Course Code / Name" // Combined field
            fullWidth
            required
            margin="normal"
            name="courseCodeName"
            value={courseEntry.courseCodeName}
            onChange={handleInputChange}
          />
          <TextField
            label="Semester Taken" // e.g., Fall 2024
            fullWidth
            required
            margin="normal"
            name="semester"
            value={courseEntry.semester}
            onChange={handleInputChange}
          />
           <TextField
            label="Instructor Name (Optional)"
            fullWidth
            margin="normal"
            name="instructorName"
            value={courseEntry.instructorName}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              name="status"
              value={courseEntry.status}
              onChange={handleInputChange}
            >
              {/* Changed order, maybe 'Completed' is more common */}
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Ongoing">Ongoing</MenuItem>
            </Select>
          </FormControl>
           {/* +++ Add Grade TextField +++ */}
          <TextField
            label="Grade Achieved (Optional)"
            fullWidth
            margin="normal"
            name="grade" // Matches state key
            value={courseEntry.grade}
            onChange={handleInputChange}
            helperText="e.g., A, B+, 3.5"
          />
          {/* +++ End Grade TextField +++ */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setFormVisible(false); setFormError(''); }} color="secondary">
            Cancel
          </Button>
          {/* Call handleSaveCourse */}
          <Button onClick={handleSaveCourse} color="primary">
            {editingCourseId ? 'Update Course' : 'Add Course'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentCoursesEnrolled; // Renamed export