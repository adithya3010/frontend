// App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MapComponent from './components/MapComponent';
import AddLocationForm from './components/AddLocationForm';
import LocationPage from './pages/LocationPage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar'; // ✅ Import Navbar
import { AuthProvider, AuthContext } from './context/AuthContext';
import Unauthorized from './pages/Unauthorized'

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}
function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user && user.role === 'admin' ? children : <Navigate to="/unauthorized" />;
}
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar /> {/* ✅ Always visible on all pages */}
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route path="/unauthorized"
           element={<Unauthorized />}
            />
          <Route
            path="/"
            element={
              <div>
                <h2 style={{ textAlign: 'center' }}>Find Your Charging Station</h2>
                <AddLocationForm />
                <MapComponent />
              </div>
            }
          />

          <Route path="/location/:id" element={<LocationPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
