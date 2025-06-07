import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../../api';

function ProfileCard() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const isFormValid = name.trim() !== '';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const userData = res.data;
        setProfile(userData);
        setName(userData.name || '');
        setPhone(userData.phone || '');
        setEmail(userData.email || '');
      } catch (err) {
        console.error('Fetch profile error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch profile');
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    if (!isFormValid) return;
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/auth/profile`,
        { name, phone },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const updatedUser = res.data;
      setProfile(updatedUser);
      setName(updatedUser.name || '');
      setPhone(updatedUser.phone || '');
      setEmail(updatedUser.email || '');
      setSuccess('Profile updated successfully');
      setError('');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update profile error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Update failed');
      setSuccess('');
    }
  };

  // Animation variants for card hover
  const cardVariants = {
    initial: { scale: 1, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    hover: { 
      scale: 1.05, 
      boxShadow: '0 10px 20px rgba(210, 0, 0, 0.3)',
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  // Animation variants for elements
  const elementVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: 'easeOut' 
      }
    }
  };

  // Animation for button hover
  const buttonVariants = {
    hover: { 
      scale: 1.05, 
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center -mt-24">
      <motion.div
        className="w-full max-w-sm sm:max-w-md bg-white bg-opacity-95 rounded-3xl border border-red-100 p-6 sm:p-8"
        initial="initial"
        whileHover="hover"
        variants={cardVariants}
      >
        <motion.h2 
          className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-[#d20000]"
          variants={elementVariants}
        >
          My Profile
        </motion.h2>
        {error && (
          <motion.div 
            className="mb-4 p-3 bg-red-50 text-red-900 rounded-lg border border-red-200 text-sm sm:text-base text-center"
            variants={elementVariants}
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div 
            className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm sm:text-base text-center"
            variants={elementVariants}
          >
            {success}
          </motion.div>
        )}
        {profile ? (
          <motion.div 
            className="space-y-5"
            variants={{
              visible: { transition: { staggerChildren: 0.2 } }
            }}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={elementVariants}>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1">
                Name
              </label>
              {isEditing ? (
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-[#ff7b7b] transition duration-300"
                  required
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl text-gray-800">{name || 'Not provided'}</div>
              )}
            </motion.div>
            <motion.div variants={elementVariants}>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1">
                Email
              </label>
              <div className="p-3 bg-gray-50 rounded-xl text-gray-800">{email || 'Not provided'}</div>
              {!isEditing && (
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              )}
            </motion.div>
            <motion.div variants={elementVariants}>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-1">
                Phone
              </label>
              {isEditing ? (
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-[#ff7b7b] transition duration-300"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl text-gray-800">{phone || 'Not provided'}</div>
              )}
            </motion.div>
            <motion.div 
              className="pt-4 flex gap-3"
              variants={elementVariants}
            >
              {isEditing ? (
                <>
                  <motion.button
                    onClick={handleUpdate}
                    className="cursor-pointer flex-1 bg-[#d20000] text-white p-3 rounded-xl font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isFormValid}
                    variants={buttonVariants}
                    whileHover={isFormValid ? 'hover' : {}}
                  >
                    Save Changes
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setIsEditing(false);
                      setName(profile.name || '');
                      setPhone(profile.phone || '');
                      setError('');
                    }}
                    className="cursor-pointer flex-1 bg-gray-200 text-gray-800 p-3 rounded-xl font-semibold hover:bg-gray-300 transition duration-300"
                    variants={buttonVariants}
                    whileHover="hover"
                  >
                    Cancel
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer w-full bg-[#d20000] text-white p-3 rounded-xl font-semibold hover:bg-red-800 transition duration-300"
                  variants={buttonVariants}
                  whileHover="hover"
                >
                  Edit Profile
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.p 
            className="text-gray-600 text-center text-sm sm:text-base"
            variants={elementVariants}
          >
            Loading profile...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

export default ProfileCard;