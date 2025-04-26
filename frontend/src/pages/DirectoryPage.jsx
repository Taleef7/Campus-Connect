// DirectoryPage.jsx (Color polished version)
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Container, Grid2, Paper, Button } from '@mui/material';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { signOut } from 'firebase/auth';
import UserCard from '../components/directory/UserCard';
import SearchBar from '../components/directory/SearchBar';
import FilterControls from '../components/directory/FilterControls';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const DirectoryPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setCurrentUserRole(null);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError("Error: No authenticated user found (should be handled by ProtectedRoute).");
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCurrentUserRole(userDocSnap.data().role);
        } else { throw new Error("Current user document not found."); }
      } catch (err) {
        console.error("Error fetching current user role:", err);
        setError("Could not determine user role.");
        setLoading(false);
        return;
      }

      try {
        const usersCollectionRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollectionRef);
        const usersList = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.id !== currentUser.uid);
        setAllUsers(usersList);
      } catch (err) {
        console.error("Error fetching users directory:", err);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(allUsers.filter(u => u.role === 'professor' && u.department).map(u => u.department));
    return Array.from(depts).sort();
  }, [allUsers]);

  const uniqueMajors = useMemo(() => {
    const majors = new Set(allUsers.filter(u => u.role === 'student' && u.major).map(u => u.major));
    return Array.from(majors).sort();
  }, [allUsers]);

  const uniqueYears = useMemo(() => {
    const years = new Set(allUsers.filter(u => u.role === 'student' && u.year).map(u => u.year));
    return Array.from(years).sort();
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term && !selectedRole && !selectedDepartment && !selectedMajor && !selectedYear) {
      return allUsers;
    }
    return allUsers.filter(user => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        user.name?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term) ||
        user.major?.toLowerCase().includes(term) ||
        user.department?.toLowerCase().includes(term) ||
        user.year?.toLowerCase().includes(term) ||
        (Array.isArray(user.interests) && user.interests.some(interest => interest.toLowerCase().includes(term))) ||
        (typeof user.interests === 'string' && user.interests.toLowerCase().includes(term));
      const matchesRole = !selectedRole || user.role === selectedRole;
      const matchesDept = !selectedDepartment || user.department === selectedDepartment;
      const matchesMajor = !selectedMajor || user.major === selectedMajor;
      const matchesYear = !selectedYear || user.year === selectedYear;
      return matchesSearch && matchesRole && matchesDept && matchesMajor && matchesYear;
    });
  }, [allUsers, searchTerm, selectedRole, selectedDepartment, selectedMajor, selectedYear]);

  const handleSearchChange = (event) => { setSearchTerm(event.target.value); };
  const handleRoleChange = (event) => { setSelectedRole(event.target.value); };
  const handleDepartmentChange = (event) => { setSelectedDepartment(event.target.value); };
  const handleMajorChange = (event) => { setSelectedMajor(event.target.value); };
  const handleYearChange = (event) => { setSelectedYear(event.target.value); };
  const handleSignOut = async () => {
    try { await signOut(auth); navigate('/'); } catch (error) { console.error("Sign out error:", error); }
  };

  const dashboardPath = currentUserRole === 'student' ? '/student-dashboard' : currentUserRole === 'professor' ? '/professor-dashboard' : null;

  if (loading || !currentUserRole) {
    return (
      <DashboardLayout handleSignOut={handleSignOut} dashboardPath={dashboardPath}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout handleSignOut={handleSignOut} dashboardPath={dashboardPath}>
      <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom component="h1" sx={{ color: '#112d4e', fontWeight: 'bold', textAlign: 'center' }}>
          User Directory & Search
        </Typography>
        <Paper elevation={2} sx={{ mb: 2, p: 3, borderRadius: 3, backgroundColor: '#f7f9fc' }}>
          <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
          <FilterControls
            selectedRole={selectedRole}
            selectedDepartment={selectedDepartment}
            selectedMajor={selectedMajor}
            selectedYear={selectedYear}
            onRoleChange={handleRoleChange}
            onDepartmentChange={handleDepartmentChange}
            onMajorChange={handleMajorChange}
            onYearChange={handleYearChange}
            departmentsList={uniqueDepartments}
            majorsList={uniqueMajors}
            yearsList={uniqueYears}
          />
        </Paper>
        <Box>
          {error ? (
            <Typography color="error" sx={{ textAlign: 'center', mt: 5 }}>{error}</Typography>
          ) : (
            <Grid2 container spacing={3} alignItems="stretch">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <Grid2 key={user.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <UserCard user={user} />
                  </Grid2>
                ))
              ) : (
                <Grid2 size={12}>
                  <Typography sx={{ textAlign: 'center', mt: 5, color: '#6c757d' }}>
                    {searchTerm || selectedRole || selectedDepartment || selectedMajor || selectedYear
                      ? `No users found matching the current criteria.`
                      : "No users found."}
                  </Typography>
                </Grid2>
              )}
            </Grid2>
          )}
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default DirectoryPage;