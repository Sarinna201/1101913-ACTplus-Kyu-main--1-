// app/transcripts/[code]/page.tsx
'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import TranscriptTemplate from "@/app/components/TranscriptTemplate";
import Link from "next/link";

export default function TranscriptViewPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [transcript, setTranscript] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTranscript();
    }, [params.code]);

    const fetchTranscript = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/v0/transcripts/${params.code}`);
            const data = await res.json();

            if (data.success) {
                setTranscript(data.transcript);
            } else {
                setError('Transcript not found');
            }
        } catch (err) {
            console.error('Error fetching transcript:', err);
            setError('Failed to load transcript');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading transcript...</p>
                </div>
            </div>
        );
    }

    if (error || !transcript) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Transcript Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        {error || "The transcript you're looking for doesn't exist."}
                    </p>
                    <Link
                        href="/my-transcripts"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Back to Transcripts
                    </Link>
                </div>
            </div>
        );
    }

    const isExpired = transcript.isExpired;
    const isOwner = session?.user && (session.user as any).id === transcript.users.id;

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this transcript? This action cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch(`/api/v0/transcripts/${params.code}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (data.success) {
                alert('Transcript deleted successfully');
                router.push('/my-transcripts');
            } else {
                alert(data.error || 'Failed to delete transcript');
            }
        } catch (error) {
            console.error('Error deleting transcript:', error);
            alert('Failed to delete transcript');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/my-transcripts"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Transcripts
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Transcript Details</h1>
                            <p className="text-gray-600">
                                {isOwner ? 'Your extra curricular transcript' : `Transcript for ${transcript.users.username}`}
                            </p>
                        </div>

                        {/* Status Badge */}
                        {transcript.valid_until && (
                            <div>
                                {isExpired ? (
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full font-semibold">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        Expired
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Valid
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Warning if expired */}
                {isExpired && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                        <div className="flex gap-3">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-semibold text-red-900 mb-1">This transcript has expired</p>
                                <p className="text-sm text-red-800">
                                    This transcript expired on {new Date(transcript.valid_until).toLocaleDateString()}.
                                    {isOwner && ' Generate a new transcript to get updated information.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transcript Template */}
                <TranscriptTemplate
                    transcript={transcript}
                    studentName={transcript.users.username}
                />

                {/* Detailed Sections */}
                <div className="mt-12 space-y-8">
                    {/* Courses Section */}
                    {transcript.courses && transcript.courses.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                Courses ({transcript.courses.length})
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Course</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Level</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Progress</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Score</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {transcript.courses.map((course: any) => (
                                            <tr key={course.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-gray-900">{course.title}</div>
                                                    <div className="text-xs text-gray-500">by {course.instructor}</div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-600">
                                                    {course.category || '-'}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                                                            course.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                                                                course.level === 'Advanced' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {course.level || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-indigo-600 h-2 rounded-full"
                                                                style={{ width: `${course.completionPercentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-gray-600 w-12 text-right">
                                                            {course.completionPercentage}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className={`font-semibold ${course.averageScore >= 90 ? 'text-green-600' :
                                                            course.averageScore >= 70 ? 'text-blue-600' :
                                                                'text-yellow-600'
                                                        }`}>
                                                        {course.averageScore}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {course.completed ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            Completed
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                                            In Progress
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Activities Section */}
                    {transcript.activities && transcript.activities.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                Activities ({transcript.activities.length})
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Activity</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Year/Term</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Role</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Hours</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Authority</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Skills</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {transcript.activities.map((activity: any, index: number) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-gray-900">{activity.title}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(activity.dateStart).toLocaleDateString()}
                                                        {activity.dateEnd && ` - ${new Date(activity.dateEnd).toLocaleDateString()}`}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center text-sm text-gray-600">
                                                    {activity.year}/{activity.term}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="inline-flex px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                                                        {activity.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center font-semibold text-gray-900">
                                                    {activity.volunteerHours || 0}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-600">
                                                    {activity.authority}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-wrap gap-1 justify-center">
                                                        {activity.skills?.map((skill: any, idx: number) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs"
                                                            >
                                                                {skill.code}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Skills Section */}
                    {transcript.skills && transcript.skills.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                </div>
                                Skills & Competencies ({transcript.skills.length})
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {transcript.skills.map((skill: any, index: number) => (
                                    <div
                                        key={index}
                                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                                style={{ backgroundColor: skill.color }}
                                            >
                                                {skill.code.substring(0, 2)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-gray-900">{skill.code}</div>
                                                <div className="text-xs text-gray-600">Level {skill.level}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-indigo-600">{skill.totalPoints}</div>
                                                <div className="text-xs text-gray-600">points</div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-700">{skill.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}