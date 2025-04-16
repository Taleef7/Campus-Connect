import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProfessorAuth from './pages/ProfessorAuth';
import ProfessorDashboard from './pages/ProfessorDashboard';
import StudentAuth from './pages/StudentAuth';
import StudentDashboard from './pages/StudentDashboard';
import ProfessorCourses from './pages/ProfessorCourses';
import DirectoryPage from './pages/DirectoryPage'; // <-- Import the new page
import UserProfilePage from './pages/UserProfilePage'; // <-- Import the new page
import ProtectedRoute from './components/auth/ProtectedRoute';


const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/professor-login" element={<ProfessorAuth />} />
      <Route path="/professor-signup" element={<ProfessorAuth />} />
      <Route path="/student-login" element={<StudentAuth />} />
      <Route path="/student-signup" element={<StudentAuth />} />

      {/* Protected Routes */}
      <Route path="/directory" element={
        <ProtectedRoute>
          <DirectoryPage />
        </ProtectedRoute>
      } />
      <Route path="/profile/:userId" element={ // Also protect profile view
        <ProtectedRoute>
          <UserProfilePage />
        </ProtectedRoute>
      } />
       <Route path="/professor-dashboard" element={
         <ProtectedRoute>
            <ProfessorDashboard />
         </ProtectedRoute>
        } />
       <Route path="/professor-courses" element={ // Consider if this needs protection
         <ProtectedRoute>
            <ProfessorCourses />
         </ProtectedRoute>
        } />
        <Route path="/student-dashboard" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />

      {/* Add other routes as needed */}

    </Routes>
  );
};

export default App;