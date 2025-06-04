import { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from './EventCard';
import { API_BASE_URL } from '../../../api';

function EventList() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/events`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setEvents(res.data);
      } catch (err) {
        setError('Failed to fetch events');
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Events</h2>
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}

export default EventList;