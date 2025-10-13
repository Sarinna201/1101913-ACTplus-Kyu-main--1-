// components/CertificateNotification.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type CertificateNotificationProps = {
  certificate: any;
  onClose: () => void;
};

export default function CertificateNotification({ 
  certificate, 
  onClose 
}: CertificateNotificationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onClose();
    }, 10000); // ปิดอัตโนมัติหลัง 10 วินาที

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-xl shadow-2xl p-6 max-w-md border-2 border-yellow-300">
        <div className="flex items-start gap-4">
          <div className="text-5xl animate-bounce">🎉</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">
              Congratulations! 🏆
            </h3>
            <p className="text-yellow-50 mb-4">
              You've earned a certificate for completing this course!
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={`/courses/${certificate.course_id}/certificate`}
                className="px-4 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-yellow-50 transition text-sm"
              >
                View Certificate
              </Link>
              <button
                onClick={() => {
                  setShow(false);
                  onClose();
                }}
                className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              setShow(false);
              onClose();
            }}
            className="text-white hover:text-yellow-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}