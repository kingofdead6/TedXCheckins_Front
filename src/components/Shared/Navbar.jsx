import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../../../api';

function Navbar() {
  const [user, setUser] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user
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
        console.error('Navbar fetch user error:', err.response?.data);
        setUser(null);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
        setIsMenuOpen(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Toggle hamburger menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Animation variants
  const navVariants = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    hidden: { opacity: 0, y: -100, transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  const linkVariants = {
    hover: {
      scale: 1.05,
      y: -2,
      backgroundColor: '#e62b1e',
      color: '#ffffff',
      transition: { duration: 0.2, ease: 'easeInOut' },
    },
  };

  const menuVariants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    open: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeInOut' } },
  };


  // Determine if on main page
  const isMainPage = location.pathname === '/';

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-50/95 to-gray-50/95 backdrop-blur-md text-black text-base sm:text-lg p-4 shadow-md border-b border-red-100"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={navVariants}
          >
            <div className="container mx-auto flex items-center justify-between">
              {/* Logo */}
              <motion.div variants={linkVariants} whileHover="hover">
                <Link
                  to="/"
                  className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300 font-semibold"
                >
                  TEDx Check-ins
                </Link>
              </motion.div>

              {/* Hamburger Button and Desktop Menu */}
              <div className="flex items-center">
                {/* Hamburger Button */}
                <button
                  className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
                  onClick={toggleMenu}
                  aria-label="Toggle menu"
                >
                  <span
                    className={`w-8 h-1 bg-[#e62b1e] transition-transform duration-300 ${
                      isMenuOpen ? 'rotate-45 translate-y-2.5' : ''
                    }`}
                  ></span>
                  <span
                    className={`w-8 h-1 bg-[#e62b1e] ${isMenuOpen ? 'opacity-0' : ''}`}
                  ></span>
                  <span
                    className={`w-8 h-1 bg-[#e62b1e] transition-transform duration-300 ${
                      isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''
                    }`}
                  ></span>
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-4">
                  {user ? (
                    <>
                      {user.role === 'admin' ? (
                        <>
                          <motion.div variants={linkVariants} whileHover="hover">
                            <Link
                              to="/admin/events"
                              className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300"
                            >
                              Manage Events
                            </Link>
                          </motion.div>
                          <motion.div variants={linkVariants} whileHover="hover">
                            <Link
                              to="/admin/users"
                              className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300"
                            >
                              Manage Users
                            </Link>
                          </motion.div>
                          <motion.div variants={linkVariants} whileHover="hover">
                            <Link
                              to="/admin/statistics"
                              className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300"
                            >
                              Statistics
                            </Link>
                          </motion.div>
                          <motion.div variants={linkVariants} whileHover="hover">
                            <button
                              onClick={handleLogout}
                              className="cursor-pointer bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300"
                            >
                              Logout
                            </button>
                          </motion.div>
                        </>
                      ) : (
                        <>
                          <motion.div variants={linkVariants} whileHover="hover">
                            <Link
                              to="/events"
                              className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300"
                            >
                              Events
                            </Link>
                          </motion.div>
                          <motion.div variants={linkVariants} whileHover="hover">
                            <Link
                              to="/profile"
                              className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300"
                            >
                              Profile
                            </Link>
                          </motion.div>
                          <motion.div variants={linkVariants} whileHover="hover">
                            <button
                              onClick={handleLogout}
                              className="cursor-pointer bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300"
                            >
                              Logout
                            </button>
                          </motion.div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <motion.div variants={linkVariants} whileHover="hover">
                        <Link
                          to="/login"
                          className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300"
                        >
                          Login
                        </Link>
                      </motion.div>
                      <motion.div variants={linkVariants} whileHover="hover">
                        <Link
                          to="/register"
                          className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300"
                        >
                          Register
                        </Link>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  className="md:hidden bg-white bg-opacity-95 rounded-xl border border-red-100 p-4 mt-2 shadow-lg"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={menuVariants}
                >
                  {user ? (
                    <>
                      {user.role === 'admin' ? (
                        <div className="flex flex-col space-y-2">
                          <Link
                            to="/admin/events"
                            className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300 text-center"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Manage Events
                          </Link>
                          <Link
                            to="/admin/users"
                            className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300 text-center"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Manage Users
                          </Link>
                          <Link
                            to="/admin/statistics"
                            className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300 text-center"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Statistics
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsMenuOpen(false);
                            }}
                            className="cursor-pointer bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300 text-center"
                          >
                            Logout
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <Link
                            to="/events"
                            className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300 text-center"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Events
                          </Link>
                          <Link
                            to="/profile"
                            className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300 text-center"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Profile
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsMenuOpen(false);
                            }}
                            className="cursor-pointer bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300 text-center"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link
                        to="/login"
                        className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300 text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="bg-transparent border-2 border-[#e62b1e] rounded-xl px-4 py-2 hover:bg-[#e62b1e] hover:text-white transition-colors duration-300 text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        )}
      </AnimatePresence>
      {!isMainPage && <div className="h-16" />}
    </>
  );
}

export default Navbar;