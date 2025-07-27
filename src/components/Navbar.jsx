// src/components/Navbar.jsx
import axios from 'axios';
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
  await axios.post('/api/auth/logout', {}, { withCredentials: true });
  logout();           // properly clears context
  navigate('/login');
};


  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#eee' }}>
      <div>
        <Link to="/">🏠 Home</Link>
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: '1rem' }}>Welcome, {user.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
