import React, { useState, useRef, useEffect } from 'react';
import {
  Paper, Typography, Button, Box, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Stack, Menu, MenuItem
} from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';
import { app, db, auth } from '../../firebase';

const storage = getStorage(app);

const ProfileInfoSection = ({ professorData, user }) => {
  const [open, setOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    name: '',
    headline: '',
    pronouns: '',
    department: '',
    about: ''
  });

  useEffect(() => {
    if (professorData) {
      setForm({
        name: professorData.name || '',
        headline: professorData.headline || '',
        pronouns: professorData.pronouns || '',
        department: professorData.department || '',
        about: professorData.about || ''
      });
      setResumeUploaded(!!professorData.resumeLink);
    }
  }, [professorData]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSave = async () => {
    await updateDoc(doc(db, 'users', user.uid), form);
    setOpen(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid || !professorData?.id) return;

    try {
      const storageRef = ref(storage, `resumes/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'users', professorData.id), {
        resumeLink: downloadURL,
        resumePath: storageRef.fullPath,
      });

      setResumeUploaded(true);
      window.location.reload(); // To reflect changes immediately
    } catch (err) {
      console.error('Resume upload failed:', err);
    }

    setMenuAnchor(null);
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', p: 3, borderRadius: 4, backgroundColor: '#fff', position: 'relative' }}>
      <Button
        size="small"
        sx={{ position: 'absolute', top: 8, right: 8 }}
        onClick={() => setOpen(true)}
      >
        ✏️ Edit
      </Button>

      <Typography variant="subtitle2" color="text.secondary">Title</Typography>
      <Typography>{professorData?.headline || '—'}</Typography>

      <Typography variant="subtitle2" color="text.secondary" mt={2}>Pronouns</Typography>
      <Typography>{professorData?.pronouns || '—'}</Typography>

      <Typography variant="subtitle2" color="text.secondary" mt={2}>Department</Typography>
      <Typography>{professorData?.department || '—'}</Typography>

      <Typography variant="subtitle2" color="text.secondary" mt={2}>About</Typography>
      <Typography sx={{ whiteSpace: 'pre-wrap' }}>{professorData?.about || '—'}</Typography>

      <Box mt={2}>
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{
            borderRadius: '20px',
            color: '#c0a060',
            borderColor: '#e6dbc7',
            fontWeight: 600,
            textTransform: 'none',
            justifyContent: 'center',
            px: 2
          }}
        >
          {resumeUploaded ? 'Resume' : 'Upload Resume'}
        </Button>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          MenuListProps={{ onMouseLeave: () => setMenuAnchor(null) }}
        >
          {professorData?.resumeLink && (
            <MenuItem onClick={() => window.open(professorData.resumeLink, '_blank')}>
              📄 View Resume
            </MenuItem>
          )}
          <MenuItem onClick={handleUploadClick}>
            📑 Update Resume
          </MenuItem>
        </Menu>

        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept=".pdf"
          onChange={handleResumeUpload}
        />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Edit Profile Info</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Name" value={form.name} onChange={handleChange('name')} fullWidth />
            <TextField label="Title" value={form.headline} onChange={handleChange('headline')} fullWidth />
            <TextField label="Pronouns" value={form.pronouns} onChange={handleChange('pronouns')} fullWidth />
            <TextField label="Department" value={form.department} onChange={handleChange('department')} fullWidth />
            <TextField label="About" value={form.about} onChange={handleChange('about')} multiline rows={3} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Update</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ProfileInfoSection;
