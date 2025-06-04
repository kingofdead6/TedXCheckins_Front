import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../api';

function Statistics() {
  const [stats, setStats] = useState({ totalUsers: 0, totalEvents: 0, eventStats: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/statistics`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setStats(res.data);
      } catch (err) {
        setError('Failed to fetch statistics');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Statistics</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="space-y-4">
        <p><strong>Total Users:</strong> {stats.totalUsers}</p>
        <p><strong>Total Events:</strong> {stats.totalEvents}</p>
        <h3 className="text-xl font-bold">Event Statistics</h3>
        {stats.eventStats.map((event) => (
          <div key={event._id} className="p-4 bg-white rounded shadow">
            <p><strong>{event.title}</strong></p>
            <p>Total Attendees: {event.totalAttendees}</p>
            <p>Registered Attendees: {event.registeredAttendees}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Statistics;