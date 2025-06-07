import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../api';
import EventCard from '../../components/Events/EventCard';
import { FiTrash2, FiPlus, FiSearch, FiX } from 'react-icons/fi';

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({ id: null, title: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [dateFilterType, setDateFilterType] = useState('single');
  const [dateFilter, setDateFilter] = useState({ singleDate: '', startDate: '', endDate: '' });
  const modalRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  const fetchEvents = async (isRetry = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEvents(response.data);
      setFilteredEvents(response.data);
      setError('');
      setFetchFailed(false);
    } catch (err) {
      console.error('Fetch events error:', err.response?.data || err.message);
      if (!isRetry) {
        retryTimeoutRef.current = setTimeout(() => fetchEvents(true), 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch events');
        setFetchFailed(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  // Filter events based on search, state, and date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // e.g., '2025-06-07'
    const filtered = events.filter((event) => {
      // Search filter
      const nameMatch = event.title?.toLowerCase().includes(searchTerm.toLowerCase());

      // State filter
      let stateMatch = true;
      if (stateFilter !== 'all') {
        const eventDate = event.date.split('T')[0]; // Normalize to YYYY-MM-DD
        if (stateFilter === 'today') stateMatch = eventDate === today;
        else if (stateFilter === 'upcoming') stateMatch = eventDate > today;
        else if (stateFilter === 'finished') stateMatch = eventDate < today;
      }

      // Date filter
      let dateMatch = true;
      if (dateFilterType === 'single' && dateFilter.singleDate) {
        dateMatch = event.date.split('T')[0] === dateFilter.singleDate;
      } else if (dateFilterType === 'range' && (dateFilter.startDate || dateFilter.endDate)) {
        const eventDate = event.date.split('T')[0];
        const start = dateFilter.startDate || '0000-01-01';
        const end = dateFilter.endDate || '9999-12-31';
        dateMatch = eventDate >= start && eventDate <= end;
      }

      return nameMatch && stateMatch && dateMatch;
    });
    setFilteredEvents(filtered);
  }, [events, searchTerm, stateFilter, dateFilter, dateFilterType]);

  const handleAddEvent = async (newEvent) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/events`,
        newEvent,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setEvents([...events, response.data]);
      setSuccess('Event created successfully');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
      return true;
    } catch (err) {
      console.error('Create event error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create event');
      return false;
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${selectedEvent.id}`);
      setEvents(events.filter((event) => event._id !== selectedEvent.id));
      setSuccess('Event deleted successfully');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Delete event error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to delete event');
      setSuccess('');
      setTimeout(() => setSuccess(''), 5000);
      setShowDeleteModal(false);
    }
  };

  const openDeleteModal = (eventId, eventTitle) => {
    setSelectedEvent({ id: eventId, title: eventTitle || 'unknown' });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedEvent({ idITALY: null, title: '' });
  };

  const openCreateModal = () => setShowCreateModal(true);
  const closeCreateModal = () => setShowCreateModal(false);

  // Handle Escape key and click outside
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      if (showDeleteModal) closeDeleteModal();
      if (showCreateModal) closeCreateModal();
    }
  }, [showDeleteModal, showCreateModal]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeDeleteModal();
      closeCreateModal();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Filtering handled by useEffect
  };

  const clearSearch = () => setSearchTerm('');

  const clearDateFilter = () => {
    setDateFilter({ singleDate: '', startDate: '', endDate: '' });
  };

  // Event Form Modal
  function EventFormModal({ onAddEvent, onClose }) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [formError, setFormError] = useState('');

    const isFormValid = title.trim() !== '' && date !== '';

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!isFormValid) {
        setFormError('Title and date are required');
        return;
      }
      const newEvent = { title, date, description };
      const success = await onAddEvent(newEvent);
      if (success) {
        setTitle('');
        setDate('');
        setDescription('');
        setFormError('');
        onClose();
      } else {
        setFormError('Failed to create event');
      }
    };

    return (
      <motion.div
        className="fixed inset-0 bg-[#00000056] backdrop-blur-lg flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClickOutside}
        role="dialog"
        aria-labelledby="create-modal-title"
      >
        <motion.div
          ref={modalRef}
          className="w-full max-w-sm sm:max-w-lg bg-white bg-opacity-95 rounded-3xl border border-red-100 p-6 sm:p-8"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <h3
            id="create-modal-title"
            className="text-xl sm:text-2xl font-bold text-[#d20000] mb-4 text-center"
          >
            Create New Event
          </h3>
          {formError && (
            <div
              className="mb-4 p-3 bg-red-50 text-red-900 rounded-lg border border-red-200 text-sm sm:text-base text-center"
            >
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
                Event Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-[#ff7b7b] transition duration-300"
                required
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-1">
                Event Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-[#ff7b7b] transition duration-300"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter event description"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-[#ff7b7b] transition duration-300 resize-vertical min-h-[100px]"
              />
            </div>
            <div className="flex gap-3">
              <motion.button
                type="submit"
                className="cursor-pointer flex-1 bg-[#d20000] text-white p-3 rounded-xl font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isFormValid}
                variants={buttonVariants}
                whileHover={isFormValid ? 'hover' : {}}
                whileTap={isFormValid ? { scale: 0.95 } : {}}
                aria-label="Create event"
              >
                Create Event
              </motion.button>
              <motion.button
                type="button"
                onClick={onClose}
                className="cursor-pointer flex-1 bg-gray-200 text-gray-800 p-3 rounded-xl font-semibold hover:bg-gray-300 transition duration-300"
                variants={buttonVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
                aria-label="Cancel event creation"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  }

  // Animation variants
  const cardVariants = {
    initial: { scale: 1, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    hover: { 
      scale: 1.05, 
      boxShadow: '0 10px 20px rgba(210, 0, 0, 0.3)',
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

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

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen mt-10 p-4 sm:p-6">
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
            Manage Events
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

          {/* Create Event Button */}
          <motion.div className="mb-4" variants={elementVariants}>
            <motion.button
              onClick={openCreateModal}
              className="cursor-pointer flex items-center px-6 py-3 bg-[#d20000] text-white rounded-xl font-semibold transition duration-300"
              variants={buttonVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              aria-label="Open create event form"
            >
              <FiPlus className="mr-2" />
              Create Event
            </motion.button>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            className="sticky top-0 z-10 bg-white bg-opacity-95 rounded-xl border border-red-100 p-4 mb-6 flex flex-col sm:flex-row gap-4 sm:items-end"
            variants={elementVariants}
          >
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <label htmlFor="search" className="sr-only">Search by event name</label>
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
            </div>

            {/* State Filter */}
            <div className="w-full sm:w-48">
              <label htmlFor="stateFilter" className="block text-sm font-semibold text-gray-700 mb-1">
                Event Status
              </label>
              <select
                id="stateFilter"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="cursor-pointer w-full p-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-[#ff7b7b] transition duration-300 text-sm sm:text-base"
                aria-label="Filter by event status"
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="finished">Finished</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date Filter</label>
              <div className="flex gap-2 mb-2">
                <label className="cursor-pointer flex items-center text-sm text-gray-700">
                  <input
                    type="radio"
                    value="single"
                    checked={dateFilterType === 'single'}
                    onChange={() => setDateFilterType('single')}
                    className="mr-1 focus:ring-[#ff7b7b]"
                    aria-label="Filter by single date"
                  />
                  Single
                </label>
                <label className="cursor-pointer flex items-center text-sm text-gray-700">
                  <input
                    type="radio"
                    value="range"
                    checked={dateFilterType === 'range'}
                    onChange={() => setDateFilterType('range')}
                    className="mr-1 focus:ring-[#ff7b7b]"
                    aria-label="Filter by date range"
                  />
                  Range
                </label>
              </div>
              {dateFilterType === 'single' ? (
                <div className="relative">
                  <input
                    type="date"
                    value={dateFilter.singleDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, singleDate: e.target.value })}
                    className="cursor-pointer w-full sm:w-48 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-[#ff7b7b] transition duration-300 text-sm sm:text-base"
                    aria-label="Select event date"
                  />
                  {dateFilter.singleDate && (
                    <button
                      type="button"
                      onClick={clearDateFilter}
                      className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center"
                      aria-label="Clear date filter"
                    >
                      <FiX className="text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                    placeholder="Start Date"
                    className="w-full sm:w-48 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-[#ff7b7b] transition duration-300 text-sm sm:text-base"
                    aria-label="Select start date"
                  />
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                    placeholder="End Date"
                    className="cursor-pointer w-full sm:w-48 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-[#ff7b7b] transition duration-300 text-sm sm:text-base"
                    aria-label="Select end date"
                  />
                  {(dateFilter.startDate || dateFilter.endDate) && (
                    <button
                      type="button"
                      onClick={clearDateFilter}
                      className="cursor-pointer flex items-center px-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition duration-300"
                      aria-label="Clear date range filter"
                    >
                      <FiX className="text-gray-600" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <motion.div 
              className="text-center py-12"
              variants={elementVariants}
            >
              <div className="inline-block w-8 h-8 border-4 border-t-[#d20000] border-gray-200 rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-700 text-sm sm:text-base">Loading events...</p>
            </motion.div>
          )}

          {/* Fetch Failed State */}
          {!isLoading && fetchFailed && (
            <motion.div 
              className="text-center py-12"
              variants={elementVariants}
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-700">Unable to load events</h3>
              <p className="mt-1 text-gray-500 text-sm sm:text-base">Please check your connection or try again.</p>
              <motion.button
                onClick={() => fetchEvents()}
                className="mt-4 px-6 py-2 bg-[#d20000] text-white rounded-xl font-semibold transition duration-300"
                variants={buttonVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                Retry
              </motion.button>
            </motion.div>
          )}

          {/* Events Grid */}
          {!isLoading && !fetchFailed && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              variants={{
                visible: { transition: { staggerChildren: 0.2 } }
              }}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event._id}
                    className="relative"
                    variants={elementVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  >
                    <EventCard event={event} />
                    <motion.button
                      onClick={() => openDeleteModal(event._id, event.title)}
                      className="cursor-pointer absolute top-5 right-2 flex items-center text-[#d20000] hover:text-red-800 transition-colors bg-white bg-opacity-80 rounded-full p-2 shadow-sm"
                      aria-label={`Delete event ${event.title || 'unknown'}`}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* No Events Message */}
          {!isLoading && !fetchFailed && filteredEvents.length === 0 && (
            <motion.div 
              className="mt-8 text-center py-12"
              variants={elementVariants}
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium">
                {searchTerm || stateFilter !== 'all' || dateFilter.singleDate || dateFilter.startDate || dateFilter.endDate
                  ? 'No matching events found'
                  : 'No events found'}
              </h3>
              <p className="mt-1">
                {searchTerm || stateFilter !== 'all' || dateFilter.singleDate || dateFilter.startDate || dateFilter.endDate
                  ? 'Try adjusting your filters'
                  : 'Create an event using the button above'}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 bg-[#0000005a] backdrop-blur-lg flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClickOutside}
            role="dialog"
            aria-labelledby="delete-modal-title"
          >
            <motion.div
              ref={modalRef}
              className="w-full max-w-sm sm:max-w-md bg-white bg-opacity-95 rounded-3xl border border-red-100 p-6 sm:p-8"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <h3
                id="delete-modal-title"
                className="text-xl sm:text-2xl font-bold text-[#d20000] mb-4 text-center"
              >
                Confirm Deletion
              </h3>
              <p className="text-gray-700 text-sm sm:text-base mb-6 text-center">
                Are you sure you want to delete {selectedEvent.title}?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={handleDelete}
                  className="cursor-pointer flex-1 bg-[#d20000] text-white p-3 rounded-xl font-semibold hover:bg-red-800 transition duration-300"
                  aria-label="Confirm delete event"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                >
                  Confirm
                </motion.button>
                <motion.button
                  onClick={closeDeleteModal}
                  className="cursor-pointer flex-1 bg-gray-200 text-gray-800 p-3 rounded-xl font-semibold hover:bg-gray-300 transition duration-300"
                  aria-label="Cancel delete event"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <EventFormModal onAddEvent={handleAddEvent} onClose={closeCreateModal} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default EventsPage;