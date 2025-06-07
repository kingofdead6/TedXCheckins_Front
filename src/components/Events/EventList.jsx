import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import EventCard from './EventCard';
import { API_BASE_URL } from '../../../api';
import debounce from 'lodash.debounce';

function EventList() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [error, setError] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  const clearDateFilter = () => {
    setDateFilter('');
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view events');
          return;
        }
        const res = await axios.get(`${API_BASE_URL}/api/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API Response:', res.data);
        setEvents(res.data);
        setFilteredEvents(res.data);
      } catch (err) {
        console.error('Fetch events error:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          setError('Unauthorized: Please log in again');
        } else {
          setError('Failed to fetch events');
        }
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    let result = events;

    if (searchQuery.trim()) {
      result = result.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (timeFilter !== 'all') {
      result = result.filter((event) => {
        const eventDate = new Date(event.date);
        if (isNaN(eventDate.getTime())) {
          console.error('Invalid date:', event.date);
          return false;
        }
        const eventDayStart = new Date(eventDate);
        eventDayStart.setHours(0, 0, 0, 0);

        switch (timeFilter) {
          case 'past':
            return eventDate < today;
          case 'upcoming':
            return eventDate > today;
          case 'today':
            return eventDayStart.getTime() === today.getTime();
          default:
            return true;
        }
      });
    }

    if (dateFilter) {
      const selectedDate = new Date(dateFilter);
      selectedDate.setHours(0, 0, 0, 0);
      
      result = result.filter((event) => {
        const eventDate = new Date(event.date);
        if (isNaN(eventDate.getTime())) {
          console.error('Invalid date:', event.date);
          return false;
        }
        const eventDayStart = new Date(eventDate);
        eventDayStart.setHours(0, 0, 0, 0);
        
        return eventDayStart.getTime() === selectedDate.getTime();
      });
    }

    setFilteredEvents(result);
  }, [searchQuery, timeFilter, dateFilter, events]);

  const handleSearch = (e) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-red-50 p-4 sm:p-6">
      <motion.div
        className="container mx-auto max-w-5xl bg-white bg-opacity-95 rounded-3xl border border-red-100 p-6 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-[#d20000]"
          variants={elementVariants}
        >
          TEDx Events
        </motion.h2>
        {error && (
          <motion.p
            className="text-red-900 text-center mb-4 text-sm sm:text-base"
            variants={elementVariants}
          >
            {error}
          </motion.p>
        )}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-6"
          variants={elementVariants}
        >
          <form key="search-form" onSubmit={handleSearch} className="flex flex-1 gap-2">
            <input
              type="text"
              onChange={handleSearchChange}
              placeholder="Search events by title..."
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-[#ff7b7b] transition duration-300 text-sm sm:text-base"
            />
            <motion.button
              type="submit"
              className="bg-[#d20000] cursor-pointer text-white px-4 py-3 rounded-xl font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!searchQuery.trim()}
              variants={buttonVariants}
              whileHover={searchQuery.trim() ? 'hover' : {}}
            >
              Search
            </motion.button>
          </form>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="cursor-pointer p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-[#ff7b7b] transition duration-300 text-sm sm:text-base"
          >
            <option value="all" >All Events</option>
            <option value="past">Past Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="today">Today's Events</option>
          </select>
        </motion.div>
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mb-6 items-center"
          variants={elementVariants}
        >
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="dateFilter" className="text-sm font-medium text-gray-700">
              Filter by date:
            </label>
            <input
              type="date"
              id="dateFilter"
              value={dateFilter}
              onChange={handleDateFilterChange}
              className="cursor-pointer p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-[#ff7b7b] transition duration-300"
            />
            {dateFilter && (
              <motion.button
                onClick={clearDateFilter}
                className="text-[#d20000] hover:text-[#a00000] text-sm font-medium"
                variants={buttonVariants}
                whileHover="hover"
              >
                Clear
              </motion.button>
            )}
          </div>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="visible"
        >
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <motion.div key={event._id} variants={elementVariants}>
                <EventCard event={event} />
              </motion.div>
            ))
          ) : (
            <motion.p
              className="text-gray-600 text-center col-span-full text-sm sm:text-base"
              variants={elementVariants}
            >
              No events found.
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default EventList;