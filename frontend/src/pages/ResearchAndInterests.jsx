import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { db, auth } from '../firebase';
import {
  collection, query, where, getDocs, addDoc, deleteDoc, updateDoc, doc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ProfessorResearch = () => {
  const [researchItems, setResearchItems] = useState([]);
  const [newItem, setNewItem] = useState({ topic: '', publication: '', link: '', keywords: '' });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ✅ Auth listener
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

  // ✅ Fetch data when user is set
  useEffect(() => {
    if (!user) return;

    const fetchResearch = async () => {
      try {
        const q = query(collection(db, 'research'), where('professorId', '==', user.uid));
        const snapshot = await getDocs(q);
        setResearchItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching research:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResearch();
  }, [user]);

  // ✅ Secure input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Secure add/update
  const handleAddOrUpdate = async () => {
    if (!user) {
      alert("You must be signed in.");
      return;
    }

    if (!newItem.topic || !newItem.publication) {
      alert("Topic and publication are required.");
      return;
    }

    const keywordsArray = newItem.keywords.split(',').map(k => k.trim());

    try {
      if (editingId) {
        await updateDoc(doc(db, 'research', editingId), {
          ...newItem,
          keywords: keywordsArray,
        });
      } else {
        await addDoc(collection(db, 'research'), {
          ...newItem,
          keywords: keywordsArray,
          professorId: user.uid,
        });
      }

      setDialogOpen(false);
      setEditingId(null);
      setNewItem({ topic: '', publication: '', link: '', keywords: '' });

      const q = query(collection(db, 'research'), where('professorId', '==', user.uid));
      const snapshot = await getDocs(q);
      setResearchItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error saving research:", err);
    }
  };

  // ✅ Secure delete
  const handleDelete = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'research', id));
      setResearchItems(researchItems.filter(item => item.id !== id));
    } catch (err) {
      console.error("Error deleting research:", err);
    }
  };

  const handleEdit = (item) => {
    setNewItem({
      topic: item.topic,
      publication: item.publication,
      link: item.link,
      keywords: item.keywords.join(', '),
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  // ✅ Not signed in
  if (!user) {
    return (
      <Box>
        <Typography variant="h6">Please log in to view your research and interests.</Typography>
      </Box>
    );
  }

  if (loading) return <Typography>Loading research...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Research & Interests
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={2}>
        {researchItems.map((item) => (
          <Card key={item.id} sx={{ width: '280px' }}>
            <CardContent>
              <Typography variant="h6">{item.topic}</Typography>
              <Typography variant="body2">{item.publication}</Typography>
              {item.link && (
                <Typography variant="body2">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.link}
                  </a>
                </Typography>
              )}
              <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                {item.keywords.map((kw, i) => <Chip key={i} label={kw} />)}
              </Box>
              <Box mt={1}>
                <IconButton onClick={() => handleEdit(item)}><Edit /></IconButton>
                <IconButton onClick={() => handleDelete(item.id)}><Delete /></IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setDialogOpen(true)}
        sx={{ mt: 3 }}
      >
        Add Research
      </Button>

      <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editingId ? "Edit Research" : "Add New Research"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Topic"
            name="topic"
            fullWidth
            margin="normal"
            value={newItem.topic}
            onChange={handleChange}
          />
          <TextField
            label="Publication"
            name="publication"
            fullWidth
            margin="normal"
            value={newItem.publication}
            onChange={handleChange}
          />
          <TextField
            label="Link"
            name="link"
            fullWidth
            margin="normal"
            value={newItem.link}
            onChange={handleChange}
          />
          <TextField
            label="Keywords (comma-separated)"
            name="keywords"
            fullWidth
            margin="normal"
            value={newItem.keywords}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddOrUpdate}>
            {editingId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfessorResearch;
