import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';
import { API_BASE_URL } from '../../api';

function AttendeesPage() {
  const { eventId } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [columns, setColumns] = useState(['name', 'email']);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/attendees/${eventId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setAttendees(res.data);
        const allColumns = new Set(['name', 'email']);
        res.data.forEach((attendee) => {
          if (attendee.data) {
            Object.keys(attendee.data).forEach((key) => allColumns.add(key));
          }
        });
        setColumns(Array.from(allColumns));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch attendees');
      }
    };
    fetchAttendees();
  }, [eventId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        if (jsonData.length > 0) {
          const newColumns = Object.keys(jsonData[0]);
          setColumns((prev) => {
            const updated = new Set([...prev, ...newColumns]);
            return Array.from(updated);
          });
        }
        handleUpload(selectedFile);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) {
      setError('No file selected');
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/attendees/${eventId}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(res.data.message + (res.data.count ? ` (${res.data.count} attendees)` : ''));
      setError('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      const attendeesRes = await axios.get(`${API_BASE_URL}/api/attendees/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAttendees(attendeesRes.data);
      const allColumns = new Set(columns);
      attendeesRes.data.forEach((attendee) => {
        if (attendee.data) {
          Object.keys(attendee.data).forEach((key) => allColumns.add(key));
        }
      });
      setColumns(Array.from(allColumns));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload attendees');
      setSuccess('');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (isUploading) return;
    fileInputRef.current.click();
  };

  const generateQRCode = async (attendee) => {
    try {
      const qrCodeData = JSON.stringify({ eventId, data: attendee.data });
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
      
      // Create a download link for the QR code
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr_code_${attendee.data.name || 'attendee'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to generate QR code');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Event Attendees</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}
      <div className="mb-4">
        <Link
          to={`/events/${eventId}/scan`}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Scan QR Codes
        </Link>
      </div>
      <div className="mb-4 p-4 bg-white rounded shadow">
        <h3 className="text-xl font-bold mb-2">Upload Attendees</h3>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          className={`bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload Excel File'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className="p-2 border capitalize">
                  {col}
                </th>
              ))}
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Validation Time</th>
              <th className="p-2 border">QR Code</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((attendee) => (
              <tr key={attendee._id}>
                {columns.map((col) => (
                  <td key={col} className="p-2 border">
                    {attendee.data?.[col] || 'N/A'}
                  </td>
                ))}
                <td className="p-2 border">{attendee.status}</td>
                <td className="p-2 border">
                  {attendee.validationTime ? new Date(attendee.validationTime).toLocaleString() : 'N/A'}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => generateQRCode(attendee)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Generate QR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttendeesPage;