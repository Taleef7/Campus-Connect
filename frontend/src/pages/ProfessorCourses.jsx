/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Chip, TextField,
  MenuItem, Select, InputLabel, FormControl, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
  collection, addDoc, deleteDoc, updateDoc, query, where, doc, onSnapshot
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ProfessorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    description: '',
    status: 'Ongoing',
    link: '',
  });
  const [user, setUser] = useState(null);
  const [isFormVisible, setFormVisible] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    if (user) {
      setLoading(true);
      const q = query(collection(db, 'courses'), where('professorId', '==', user.uid));

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedCourses = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(fetchedCourses);
        setLoading(false);
      }, (error) => {
        console.error('Error listening to courses:', error);
        setLoading(false);
      });
    } else {
      setCourses([]);
      setLoading(false);
    }
    return () => unsubscribe();
  }, [user]);

  const handleRemoveCourse = async (id) => {
    try {
      await deleteDoc(doc(db, 'courses', id));
      setCourses(courses.filter((course) => course.id !== id));
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  const handleEditCourse = (course) => {
    setNewCourse({
      courseName: course.courseName,
      description: course.description,
      status: course.status,
      link: course.link,
    });
    setEditingCourseId(course.id);
    setFormVisible(true);
  };

  const handleAddCourse = async () => {
    if (!newCourse.courseName || !newCourse.description || !newCourse.link) {
      alert('Please fill in all fields correctly.');
      return;
    }
    try {
      if (editingCourseId) {
        await updateDoc(doc(db, 'courses', editingCourseId), {
          ...newCourse,
          professorId: user.uid,
        });
      } else {
        const courseId = generateCourseId(newCourse.courseName);
        await addDoc(collection(db, 'courses'), {
          courseName: newCourse.courseName,
          description: newCourse.description,
          status: newCourse.status,
          courseId: courseId,
          link: newCourse.link,
          professorId: user.uid,
        });
      }
      setNewCourse({ courseName: '', description: '', status: 'Ongoing', link: '' });
      setEditingCourseId(null);
      setFormVisible(false);
    } catch (err) {
      console.error('Error saving course:', err);
    }
  };

  const generateCourseId = (courseName) => {
    const deptPrefix = courseName.slice(0, 2).toUpperCase();
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return deptPrefix + randomNumber;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading && courses.length === 0) {
    return <div>Loading courses...</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Title and Add Course Button */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            My Courses
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setNewCourse({ courseName: '', description: '', status: 'Ongoing', link: '' });
            setEditingCourseId(null);
            setFormVisible(true);
          }}
          sx={{
            textTransform: 'none',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.75, sm: 1 },
            minHeight: { xs: '36px', sm: 'auto' },
            borderRadius: 2,
            alignSelf: { xs: 'center', sm: 'auto' },
          }}
        >
          Add Course
        </Button>
      </Box>

      {/* Course Cards */}
      <Grid container spacing={3} justifyContent="flex-start">
        {!loading && courses.length === 0 && (
          <Typography sx={{ color: 'text.secondary', textAlign: 'center' }}>
            No courses added yet.
          </Typography>
        )}

        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card
              sx={{
                width: '100%',
                position: 'relative',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 6,
                },
              }}
            >
              {/* Status Chip */}
              <Chip
                label={course.status === 'Ongoing' ? 'Ongoing' : 'Completed'}
                color={course.status === 'Ongoing' ? 'primary' : 'secondary'}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1,
                }}
              />

              {/* Card Content */}
              <CardContent sx={{ pt: 5 }}>
                <Typography variant="h6" gutterBottom>{course.courseName}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{course.description}</Typography>

                {course.link && (
                  <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                    <a href={course.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                      Go to Course
                    </a>
                  </Typography>
                )}

                <Box sx={{
                  mt: 2,
                  pt: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid lightgrey'
                }}>
                  <Button onClick={() => handleEditCourse(course)} color="primary" size="small" startIcon={<EditIcon />}>
                    Edit
                  </Button>
                  <Button onClick={() => handleRemoveCourse(course.id)} startIcon={<DeleteIcon />} color="error" size="small">
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormVisible} onClose={() => setFormVisible(false)}>
        <DialogTitle>{editingCourseId ? 'Edit Course' : 'Add New Course'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Course Name"
            fullWidth
            margin="normal"
            name="courseName"
            value={newCourse.courseName}
            onChange={handleInputChange}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            name="description"
            value={newCourse.description}
            onChange={handleInputChange}
          />
          <TextField
            label="Course Link"
            fullWidth
            margin="normal"
            name="link"
            value={newCourse.link}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              name="status"
              value={newCourse.status}
              onChange={handleInputChange}
            >
              <MenuItem value="Ongoing">Ongoing</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormVisible(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddCourse} color="primary">
            {editingCourseId ? 'Update Course' : 'Add Course'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfessorCourses;
