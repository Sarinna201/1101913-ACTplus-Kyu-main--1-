// app/verify-transcript/[code]/page.tsx
'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VerifyTranscriptPage() {
    const params = useParams();
    const [transcript, setTranscript] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [valid, setValid] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        verifyTranscript();
    }, [params.code]);

    const verifyTranscript = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/v0/transcripts/${params.code}`);
            const data = await res.json();

            if (data.success) {
                setTranscript(data.transcript);
                setValid(true);
            } else {
                setError('Transcript not found');
                setValid(false);
            }
        } catch (err) {
            console.error('Error verifying transcript:', err);
            setError('Failed to verify transcript');
            setValid(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying transcript...</p>
                </div>
            </div>
        );
    }

    if (!valid || !transcript) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Transcript</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const isExpired = transcript.isExpired;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Success Banner */}
                <div className={`rounded-xl shadow-lg p-8 text-white mb-8 ${isExpired
                        ? 'bg-gradient-to-r from-red-500 to-orange-600'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600'
                    }`}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                            {isExpired ? (
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {isExpired ? '⚠️ Expired Transcript' : '✓ Valid Transcript'}
                            </h1>
                            <p className={isExpired ? 'text-red-100' : 'text-green-100'}>
                                {isExpired
                                    ? 'This transcript has expired and may not reflect current information'
                                    : 'This transcript has been verified and is authentic'
                                }
                            </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transcript Details */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">Transcript Information</h2>
                        <p className="text-indigo-100">Issued by ACTPlus Learning Platform</p>
                    </div>

                    {/* Details */}
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Transcript ID */}
                            <div>
                                <label className="text-sm font-medium text-gray-500 mb-2 block">Transcript ID</label>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <span className="font-mono font-semibold text-gray-900">{transcript.transcript_code}</span>
                                </div>
                            </div>

                            {/* Student Name */}
                            <div>
                                <label className="text-sm font-medium text-gray-500 mb-2 block">Student Name</label>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <span className="font-semibold text-gray-900">{transcript.users.username}</span>
                                </div>
                            </div>

                            {/* Generated Date */}
                            <div>
                                <label className="text-sm font-medium text-gray-500 mb-2 block">Generated Date</label>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <span className="font-semibold text-gray-900">
                                        {new Date(transcript.generated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Valid Until */}
                            {transcript.valid_until && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Valid Until</label>
                                    <div className={`rounded-lg p-4 border ${isExpired
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-green-50 border-green-200'
                                        }`}>
                                        <span className={`font-semibold ${isExpired ? 'text-red-900' : 'text-green-900'
                                            }`}>
                                            {new Date(transcript.valid_until).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                            {isExpired && ' (EXPIRED)'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Summary Stats */}
                        <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-indigo-900">{transcript.total_courses}</div>
                                    <div className="text-xs text-indigo-600 mt-1">Courses</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-900">{transcript.completed_courses}</div>
                                    <div className="text-xs text-green-600 mt-1">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-900">{transcript.total_activities}</div>
                                    <div className="text-xs text-purple-600 mt-1">Activities</div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-orange-900">{transcript.total_volunteer_hours}</div>
                                        <div className="text-xs text-orange-600 mt-1">Hours</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-pink-900">{transcript.total_skills}</div>
                                        <div className="text-xs text-pink-600 mt-1">Skills</div>
                                    </div>
                                </div>
                            </div>
                            {/* Purpose */}
                            {transcript.purpose && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500 mb-2 block">Purpose</label>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <span className="font-semibold text-gray-900">
                                            {transcript.purpose === 'job_application' && 'Job Application'}
                                            {transcript.purpose === 'scholarship' && 'Scholarship Application'}
                                            {transcript.purpose === 'student_loan' && 'Student Loan (กยศ)'}
                                            {transcript.purpose === 'university_application' && 'University Application'}
                                            {transcript.purpose === 'other' && 'Other'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Verification Notice */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-sm text-blue-900">
                                        <p className="font-semibold mb-1">Verification Notice</p>
                                        <p>
                                            This transcript contains a snapshot of the student's achievements at the time of generation.
                                            For the most current information, please contact the student or ACTPlus directly.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* View Full Details Link */}
                            <div className="text-center pt-4">
                                <Link
                                    href={`/transcripts/${transcript.transcript_code}`}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View Full Transcript
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Security & Authenticity
                        </h3>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p>✓ This transcript is cryptographically secured</p>
                            <p>✓ Each transcript has a unique verification code</p>
                            <p>✓ Generated and stored on ACTPlus secure servers</p>
                            <p>✓ Tampering with this transcript is detectable</p>
                        </div>
                    </div>
                </div>
            </div>        
    );
}