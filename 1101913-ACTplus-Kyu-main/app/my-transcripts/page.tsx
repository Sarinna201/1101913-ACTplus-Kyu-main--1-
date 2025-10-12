// app/my-transcripts/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GenerateTranscriptModal from '@/app/components/GenerateTranscriptModal';

export default function MyTranscriptsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchTranscripts();
    }
  }, [status]);

  const fetchTranscripts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v0/transcripts');
      const data = await res.json();

      if (data.success) {
        setTranscripts(data.transcripts);
      }
    } catch (error) {
      console.error('Error fetching transcripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSuccess = (transcriptCode: string) => {
    fetchTranscripts();
    router.push(`/transcripts/${transcriptCode}`);
  };

  const handleDelete = async (transcriptCode: string, e: React.MouseEvent) => {
    e.preventDefault(); // ป้องกันการ navigate

    if (!confirm('Are you sure you want to delete this transcript? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(transcripts.find(t => t.transcript_code === transcriptCode)?.id || null);

      const res = await fetch(`/api/v0/transcripts/${transcriptCode}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        alert('Transcript deleted successfully');
        fetchTranscripts(); // Refresh list
      } else {
        alert(data.error || 'Failed to delete transcript');
      }
    } catch (error) {
      console.error('Error deleting transcript:', error);
      alert('Failed to delete transcript');
    } finally {
      setDeletingId(null);
    }
  };

  const getPurposeLabel = (purpose: string | null) => {
    const labels: Record<string, string> = {
      'job_application': 'Job Application',
      'scholarship': 'Scholarship',
      'student_loan': 'Student Loan (กยศ)',
      'university_application': 'University Application',
      'other': 'Other'
    };
    return purpose ? labels[purpose] || purpose : 'General';
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date() > new Date(validUntil);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/my-certificates"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Certificates
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Transcripts</h1>
          <p className="text-gray-600">
            View and manage your extra curricular transcripts
          </p>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generate New Transcript
          </button>
        </div>

        {/* Transcripts List */}
        {transcripts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Transcripts Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Generate your first extra curricular transcript
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate Transcript
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {transcripts.map((transcript) => {
              const expired = isExpired(transcript.valid_until);
              const isDeleting = deletingId === transcript.id;

              return (
                <div
                  key={transcript.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 hover:shadow-lg hover:border-orange-400 transition"
                >
                  <div className="flex items-start justify-between">
                    {/* Left Content */}
                    <Link
                      href={`/transcripts/${transcript.transcript_code}`}
                      className="flex-1"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center text-white text-xl">
                          📄
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Extra Curricular Transcript
                          </h3>
                          <p className="text-sm text-gray-700">
                            ID: <span className="font-mono">{transcript.transcript_code}</span>
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div className="bg-orange-50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-orange-900">
                            {transcript.total_courses}
                          </div>
                          <div className="text-xs text-orange-600">Courses</div>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="text-2xl font-bold text-gray-900">
                            {transcript.completed_courses}
                          </div>
                          <div className="text-xs text-gray-700">Completed</div>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="text-2xl font-bold text-gray-900">
                            {transcript.total_activities}
                          </div>
                          <div className="text-xs text-gray-700">Activities</div>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="text-2xl font-bold text-gray-900">
                            {transcript.total_volunteer_hours}
                          </div>
                          <div className="text-xs text-gray-700">Hours</div>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="text-2xl font-bold text-gray-900">
                            {transcript.total_skills}
                          </div>
                          <div className="text-xs text-gray-700">Skills</div>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-6 text-sm text-gray-700">
                        {transcript.purpose && (
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Purpose: {getPurposeLabel(transcript.purpose)}
                          </span>
                        )}
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          Generated: {new Date(transcript.generated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>

                    {/* Right Status & Actions */}
                    <div className="flex flex-col items-end gap-3 ml-4">
                      {transcript.valid_until ? (
                        expired ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Valid
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-semibold">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Permanent
                        </span>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(transcript.transcript_code, e)}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-4 py-2 border border-red-400 text-red-700 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-700 border-t-transparent"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <GenerateTranscriptModal
          onClose={() => setShowGenerateModal(false)}
          onSuccess={handleGenerateSuccess}
        />
      )}
    </div>
  );
}
