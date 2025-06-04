import { useState, useEffect } from 'react';
import axios from 'axios';
import EventForm from '../components/Admin/EventForm';
import EventCard from '../components/Events/EventCard';
import { API_BASE_URL } from '../../api';

function AdminEventsPage() {
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

  const handleDelete = async (eventId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEvents(events.filter((event) => event._id !== eventId));
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Events</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <EventForm />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {events.map((event) => (
          <div key={event._id} className="relative">
            <EventCard event={event} />
            <button
              onClick={() => handleDelete(event._id)}
              className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminEventsPage;