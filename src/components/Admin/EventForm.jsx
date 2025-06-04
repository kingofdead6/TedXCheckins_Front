import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../api';

function EventForm() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/events`,
        { title, date, description },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTitle('');
      setDate('');
      setDescription('');
      setError('');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add Event</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event Title"
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
        >
          Create Event
        </button>
      </div>
    </div>
  );
}

export default EventForm;