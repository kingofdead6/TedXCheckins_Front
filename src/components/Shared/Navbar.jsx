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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
        setIsMenuOpen(false); // Close menu when hiding navbar
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Animation variants for navbar
  const navVariants = {
    visible: { 
      opacity: 1, 
      y: 20, 
      transition: { 
        duration: 0.3, 
        ease: 'easeInOut' 
      }
    },
    hidden: { 
      opacity: 0, 
      y: -100, 
      transition: { 
        duration: 0.3, 
        ease: 'easeInOut' 
      }
    }
  };

  // Animation variants for links
  const linkVariants = {
    hover: {
      y: -5,
      scale: 1,
      backgroundColor: '#ff7b7b', // Solid color inside button
      transition: { duration: 0.2, ease: 'easeInOut' }
    }
  };

  // Animation variants for mobile menu
  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  // Toggle hamburger menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Determine if on main page
  const isMainPage = location.pathname === '/';

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            className="fixed top-0 left-0 right-0 z-50 bg-[#00000000] text-black text-xl p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={navVariants}
          >
            <div className="container mx-auto flex justify-between items-center">
              <motion.div variants={linkVariants} whileHover="hover">
                <Link 
                  to="/" 
                  className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:text-white transition-colors duration-200"
                >
                  TEDx Check-ins
                </Link>
              </motion.div>
              {/* Hamburger button for mobile */}
              <button 
                className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                <span className={`w-8 h-1 bg-[#ff7b7b] transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
                <span className={`w-8 h-1 bg-[#ff7b7b] ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-8 h-1 bg-[#ff7b7b] transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
              </button>
              {/* Desktop menu */}
              <div className="hidden md:flex space-x-4">
                {user ? (
                  <>
                    {user.role === 'admin' ? (
                      <>
                        <motion.div variants={linkVariants} whileHover="hover">
                          <Link 
                            to="/admin/events" 
                            className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:text-white transition-colors duration-200"
                          >
                            Manage Events
                          </Link>
                        </motion.div>
                        <motion.div variants={linkVariants} whileHover="hover">
                          <Link 
                            to="/admin/users" 
                            className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:text-white transition-colors duration-200"
                          >
                            Manage Users
                          </Link>
                        </motion.div>
                        <motion.div variants={linkVariants} whileHover="hover">
                          <Link 
                            to="/admin/statistics" 
                            className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:text-white transition-colors duration-200"
                          >
                            Statistics
                          </Link>
                        </motion.div>
                        <motion.div variants={linkVariants} whileHover="hover" className='-mt-3'>
                          <button 
                            onClick={handleLogout}
                            className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:text-white transition-colors duration-200"
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
                            className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:text-white transition-colors duration-200"
                          >
                            Events
                          </Link>
                        </motion.div>
                        <motion.div variants={linkVariants} whileHover="hover">
                          <Link 
                            to="/profile" 
                            className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:text-white transition-colors duration-200"
                          >
                            Profile
                          </Link>
                        </motion.div>
                        <motion.div variants={linkVariants} whileHover="hover" className='-mt-3'>
                          <button 
                            onClick={handleLogout}
                            className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:text-white transition-colors duration-200"
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
                        className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:text-white transition-colors duration-200"
                      >
                        Login
                      </Link>
                    </motion.div>
                    <motion.div variants={linkVariants} whileHover="hover">
                      <Link 
                        to="/register" 
                        className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:text-white transition-colors duration-200"
                      >
                        Register
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
            {/* Mobile menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  className="md:hidden bg-white bg-opacity-95 text-black mt-2 rounded-xl p-4"
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
                            className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:bg-[#ff7b7b] hover:text-white transition-colors duration-200"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Manage Events
                          </Link>
                          <Link 
                            to="/admin/users" 
                            className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:bg-[#ff7b7b] hover:text-white transition-colors duration-200"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Manage Users
                          </Link>
                          <Link 
                            to="/admin/statistics" 
                            className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:bg-[#ff7b7b] hover:text-white transition-colors duration-200"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Statistics
                          </Link>
                          <button 
                            onClick={() => {
                              handleLogout();
                              setIsMenuOpen(false);
                            }}
                            className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:bg-[#ff7b7b] hover:text-white transition-colors duration-200"
                          >
                            Logout
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <Link 
                            to="/events" 
                            className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:bg-[#ff7b7b] hover:text-white transition-colors duration-200"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Events
                          </Link>
                          <Link 
                            to="/profile" 
                            className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:bg-[#ff7b7b] hover:text-white transition-colors duration-200"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Profile
                          </Link>
                          <button 
                            onClick={() => {
                              handleLogout();
                              setIsMenuOpen(false);
                            }}
                            className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:bg-[#ff7b7b] hover:text-white transition-colors duration-200"
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
                        className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:bg-[#ff7b7b] hover:text-white transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link 
                        to="/register" 
                        className="bg-transparent border-2 border-[#ff7b7b] rounded-xl px-4 py-2 hover:bg-[#ff7b7b] hover:text-white transition-colors duration-200"
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