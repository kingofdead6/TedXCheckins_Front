import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';
import { API_BASE_URL } from '../../../api';
import { motion } from 'framer-motion';
import { FiSearch, FiUpload, FiUserCheck, FiUserX, FiUser, FiDownload } from 'react-icons/fi';

function AttendeesTables() {
  const { eventId } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [filteredAttendees, setFilteredAttendees] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [columns, setColumns] = useState(['name', 'email']);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/attendees/${eventId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setAttendees(res.data);
        setFilteredAttendees(res.data);
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

  // Filter attendees by search term
  useEffect(() => {
    const filtered = attendees.filter(attendee => {
      const nameMatch = attendee.data?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = attendee.data?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || emailMatch;
    });
    setFilteredAttendees(filtered);
  }, [searchTerm, attendees]);

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
      setFilteredAttendees(attendeesRes.data);
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

    // Get row background color based on status - UPDATED
  const getRowColor = (status) => {
    switch (status) {
      case 'registered':
        return 'bg-green-50 hover:bg-green-100'; // Green for registered
      case 'pending':
        return 'bg-red-50 hover:bg-red-100'; // Red for pending
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  // Get status icon - UPDATED
  const getStatusIcon = (status) => {
    switch (status) {
      case 'registered':
        return <FiUserCheck className="text-green-500" />;
      case 'pending':
        return <FiUserX className="text-red-500" />;
      default:
        return <FiUser className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <motion.div
        className="container mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with TEDx red accent */}
        <div className="bg-[#e62b1e] p-4 text-white">
          <div className="flex justify-between items-center">
            <motion.h2 
              className="text-2xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Event Attendees
            </motion.h2>
            <Link
              to={`/events/${eventId}/scan`}
              className="flex items-center bg-white text-[#e62b1e] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Scan QR Codes
            </Link>
          </div>
        </div>

        <div className="p-6">
          {/* Status messages */}
          {error && (
            <motion.div 
              className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div 
              className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {success}
            </motion.div>
          )}

          {/* Search and Upload section */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search bar */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e62b1e] focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Upload button */}
            <div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <motion.button
                onClick={triggerFileInput}
                disabled={isUploading}
                className={`flex items-center px-6 py-2 rounded-lg font-medium ${
                  isUploading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-[#e62b1e] text-white hover:bg-[#c8241a] cursor-pointer'
                } transition-colors`}
                whileHover={!isUploading ? { scale: 1.02 } : {}}
                whileTap={!isUploading ? { scale: 0.98 } : {}}
              >
                <FiUpload className="mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Excel'}
              </motion.button>
            </div>
          </div>

          {/* Attendees table */}
          <motion.div
            className="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {columns.map((col) => (
                      <th 
                        key={col} 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validation Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAttendees.map((attendee) => (
                    <tr 
                      key={attendee._id} 
                      className={`${getRowColor(attendee.status)} transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getStatusIcon(attendee.status)}
                          </div>
                          <div className="ml-2">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              attendee.status === 'checked-in' 
                                ? 'bg-green-100 text-green-800' 
                                : attendee.status === 'not-checked-in'
                                ? 'bg-yellow-100 text-yellow-800'
                                : attendee.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {attendee.status}
                            </span>
                          </div>
                        </div>
                      </td>
                      {columns.map((col) => (
                        <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate">
                          {attendee.data?.[col] || 'N/A'}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendee.validationTime ? new Date(attendee.validationTime).toLocaleString() : 'Not checked in'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <motion.button
                          onClick={() => generateQRCode(attendee)}
                          className="flex items-center text-[#e62b1e] hover:text-[#c8241a] transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiDownload className="mr-1" />
                          QR Code
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {filteredAttendees.length === 0 && (
            <motion.div 
              className="mt-8 text-center text-gray-500 py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium">
                {searchTerm ? 'No matching attendees found' : 'No attendees found'}
              </h3>
              <p className="mt-1">
                {searchTerm ? 'Try a different search term' : 'Upload an Excel file to add attendees'}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default AttendeesTables;