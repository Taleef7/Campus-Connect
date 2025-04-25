
import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, Paper } from '@mui/material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';
import { app, db } from '../../firebase';

const storage = getStorage(app);

const ProfileHeader = ({ professorData, user }) => {
  const [avatarUrl, setAvatarUrl] = useState(professorData?.photoLink || '');
  const [coverUrl, setCoverUrl] = useState(professorData?.coverLink || '');

  useEffect(() => {
    setAvatarUrl(professorData?.photoLink || '');
    setCoverUrl(professorData?.coverLink || '');
  }, [professorData]);

  const uploadImage = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const path = `${type}/${user.uid}`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    const field = type === 'profilePics' ? 'photoLink' : 'coverLink';
    await updateDoc(doc(db, 'users', user.uid), { [field]: downloadURL });

    type === 'profilePics' ? setAvatarUrl(downloadURL) : setCoverUrl(downloadURL);
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', p: 3, mb: 3, borderRadius: 4, textAlign: 'center', position: 'relative' }}>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Avatar
          src={avatarUrl}
          sx={{ width: 100, height: 100, mx: 'auto', mb: 1 }}
        />
        <input
          type="file"
          id="profile-upload"
          hidden
          accept="image/*"
          onChange={(e) => uploadImage(e, 'profilePics')}
        />
        <Button
          size="small"
          sx={{ position: 'absolute', bottom: 0, right: -10, fontSize: 10 }}
          onClick={() => document.getElementById('profile-upload').click()}
        >
          ✏️
        </Button>
      </Box>

      <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
        <input
          type="file"
          id="cover-upload"
          hidden
          accept="image/*"
          onChange={(e) => uploadImage(e, 'coverPics')}
        />
        <Button
          size="small"
          sx={{ fontSize: 10 }}
          onClick={() => document.getElementById('cover-upload').click()}
        >
          🖼️
        </Button>
      </Box>

      <Box mt={2}>
        <h3 style={{ margin: 0 }}>{professorData?.name}</h3>
        <p style={{ fontSize: '0.9rem', color: '#777' }}>Professor</p>
      </Box>
    </Paper>
  );
};

export default ProfileHeader;
