import React, { useEffect, useState, useRef } from 'react';
import { Avatar, Box, Button, Paper } from '@mui/material';
import { updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const ProfileHeader = ({ user }) => {
  const [professorData, setProfessorData] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;

    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfessorData(docSnap.data());
      }
    });

    return () => unsub(); // cleanup on unmount
  }, [user?.uid]);

  const uploadProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;

      await updateDoc(doc(db, 'users', user.uid), {
        photoLink: base64Data
      });
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  if (!professorData) return null; // or show loader

  return (
    <Paper elevation={3} sx={{ width: '100%', p: 3, mb: 3, borderRadius: 4, textAlign: 'center', position: 'relative' }}>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Avatar
          src={professorData.photoLink}
          sx={{ width: 100, height: 100, mx: 'auto', mb: 1 }}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          hidden
          onChange={uploadProfilePicture}
        />
        <Button
          size="small"
          sx={{ position: 'absolute', bottom: 0, right: -10, fontSize: 10 }}
          onClick={handleEditClick}
        >
          ✏️
        </Button>
      </Box>

      <Box mt={2}>
        <h3 style={{ margin: 0 }}>{professorData.name}</h3>
        <p style={{ fontSize: '0.9rem', color: '#777' }}>Professor</p>
      </Box>
    </Paper>
  );
};

export default ProfileHeader;
