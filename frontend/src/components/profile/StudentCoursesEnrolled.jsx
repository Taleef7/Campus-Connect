/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// src/components/profile/StudentCoursesEnrolled.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Chip, TextField,
  MenuItem, Select, InputLabel, FormControl, Dialog, DialogActions,
  DialogContent, DialogTitle, CircularProgress, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { auth, db } from '../../firebase';
import { collection, query, addDoc, deleteDoc, updateDoc, doc, onSnapshot, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const StudentCoursesEnrolled = ({ studentData }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseEntry, setCourseEntry] = useState({
    courseCodeName: '',
    semester: '',
    instructorName: '',
    status: 'Completed',
    grade: '',
  });
  const [user, setUser] = useState(null);
  const [isFormVisible, setFormVisible] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    if (user) {
      setLoading(true);
      const enrolledCoursesCollectionRef = collection(db, 'users', user.uid, 'enrolledCourses');
      const q = query(enrolledCoursesCollectionRef, orderBy('semester', 'desc'));
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedCourses = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEnrolledCourses(fetchedCourses);
        setLoading(false);
      }, (error) => {
        console.error('Error listening to enrolled courses:', error);
        setLoading(false);
      });
    } else {
      setEnrolledCourses([]);
      setLoading(false);
    }
    return () => unsubscribe();
  }, [user]);

  const handleRemoveCourse = async (courseDocId) => {
    if (!user) return;
    try {
      const courseDocRef = doc(db, 'users', user.uid, 'enrolledCourses', courseDocId);
      await deleteDoc(courseDocRef);
    } catch (err) {
      console.error('Error deleting enrolled course:', err);
      alert('Failed to delete course.');
    }
  };

  const handleEditCourse = (course) => {
    setCourseEntry({
      courseCodeName: course.courseCodeName || '',
      semester: course.semester || '',
      instructorName: course.instructorName || '',
      status: course.status || 'Completed',
      grade: course.grade || '',
    });
    setEditingCourseId(course.id);
    setFormVisible(true);
    setFormError('');
  };

  const handleSaveCourse = async () => {
    if (!courseEntry.courseCodeName || !courseEntry.semester) {
      setFormError('Course Code/Name and Semester are required.');
      return;
    }
    if (!user) {
      setFormError('Authentication error.');
      return;
    }
    setFormError('');

    const dataToSave = {
      courseCodeName: courseEntry.courseCodeName.trim(),
      semester: courseEntry.semester.trim(),
      instructorName: courseEntry.instructorName.trim(),
      status: courseEntry.status,
      grade: courseEntry.grade.trim(),
    };

    try {
      if (editingCourseId) {
        const courseDocRef = doc(db, 'users', user.uid, 'enrolledCourses', editingCourseId);
        await updateDoc(courseDocRef, dataToSave);
      } else {
        const enrolledCoursesCollectionRef = collection(db, 'users', user.uid, 'enrolledCourses');
        await addDoc(enrolledCoursesCollectionRef, dataToSave);
      }
      setCourseEntry({ courseCodeName: '', semester: '', instructorName: '', status: 'Completed', grade: '' });
      setEditingCourseId(null);
      setFormVisible(false);
    } catch (err) {
      console.error('Error saving enrolled course:', err);
      setFormError('Failed to save course. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseEntry((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* --- Updated Header and Add Course Button --- */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { xs: 'center', sm: 'space-between' },
          alignItems: 'center',
          textAlign: { xs: 'center', sm: 'left' },
          gap: { xs: 1.5, sm: 0 },
          mb: 5
        }}
      >
        <Typography variant="h5" gutterBottom component="div" sx={{ whiteSpace: 'nowrap' }}>
          My Courses
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setCourseEntry({ courseCodeName: '', semester: '', instructorName: '', status: 'Completed', grade: '' });
            setEditingCourseId(null);
            setFormVisible(true);
            setFormError('');
          }}
          startIcon={<AddIcon />}
          size="small"
          data-testid="add-course-page-button"
        >
          Add Course
        </Button>
      </Box>

      {/* --- Centered Courses List --- */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-start' },
          gap: 2,
        }}
      >
        {enrolledCourses.length === 0 && (
          <Typography sx={{ width: '100%', textAlign: 'center', color: 'text.secondary', mt: 2 }}>
            You haven't added any courses yet.
          </Typography>
        )}

        {enrolledCourses.map((course) => (
          <Card key={course.id} sx={{ width: '250px' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Chip
                  label={course.status || 'Completed'}
                  color={course.status === 'Ongoing' ? 'info' : 'default'}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                  {course.courseCodeName || 'No Name'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Semester: {course.semester || 'N/A'}
                </Typography>
                {course.instructorName && (
                  <Typography variant="body2" color="text.secondary">
                    Instructor: {course.instructorName}
                  </Typography>
                )}
                {course.grade && (
                  <Typography variant="body2" color="text.secondary">
                    Grade: {course.grade}
                  </Typography>
                )}
              </Box>
              <Box sx={{ mt: 1, pt: 1, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee' }}>
                <Button onClick={() => handleEditCourse(course)} color="primary" size="small" startIcon={<EditIcon />}>
                  Edit
                </Button>
                <Button onClick={() => handleRemoveCourse(course.id)} startIcon={<DeleteIcon />} color="error" size="small">
                  Delete
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>


      <Dialog open={isFormVisible} onClose={() => setFormVisible(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingCourseId ? 'Edit Enrolled Course' : 'Add Enrolled Course'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField
            label="Course Code / Name"
            fullWidth
            required
            margin="normal"
            name="courseCodeName"
            value={courseEntry.courseCodeName ?? ''}
            onChange={handleInputChange}
          />
          <TextField
            label="Semester Taken"
            fullWidth
            required
            margin="normal"
            name="semester"
            value={courseEntry.semester ?? ''}
            onChange={handleInputChange}
          />
          <TextField
            label="Instructor Name (Optional)"
            fullWidth
            margin="normal"
            name="instructorName"
            value={courseEntry.instructorName ?? ''}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              name="status"
              value={courseEntry.status ?? 'Completed'}
              onChange={handleInputChange}
            >
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Ongoing">Ongoing</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Grade Achieved (Optional)"
            fullWidth
            margin="normal"
            name="grade"

            value={courseEntry.grade ?? ''}
            onChange={handleInputChange}
            helperText="e.g., A, B+, 3.5"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setFormVisible(false); setFormError(''); }} color="secondary">
            Cancel
          </Button>

          <Button onClick={handleSaveCourse} color="primary" data-testid="submit-course-button">
            {editingCourseId ? 'Update Course' : 'Add Course'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


export default StudentCoursesEnrolled;

