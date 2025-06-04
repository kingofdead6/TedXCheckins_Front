import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../api';

function ExcelUpload({ eventId }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) return setError('Please select a file');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(
        `${API_BASE_URL}/api/events/${eventId}/attendees/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setError('');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Upload Excel
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}

export default ExcelUpload;