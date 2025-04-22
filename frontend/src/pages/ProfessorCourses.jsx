/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Chip, TextField,
  MenuItem, Select, InputLabel, FormControl, Dialog, DialogActions,
  DialogContent, DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit'; // Assuming you want Edit icon
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
  collection, getDocs, addDoc, deleteDoc, updateDoc, query, where, doc, onSnapshot
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
  const [editingCourseId, setEditingCourseId] = useState(null); // ✅ NEW

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

  // --- UPDATED useEffect to use onSnapshot for Courses ---
  useEffect(() => {
    let unsubscribe = () => {}; // Initialize unsubscribe function

    if (user) {
      setLoading(true); // Set loading true when user is available
      const q = query(collection(db, 'courses'), where('professorId', '==', user.uid));

      // Set up the real-time listener
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedCourses = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(fetchedCourses); // Update state with live data
        setLoading(false); // Set loading false after first data arrives
      }, (error) => {
        // Handle listener errors
        console.error('Error listening to courses:', error);
        setLoading(false); // Stop loading on error too
        // Optionally set an error state to display message
      });

    } else {
      // No user, clear courses and stop loading
      setCourses([]);
      setLoading(false);
    }

    // Cleanup function to unsubscribe when user changes or component unmounts
    return () => unsubscribe();
  }, [user]); // Re-run listener setup if user changes
  // --- End UPDATED useEffect ---

  const handleRemoveCourse = async (id) => {
    try {
      await deleteDoc(doc(db, 'courses', id));
      setCourses(courses.filter((course) => course.id !== id));
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  // ✅ EDIT FUNCTION
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

  // ✅ UPDATED: Add or Update
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

      // Reset
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

  if (loading && courses.length === 0) { // Show loading only on initial load maybe
    return <div>Loading courses...</div>; // Or a CircularProgress
 }

  return (
    <Box>
     {/* Title */}
     <Typography variant="h4" gutterBottom>
       My Courses
     </Typography>

      {/* Add Course Button (triggers dialog) */}
     <Button
       variant="contained"
       onClick={() => {
         setNewCourse({ courseName: '', description: '', status: 'Ongoing', link: '' });
         setEditingCourseId(null);
         setFormVisible(true);
       }}
      // Using sx for consistency, but style prop is also fine
       sx={{
            // Consider less absolute positioning, maybe just mb: 2? Or keep if needed.
            // position: 'absolute',
            // bottom: '40px',
            // right: '20px',
            mb: 2, // Example: Margin bottom instead of absolute
            float: 'right', // Example: Float right
            // ... other styles like borderRadius, padding etc. if desired
       }}
       startIcon={<AddIcon />}
     >
       Add Course
     </Button>

     {/* Clear float if using float */}
     <Box sx={{ clear: 'both', mb: 2 }} />

     {/* Course Cards Container */}
     <Box display="flex" flexWrap="wrap" gap={2} > {/* Removed style={{ position: 'relative' }} unless needed for button */}
        {/* Loading state (optional refinement) */}
       {loading && courses.length === 0 && (
         <Typography sx={{width: '100%', textAlign: 'center', color: 'text.secondary'}}>Loading courses...</Typography>
       )}
       {/* No courses message */}
       {!loading && courses.length === 0 && (
         <Typography sx={{width: '100%', textAlign: 'center', color: 'text.secondary'}}>No courses added yet.</Typography>
       )}

       {/* Mapping through courses */}
       {courses.map((course) => (
         <Card key={course.id} sx={{ width: '250px' }}> {/* Use sx prop */}
           <CardContent>
             {/* Chip for Status */}
             <Chip
               label={course.status === 'Ongoing' ? 'Ongoing' : 'Completed'}
               color={course.status === 'Ongoing' ? 'primary' : 'secondary'}
               size="small" // Added size small
               sx={{mb: 1}} // Added margin bottom
             />
             {/* Course Name */}
             <Typography variant="h6" gutterBottom>{course.courseName}</Typography> {/* Added gutterBottom */}
             {/* Description */}
             <Typography variant="body2" sx={{ mb: 1 }}>{course.description}</Typography> {/* Added margin bottom */}
             {/* Link */}
             {course.link && (
               <Typography variant="body2" color="primary" sx={{ mb: 1 }}> {/* Added margin bottom */}
                 <a href={course.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                   Go to Course
                 </a>
               </Typography>
             )}

             {/* Action Buttons */}
             <Box sx={{mt: 'auto', pt: 1, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid lightgrey'}}> {/* Pushes buttons down */}
               <Button onClick={() => handleEditCourse(course)} color="primary" size="small" startIcon={<EditIcon/>}> Edit </Button>
               <Button onClick={() => handleRemoveCourse(course.id)} startIcon={<DeleteIcon />} color="error" size="small"> Delete </Button>
             </Box>
           </CardContent>
         </Card>
       ))}
     </Box>


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