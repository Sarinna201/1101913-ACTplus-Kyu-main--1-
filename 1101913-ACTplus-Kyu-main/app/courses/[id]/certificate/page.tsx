// app/courses/[id]/certificate/page.tsx
'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import CertificateTemplate from "@/app/components/CertificateTemplate";
import ShareCertificate from '@/app/components/ShareCertificate';

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificate();
  }, [params.id]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v0/courses/${params.id}/certificate`);
      const data = await res.json();

      if (data.success && data.certificate) {
        setCertificate(data.certificate);
      } else {
        setError('Certificate not found');
      }
    } catch (err) {
      console.error('Error fetching certificate:', err);
      setError('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view your certificate</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
          <p className="text-gray-600 mb-6">
            You don't have a certificate for this course yet.
          </p>
          <button
            onClick={() => router.push(`/courses/${params.id}`)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <button
            onClick={() => router.push(`/courses/${params.id}`)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Course
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Certificate</h1>
          <p className="text-gray-600">
            Congratulations on completing the course!
          </p>
        </div>

        {/* Certificate */}
        <div className="flex justify-center">
          <CertificateTemplate
            certificate={certificate}
            studentName={session.user?.username || 'Student'}
          />
        </div>

        {/* Share Section */}
        <div className="mt-8">
          <ShareCertificate certificateCode={certificate.certificate_code} />
        </div>
      </div>
    </div>
  );
}