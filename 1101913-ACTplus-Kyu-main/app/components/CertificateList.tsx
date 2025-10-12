// components/CertificateList.tsx
'use client';

import Link from 'next/link';

type Certificate = {
  id: number;
  certificate_code: string;
  course_title: string;
  course_id: number;
  grade: string;
  score: number;
  issued_at: string;
  completion_date: string;
  instructor_name: string;
};

type CertificateListProps = {
  certificates: Certificate[];
};

export default function CertificateList({ certificates }: CertificateListProps) {
  if (certificates.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-6xl mb-4">📜</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
        <p className="text-gray-500 mb-6">Complete courses to earn certificates</p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificates.map((cert) => (
        <Link
          key={cert.id}
          href={`/courses/${cert.course_id}/certificate`}
          className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-yellow-400 transition-all"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 p-6 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="text-5xl">🏆</div>
              <div className="bg-white text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                {cert.grade}
              </div>
            </div>
            <div className="text-white font-mono text-sm">
              {cert.certificate_code}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-yellow-600 transition">
              {cert.course_title}
            </h3>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {new Date(cert.issued_at).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {cert.instructor_name}
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Final Score</span>
              <span className="text-lg font-bold text-green-600">{cert.score}%</span>
            </div>

            {/* View button */}
            <div className="mt-4 flex items-center justify-between text-indigo-600 font-medium text-sm group-hover:text-yellow-600 transition">
              <span>View Certificate</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}