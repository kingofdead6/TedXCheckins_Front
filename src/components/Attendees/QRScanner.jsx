import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import QrScanner from 'qr-scanner';
import { API_BASE_URL } from '../../../api';
import { motion, AnimatePresence } from 'framer-motion';

function QRScanner() {
  const { eventId } = useParams();
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  // Initialize QR Scanner
  useEffect(() => {
    if (videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      scannerRef.current.start();

      return () => {
        if (scannerRef.current) {
          scannerRef.current.stop();
          scannerRef.current.destroy();
          scannerRef.current = null;
        }
      };
    }
  }, []);

  const handleScan = async (result) => {
    if (!result || isLoading) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/attendees/validate`,
        { qrCodeData: result },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      const { valid, message, attendee } = response.data;
      // Customize message for already registered case
      if (valid && attendee && attendee.status === 'checked-in') {
        setScanResult({
          valid: true,
          alreadyRegistered: true,
          message: 'You are already registered',
          attendee,
        });
      } else if (valid) {
        setScanResult({
          valid: true,
          alreadyRegistered: false,
          message: 'You got registered successfully',
          attendee,
        });
      } else {
        setScanResult({ valid: false, message });
      }
    } catch (err) {
      setScanResult({
        valid: false,
        message: err.response?.data?.message || 'Error validating QR code',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closePopup = () => {
    setScanResult(null);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <motion.div
        className="container mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with TEDx red accent */}
        <div className="bg-red-600 p-4 text-white">
          <div className="flex justify-between items-center">
            <motion.h2
              className="text-2xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              QR Code Scanner
            </motion.h2>
            <Link
              to={`/events/${eventId}/attendees`}
              className="flex items-center bg-white text-red-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              View Attendees
            </Link>
          </div>
        </div>

        <div className="p-6">
          {/* Scanner section */}
          <motion.div
            className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4 text-gray-800">Scan Attendee QR Code</h3>

            <div className="relative aspect-square max-w-md mx-auto">
              <div className="w-full h-full">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover rounded-md shadow-lg"
                />
              </div>

              {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                </div>
              )}
            </div>

            <div className="mt-4 text-center text-gray-500">
              <p>Point your camera at a QR code to scan it</p>
            </div>
          </motion.div>

          {/* Instructions section */}
          <motion.div
            className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-bold text-blue-800 mb-2 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              How to use the scanner
            </h3>
            <ul className="list-disc pl-5 text-blue-700 space-y-1">
              <li>Ensure the QR code is clearly visible in the frame</li>
              <li>Hold steady for a few seconds to allow scanning</li>
              <li>Good lighting conditions improve scanning accuracy</li>
            </ul>
          </motion.div>
        </div>

        {/* Scan result modal */}
        <AnimatePresence>
          {scanResult && (
            <motion.div
              className="fixed inset-0 bg-[#0000004e] backdrop-blur-md flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={`p-6 rounded-xl shadow-2xl max-w-md w-full ${
                  scanResult.valid && !scanResult.alreadyRegistered
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                } border-2 relative`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex items-start mb-4">
                  <div
                    className={`p-2 rounded-full ${
                      scanResult.valid && !scanResult.alreadyRegistered
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {scanResult.valid && !scanResult.alreadyRegistered ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3
                      className={`text-lg font-bold ${
                        scanResult.valid && !scanResult.alreadyRegistered
                          ? 'text-green-800'
                          : 'text-red-800'
                      }`}
                    >
                      {scanResult.valid && !scanResult.alreadyRegistered
                        ? 'Registration Successful'
                        : scanResult.valid
                        ? 'Already Registered'
                        : 'Already Registered'}
                    </h3>
                    <p
                      className={`text-sm ${
                        scanResult.valid && !scanResult.alreadyRegistered
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {scanResult.message}
                    </p>
                  </div>
                </div>

                {scanResult.valid && scanResult.attendee && (
                  <div className="mt-4 space-y-2">
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        ATTENDEE DETAILS
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(scanResult.attendee.data).map(
                          ([key, value]) => (
                            <div key={key} className="col-span-1">
                              <p className="text-xs font-medium text-gray-500 capitalize">
                                {key}
                              </p>
                              <p className="text-sm font-medium">{value || 'N/A'}</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Status</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            scanResult.attendee.status === 'checked-in'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {scanResult.attendee.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          Validation Time
                        </p>
                        <p className="text-sm">
                          {scanResult.attendee.validationTime
                            ? new Date(
                                scanResult.attendee.validationTime
                              ).toLocaleTimeString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <motion.button
                    onClick={closePopup}
                    className="cursor-pointer px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default QRScanner;