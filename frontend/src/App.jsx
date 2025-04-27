// frontend/src/App.jsx
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ProfessorDashboard = lazy(() => import('./pages/ProfessorDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const ProfessorCourses = lazy(() => import('./pages/ProfessorCourses'));
const DirectoryPage = lazy(() => import('./pages/DirectoryPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));

const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
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
    </Suspense>
  );
};

export default App;