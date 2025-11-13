'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CertificateList from '@/app/components/CertificateList';
import Link from 'next/link';

export default function MyCertificatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const certRes = await fetch('/api/v0/users/me/certificates');
      const certData = await certRes.json();
      if (certData.success) {
        setCertificates(certData.certificates);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#ff9800' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f0]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">My Certificates</h1>
          <p className="text-gray-600">
            View and download your course completion certificates
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: '🏆',
              label: 'Total Certificates',
              value: certificates.length
            },
            {
              icon: '📚',
              label: 'Grade A',
              value: certificates.filter(c => c.score >= 90).length
            },
            {
              icon: '⭐',
              label: 'Average Score',
              value:
                certificates.length > 0
                  ? `${Math.round(certificates.reduce((sum, c) => sum + c.score, 0) / certificates.length)}%`
                  : '0%'
            }/*,
            {
              icon: '📄',
              label: 'Grade B+',
              value: certificates.filter(c => c.score >= 80 && c.score <= 90).length
            }*/
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ff980033' }}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-black">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        {certificates.length > 0 && (
          <div
            className="rounded-xl shadow-lg p-6 mb-8 border"
            style={{
              backgroundColor: '#fff3e0', // ส้มอ่อนมาก
              borderColor: '#e65100',     // ขอบส้มเข้ม
            }}
          >
            <div className="flex items-center justify-between flex-col md:flex-row gap-6 md:gap-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ffe0b2] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#e65100]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">Need an official transcript?</h3>
                  <p className="text-gray-700 text-sm">
                    Generate a complete transcript with all your courses, activities, and achievements
                  </p>
                </div>
              </div>
              <Link
                href="/my-transcripts"
                className="px-6 py-3 bg-[#e65100] text-white font-semibold rounded-lg hover:bg-[#d84315] transition shadow-md whitespace-nowrap"
              >
                View Transcripts →
              </Link>
            </div>
          </div>
        )}

        {/* Certificate List */}
        <CertificateList certificates={certificates} />
      </div>
    </div>
  );
}
