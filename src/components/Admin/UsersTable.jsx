import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../api';
import { FiSearch, FiTrash2 } from 'react-icons/fi';

function UserTable() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({ id: null, name: '' });
  const [currentUserId, setCurrentUserId] = useState(null);
  const modalRef = useRef(null);

  // Fetch current user's profile to get their ID
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCurrentUserId(res.data.id);
      } catch (err) {
        console.error('Fetch profile error:', err.response?.data || err.message);
        setError('Failed to fetch user profile');
      }
    };
    fetchProfile();
  }, []);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsers(res.data);
        setFilteredUsers(res.data);
      } catch (err) {
        console.error('Fetch users error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);

  // Filter users by search term
  useEffect(() => {
    const filtered = users.filter((user) => {
      const nameMatch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || emailMatch;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(users.filter((user) => user._id !== selectedUser.id));
      setFilteredUsers(filteredUsers.filter((user) => user._id !== selectedUser.id));
      setSuccess('User deleted successfully');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Delete user error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to delete user');
      setSuccess('');
      setShowDeleteModal(false);
    }
  };

  const openDeleteModal = (userId, userName) => {
    setSelectedUser({ id: userId, name: userName || 'this user' });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedUser({ id: null, name: '' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled via useEffect
  };

  // Handle Escape key and click outside
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && showDeleteModal) {
      closeDeleteModal();
    }
  }, [showDeleteModal]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeDeleteModal();
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
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  // Animation for modal
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <motion.div
        className="container mx-auto max-w-5xl bg-white bg-opacity-95 rounded-3xl border border-red-100 overflow-hidden"
        initial="initial"
        whileHover="hover"
        variants={cardVariants}
      >
        {/* Header */}
        <div className="bg-[#d20000] p-4 text-white">
          <motion.h2 
            className="text-2xl sm:text-3xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Manage Users
          </motion.h2>
        </div>

        <div className="p-6 sm:p-8">
          {/* Status messages */}
          {error && (
            <motion.div 
              className="mb-6 p-4 bg-red-50 text-red-900 rounded-lg border border-red-200 text-sm sm:text-base"
              variants={elementVariants}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div 
              className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm sm:text-base"
              variants={elementVariants}
            >
              {success}
            </motion.div>
          )}

          {/* Search bar */}
          <motion.div 
            className="mb-8"
            variants={elementVariants}
          >
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-[#ff7b7b] transition duration-300 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
          </motion.div>

          {/* Users table */}
          <motion.div
            className="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
            variants={elementVariants}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role in Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <motion.tr 
                      key={user._id} 
                      className="bg-white hover:bg-gray-50 transition-colors"
                      variants={elementVariants}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.phone || 'Not provided'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.team || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.roleInTeam || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user._id !== currentUserId && (
                          <motion.button
                            onClick={() => openDeleteModal(user._id, user.name)}
                            className="cursor-pointer flex items-center text-[#d20000] hover:text-red-800 transition-colors"
                            aria-label={`Delete user ${user.name || 'unknown'}`}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiTrash2 className="mr-2" />
                            Delete
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {filteredUsers.length === 0 && (
            <motion.div 
              className="mt-8 text-center text-gray-600 py-12"
              variants={elementVariants}
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" 
                stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" 
                  strokeWidth={1} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <h3 className="mt-2 text-lg font-semibold">
                {searchTerm ? 'No matching users found' : 'No users found'}
              </h3>
              <p className="mt-1 text-sm sm:text-base">
                {searchTerm ? 'Try a different search term' : 'No users available.'}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && 
          <motion.div
            className="fixed inset-0 bg-[#0000006d] backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClickOutside}
            role="dialog"
            aria-labelledby="delete-modal-title"
            aria-describedby="modal-description"
          >
            <motion.div
              ref={modalRef}
              className="w-full max-w-sm sm:max-w-md bg-white bg-opacity-95 rounded-3xl border border-red-100 p-6 sm:p-8"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <h3 id="delete-modal-title" class="text-xl sm:text-2xl font-semibold text-[#d20000] mb-4 text-center">
                Confirm Deletion
              </h3>
              <p id="modal-description" className="text-gray-600 text-sm sm:text-base mb-6 text-center">
                Are you sure you want to delete {selectedUser.name}?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleDelete}
                  className="cursor-pointer flex-1 bg-[#d20000] text-white sm:p-4 rounded-xl p-2 font-semibold hover:bg-red-800 transition duration-300"
                  aria-label="Confirm delete user action"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                >
                  Confirm
                </motion.button
                >
                  <motion.button
                    onClick={() => closeDeleteModal()}
                    className="cursor-pointer flex-1 bg-gray-200 text-gray-800 sm:p-4 rounded-xl p-2 font-semibold hover:bg-gray-300 transition duration-200"
                    aria-label="Cancel delete user action"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>
  );
}


export default UserTable;