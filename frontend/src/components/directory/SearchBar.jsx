/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// frontend/src/components/directory/SearchBar.jsx
import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ searchTerm, onSearchChange, placeholder = "Search by name, major, department, interests..." }) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      value={searchTerm}
      onChange={onSearchChange} // Pass the event directly up
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      }}
      sx={{ mb: 2 }} // Add margin bottom
    />
  );
};

export default SearchBar;