import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../api';

function ProfileCard() {
  const [profile, setProfile] = useState({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProfile(res.data);
        setName(res.data.name);
        setPhone(res.data.phone);
        setProfilePicture(res.data.profilePicture);
      } catch (err) {
        setError('Failed to fetch profile');
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/profile`,
        { name, phone, profilePicture },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setProfile(res.data);
      setError('');
    } catch (err) {
      setError('Update failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="space-y-4">
        <img
          src={profilePicture || 'https://via.placeholder.com/150'}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={profilePicture}
          onChange={(e) => setProfilePicture(e.target.value)}
          placeholder="Profile Picture URL"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleUpdate}
          className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;