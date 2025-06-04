import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../api';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      const { token, user } = res.data;
      console.log('Login response:', { token, user }); // Debug response
      localStorage.setItem('token', token);
      if (user.role === 'admin') {
        console.log('Redirecting to admin dashboard'); // Debug redirection
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('Redirecting to events'); // Debug redirection
        navigate('/events', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message); // Debug error
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default LoginForm;