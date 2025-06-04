import { useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';

function QRScanner({ onScan }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => onScan(result.data),
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
  }, [onScan]);

  return (
    <div className="w-full max-w-md mx-auto">
      <video ref={videoRef} className="w-full rounded-lg shadow-lg" />
    </div>
  );
}

export default QRScanner;