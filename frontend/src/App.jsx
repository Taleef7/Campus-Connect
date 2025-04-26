// frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
// Remove old Auth imports
// import ProfessorAuth from './pages/ProfessorAuth';
// import StudentAuth from './pages/StudentAuth';
import ProfessorDashboard from './pages/ProfessorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProfessorCourses from './pages/ProfessorCourses';
import DirectoryPage from './pages/DirectoryPage';
import UserProfilePage from './pages/UserProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
// --- Import the new Auth Page ---
import AuthPage from './pages/AuthPage'; // Import the unified auth page

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      {/* --- Use the new unified Auth Route --- */}
      <Route path="/auth" element={<AuthPage />} />


      {/* Protected Routes (Keep as is) */}
      <Route path="/directory" element={ <ProtectedRoute> <DirectoryPage /> </ProtectedRoute> } />
      <Route path="/profile/:userId" element={ <ProtectedRoute> <UserProfilePage /> </ProtectedRoute> } />
      <Route path="/professor-dashboard" element={ <ProtectedRoute> <ProfessorDashboard /> </ProtectedRoute> } />
      <Route path="/professor-courses" element={ <ProtectedRoute> <ProfessorCourses /> </ProtectedRoute> } />
      <Route path="/student-dashboard" element={ <ProtectedRoute> <StudentDashboard /> </ProtectedRoute> } />

      {/* Add other routes as needed */}
       {/* Optional: Catch-all route for 404 */}
       {/* <Route path="*" element={<NotFoundPage />} /> */}

    </Routes>
  );
};

export default App;