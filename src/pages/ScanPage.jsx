import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRScanner from '../components/Attendees/QRScanner';
import axios from 'axios';
import { API_BASE_URL } from '../../api';

function ScanPage() {
  const { eventId } = useParams();
  const [scanResult, setScanResult] = useState(null);

  const handleScan = async (result) => {
    if (!result) return;
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/attendees/validate`,
        { qrCodeData: result },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setScanResult(response.data);
    } catch (err) {
      setScanResult({
        valid: false,
        message: err.response?.data?.message || 'Error validating QR code',
      });
    }
  };

  const closePopup = () => {
    setScanResult(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Scan QR Codes</h2>
      <div className="mb-4">
        <Link
          to={`/events/${eventId}/attendees`}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          View Attendees
        </Link>
      </div>
      <QRScanner onScan={handleScan} />
      {scanResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg shadow-lg max-w-sm w-full ${
              scanResult.valid ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            <h3 className="text-xl font-bold mb-2">
              {scanResult.valid ? 'Valid QR Code' : 'Invalid QR Code'}
            </h3>
            <p>{scanResult.message}</p>
            {scanResult.valid && (
              <div className="mt-2">
                {Object.entries(scanResult.attendee.data).map(([key, value]) => (
                  <p key={key}>
                    <strong className="capitalize">{key}:</strong> {value || 'N/A'}
                  </p>
                ))}
                <p>
                  <strong>Status:</strong> {scanResult.attendee.status}
                </p>
                <p>
                  <strong>Validation Time:</strong>{' '}
                  {scanResult.attendee.validationTime
                    ? new Date(scanResult.attendee.validationTime).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            )}
            <button
              onClick={closePopup}
              className="mt-4 bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanPage;