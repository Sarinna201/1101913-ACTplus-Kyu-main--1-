'use client';

import { useState } from 'react';

type GenerateTranscriptModalProps = {
  onClose: () => void;
  onSuccess: (transcriptCode: string) => void;
};

export default function GenerateTranscriptModal({ onClose, onSuccess }: GenerateTranscriptModalProps) {
  const [purpose, setPurpose] = useState('');
  const [validDays, setValidDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/v0/transcripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: purpose || null,
          validDays: validDays || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Transcript generated successfully!');
        onSuccess(data.transcript.code);
        onClose();
      } else {
        alert(data.error || 'Failed to generate transcript');
      }
    } catch (error) {
      console.error('Error generating transcript:', error);
      alert('Failed to generate transcript');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="bg-orange-500 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Generate Transcript</h2>
              <p className="text-orange-100 text-sm mt-1">
                Create your extra curricular transcript
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-gray-800">
                <p className="font-semibold mb-1">What's included:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All completed courses and grades</li>
                  <li>All participated activities</li>
                  <li>Skills and achievements</li>
                  <li>Volunteer hours summary</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose (Optional)
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
            >
              <option value="">Select purpose...</option>
              <option value="job_application">Job Application</option>
              <option value="scholarship">Scholarship Application</option>
              <option value="student_loan">Student Loan (กยศ)</option>
              <option value="university_application">University Application</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Valid Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid Period
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[null, 30, 90, 180].map((days) => (
                <button
                  key={days ?? 'permanent'}
                  onClick={() => setValidDays(days)}
                  className={`px-4 py-3 border-2 rounded-lg font-medium transition ${
                    validDays === days
                      ? 'border-orange-500 bg-orange-50 text-orange-900'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="text-sm">
                    {days === null ? 'Permanent' : `${days} Days`}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {days === null ? 'No expiry' : days === 30 ? 'Temporary' : days === 90 ? '3 months' : '6 months'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-gray-800">
                <p className="font-semibold mb-1">Note:</p>
                <p>
                  The transcript will contain all your data as of today.
                  Any future updates won't be reflected in this transcript.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
