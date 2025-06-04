import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LogoutButton from './LogoutButton';
import { API_BASE_URL } from '../../../api';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          return;
        }
        const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error('Navbar fetch user error:', err.response?.data); // Debug error
        setUser(null);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  return (
    <nav className="bg-red-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">TEDx Check-ins</Link>
        <div className="space-x-4">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <>
                  <Link to="/admin/dashboard" className="hover:underline">Admin Dashboard</Link>
                  <Link to="/admin/events" className="hover:underline">Manage Events</Link>
                  <Link to="/admin/users" className="hover:underline">Manage Users</Link>
                  <Link to="/admin/statistics" className="hover:underline">Statistics</Link>
                </>
              ) : (
                <>
                  <Link to="/events" className="hover:underline">Events</Link>
                  <Link to="/profile" className="hover:underline">Profile</Link>
                </>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="hover:underline">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;