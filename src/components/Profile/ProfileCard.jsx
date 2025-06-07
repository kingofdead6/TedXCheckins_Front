import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../api';
import { motion } from 'framer-motion';

function ProfileCard() {
  const [profile, setProfile] = useState({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProfile(res.data);
        setName(res.data.name);
        setPhone(res.data.phone);
        setEmail(res.data.email);
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
        { name, phone },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setProfile(res.data);
      setSuccess('Profile updated successfully');
      setError('');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 p-4 sm:p-6">
      <motion.div
        className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with TEDx red accent */}
        <div className="bg-[#e62b1e] p-4 text-white">
          <motion.h2 
            className="text-2xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            My Profile
          </motion.h2>
        </div>

        <div className="p-6">
          {/* Status messages */}
          {error && (
            <motion.div 
              className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div 
              className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {success}
            </motion.div>
          )}

          {/* Profile Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e62b1e] focus:border-transparent"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-lg">{profile.name}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="p-2 bg-gray-50 rounded-lg">{email}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e62b1e] focus:border-transparent"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-lg">{profile.phone || 'Not provided'}</div>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              {isEditing ? (
                <>
                  <motion.button
                    onClick={handleUpdate}
                    className="flex-1 bg-[#e62b1e] text-white p-2 rounded-lg font-medium hover:bg-[#c8241a] transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Save Changes
                  </motion.button>
                  <motion.button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-200 text-gray-800 p-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-[#e62b1e] text-white p-2 rounded-lg font-medium hover:bg-[#c8241a] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Edit Profile
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfileCard;