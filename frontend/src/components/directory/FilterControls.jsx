/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// frontend/src/components/directory/FilterControls.jsx
import React from 'react';
import { Box, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const FilterControls = ({
  // Filter values
  selectedRole,
  selectedDepartment,
  selectedMajor,
  selectedYear,
  // Change handlers
  onRoleChange,
  onDepartmentChange,
  onMajorChange,
  onYearChange,
  // Options for dropdowns
  departmentsList,
  majorsList,
  yearsList,
}) => {
  return (
    <Box sx={{ mb: 2 }}> {/* Add some margin below filters */}
      <Grid container spacing={2}>
        {/* Role Filter */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="role-filter-label">Role</InputLabel>
            <Select
              labelId="role-filter-label"
              id="role-filter-select"
              value={selectedRole}
              label="Role"
              onChange={onRoleChange} // Pass event up
            >
              <MenuItem value=""><em>All Roles</em></MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="professor">Professor</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Department Filter (Show only if not filtering by Student) */}
        {selectedRole !== 'student' && (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" disabled={selectedRole === 'student'}>
                <InputLabel id="dept-filter-label">Department</InputLabel>
                <Select
                  labelId="dept-filter-label"
                  id="dept-filter-select"
                  value={selectedDepartment}
                  label="Department"
                  onChange={onDepartmentChange}
                >
                  <MenuItem value=""><em>All Departments</em></MenuItem>
                  {departmentsList.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept || '(No Dept.)'}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
        )}


        {/* Major Filter (Show only if not filtering by Professor) */}
        {selectedRole !== 'professor' && (
            <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" disabled={selectedRole === 'professor'}>
                <InputLabel id="major-filter-label">Major</InputLabel>
                <Select
                labelId="major-filter-label"
                id="major-filter-select"
                value={selectedMajor}
                label="Major"
                onChange={onMajorChange}
                >
                <MenuItem value=""><em>All Majors</em></MenuItem>
                 {majorsList.map((major) => (
                    <MenuItem key={major} value={major}>{major || '(No Major)'}</MenuItem>
                  ))}
                </Select>
            </FormControl>
            </Grid>
        )}

        {/* Year Filter (Show only if not filtering by Professor) */}
        {selectedRole !== 'professor' && (
            <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" disabled={selectedRole === 'professor'}>
                <InputLabel id="year-filter-label">Year</InputLabel>
                <Select
                labelId="year-filter-label"
                id="year-filter-select"
                value={selectedYear}
                label="Year"
                onChange={onYearChange}
                >
                <MenuItem value=""><em>All Years</em></MenuItem>
                 {yearsList.map((year) => (
                    <MenuItem key={year} value={year}>{year || '(No Year)'}</MenuItem>
                  ))}
                </Select>
            </FormControl>
            </Grid>
        )}

      </Grid>
    </Box>
  );
};

export default FilterControls;