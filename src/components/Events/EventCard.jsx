import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function EventCard({ event }) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine event state
  const getEventState = () => {
    const today = new Date('2025-06-07'); // Current date per context
    const eventDateOnly = new Date(event.date.split('T')[0]); // Normalize to YYYY-MM-DD
    today.setHours(0, 0, 0, 0); // Reset time for comparison
    eventDateOnly.setHours(0, 0, 0, 0);

    if (eventDateOnly.getTime() === today.getTime()) return 'Today';
    if (eventDateOnly > today) return 'Upcoming';
    return 'Finished';
  };

  const eventState = getEventState();

  // Badge styles based on state
  const badgeStyles = {
    Today: 'bg-yellow-100 text-yellow-800',
    Upcoming: 'bg-green-100 text-green-800',
    Finished: 'bg-gray-100 text-gray-800',
  };

  // Debugging CheckinsResponsible
  console.log('Event data in EventCard:', event);

  return (
    <motion.div
      className="relative overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      {/* TEDx red accent bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>

      <div className="p-6 flex flex-col flex-grow">
        {/* Event State Badge */}
        <motion.span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeStyles[eventState]} mb-3`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          aria-label={`Event status: ${eventState}`}
        >
          {eventState}
        </motion.span>

        {/* Event Date & Time */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{formattedDate} • {formattedTime}</span>
        </div>

        {/* Event Location */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{event.location || 'Location not specified'}</span>
        </div>

        {/* Check-in Responsible */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>
            {event.CheckinsResponsible && Array.isArray(event.CheckinsResponsible) && event.CheckinsResponsible.length > 0
              ? event.CheckinsResponsible.join(', ')
              : 'No responsible assigned'}
          </span>
        </div>

        {/* Event Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-3">{event.title}</h3>

        {/* Event Description (truncated) */}
        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{event.description}</p>

        {/* View Attendees Button */}
        <div className="mt-auto">
          <Link
            to={`/events/${event._id}/attendees`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            View Attendees
            <svg
              className="ml-2 -mr-1 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default EventCard;