import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../api';
import { FiSearch, FiX } from 'react-icons/fi';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function Statistics() {
  const [stats, setStats] = useState({ totalUsers: 0, totalEvents: 0, eventStats: [] });
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/statistics`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setStats(res.data);
        setFilteredEvents(res.data.eventStats);
      } catch (err) {
        setError('Failed to fetch statistics');
      }
    };
    fetchStats();
  }, []);

  // Filter events based on search
  useEffect(() => {
    const filtered = stats.eventStats.filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, stats.eventStats]);

  const openModal = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  // Handle Escape key and click outside
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    },
    [showModal]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Filtering handled by useEffect
  };

  const clearSearch = () => setSearchTerm('');

  // Circular Progress Bar Max Values
  const MAX_USERS = 1000;
  const MAX_EVENTS = 200;

  // Bar Chart Data for All Events
  const barData = {
    labels: stats.eventStats.map((event) => event.title),
    datasets: [
      {
        label: 'Total Attendees',
        data: stats.eventStats.map((event) => event.totalAttendees),
        backgroundColor: '#e62b1e',
      },
      {
        label: 'Registered Attendees',
        data: stats.eventStats.map((event) => event.registeredAttendees),
        backgroundColor: '#ff7b7b',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Event Attendance Overview' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // Event Statistics Modal
  function EventStatsModal({ event }) {
    const doughnutData = {
      labels: ['Registered Attendees', 'Non-Registered Attendees'],
      datasets: [
        {
          data: [event.registeredAttendees, event.totalAttendees - event.registeredAttendees],
          backgroundColor: ['#e62b1e', '#ff7b7b'],
          borderColor: ['white', 'white'],
          borderWidth: 2,
        },
      ],
    };

    const doughnutOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: `${event.title} Attendees` },
      },
    };

    return (
      <motion.div
        className="fixed inset-0 bg-[#00000057] backdrop-blur-lg flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClickOutside}
        role="dialog"
        aria-labelledby="stats-modal-title"
      >
        <motion.div
          ref={modalRef}
          className="w-full max-w-md sm:max-w-lg bg-white bg-opacity-95 rounded-3xl border border-red-100 p-6 sm:p-8"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <h3
            id="stats-modal-title"
            className="text-xl sm:text-2xl font-bold text-[#e62b1e] mb-4 text-center"
          >
            {event.title} Statistics
          </h3>
          <div className="space-y-4">
            <p className="text-gray-700">
              <strong>Total Attendees:</strong> {event.totalAttendees}
            </p>
            <p className="text-gray-700">
              <strong>Registered Attendees:</strong> {event.registeredAttendees}
            </p>
            <div className="w-full max-w-xs mx-auto">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
          <motion.button
            onClick={closeModal}
            className="cursor-pointer mt-6 w-full bg-[#e62b1e] text-white p-3 rounded-xl font-semibold hover:bg-[#c8241a] transition duration-300"
            variants={buttonVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            aria-label="Close statistics modal"
          >
            Close
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Animation variants
  const cardVariants = {
    initial: { scale: 1, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    hover: {
      scale: 1.05,
      boxShadow: '0 10px 20px rgba(230, 43, 30, 0.3)',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const elementVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
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
        <div className="bg-[#e62b1e] p-4 text-white">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Statistics
          </motion.h2>
        </div>

        <div className="p-6 sm:p-8">
          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-50 text-red-900 rounded-lg border border-red-200 text-sm sm:text-base"
              variants={elementVariants}
            >
              {error}
            </motion.div>
          )}

          {/* Circular Progress Indicators */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
            variants={elementVariants}
          >
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Users</h3>
              <div className="w-32 h-32">
                <CircularProgressbar
                  value={(stats.totalUsers / MAX_USERS) * 100}
                  text={`${stats.totalUsers}`}
                  styles={buildStyles({
                    pathColor: '#e62b1e',
                    textColor: '#e62b1e',
                    trailColor: '#f3f4f6',
                  })}
                />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Events</h3>
              <div className="w-32 h-32">
                <CircularProgressbar
                  value={(stats.totalEvents / MAX_EVENTS) * 100}
                  text={`${stats.totalEvents}`}
                  styles={buildStyles({
                    pathColor: '#e62b1e',
                    textColor: '#e62b1e',
                    trailColor: '#f3f4f6',
                  })}
                />
              </div>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div className="mb-6" variants={elementVariants}>
            <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
              <label htmlFor="search" className="sr-only">
                Search events
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                id="search"
                type="text"
                placeholder="Search by event name..."
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-[#ff7b7b] transition duration-300 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search events"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label="Clear search"
                >
                  <FiX className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </form>
          </motion.div>

          {/* Bar Chart for All Events */}
          <motion.div className="mb-8" variants={elementVariants}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Event Attendance Overview</h3>
            <div className="w-full max-w-3xl mx-auto">
              <Bar data={barData} options={barOptions} />
            </div>
          </motion.div>

          {/* Event Statistics List */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredEvents.map((event) => (
                <motion.div
                  key={event._id}
                  className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  variants={elementVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  onClick={() => openModal(event)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View statistics for ${event.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      openModal(event);
                    }
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-[#e62b1e]"></div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h4>
                  <p className="text-gray-600 text-sm">
                    Total Attendees: {event.totalAttendees}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Registered Attendees: {event.registeredAttendees}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* No Events Message */}
          {!filteredEvents.length && !error && (
            <motion.div
              className="mt-8 text-center py-12"
              variants={elementVariants}
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium">
                {searchTerm ? 'No matching events found' : 'No events found'}
              </h3>
              <p className="mt-1">
                {searchTerm ? 'Try adjusting your search' : 'No event statistics available'}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Event Statistics Modal */}
      <AnimatePresence>
        {showModal && selectedEvent && (
          <EventStatsModal event={selectedEvent} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Statistics;