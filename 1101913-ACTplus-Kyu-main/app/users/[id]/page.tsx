"use client";

import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import UserSkillsSection from "@/app/components/UserSkillsSection";
import Link from "next/link";

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const { data: session, status } = useSession();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [courseProgress, setCourseProgress] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  // Resolve params
  useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  // Validate and set userId
  useEffect(() => {
    if (status === "loading" || !resolvedParams) return;

    const { id } = resolvedParams;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      console.error("Invalid user ID:", id);
      notFound();
      return;
    }

    if (!session?.user || session.user.id !== parsedId) {
      notFound();
      return;
    }

    setUserId(parsedId);
  }, [resolvedParams, session, status]);

  // Fetch data when userId is ready
  useEffect(() => {
    if (userId === null) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const resEnrollments = await fetch(`/api/v0/users/me/enrollments`, {
          credentials: 'include',
        });

        if (resEnrollments.ok) {
          const dataEnrollments = await resEnrollments.json();

          if (dataEnrollments.success) {
            setEnrollments(dataEnrollments.enrollments || []);

            const progressPromises = dataEnrollments.enrollments.map(async (enrollment: any) => {
              try {
                const progressRes = await fetch(`/api/v0/courses/${enrollment.course.id}/progress`, {
                  credentials: 'include'
                });
                const progressData = await progressRes.json();

                if (progressData.success) {
                  return {
                    courseId: enrollment.course.id,
                    courseTitle: enrollment.course.title,
                    ...progressData.progress
                  };
                }
                return null;
              } catch (err) {
                console.error('Error fetching course progress:', err);
                return null;
              }
            });

            const allProgress = await Promise.all(progressPromises);
            setCourseProgress(allProgress.filter(p => p !== null));
          }
        }
      } catch (err) {
        console.error("Failed to fetch enrollments:", err);
      }

      try {
        const resActivities = await fetch(`/api/v0/users/${userId}/activities`, {
          credentials: 'include'
        });

        if (resActivities.ok) {
          const dataActivities = await resActivities.json();

          if (dataActivities.success) {
            setActivities(dataActivities.activities || []);
          }
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
      }

      try {
        const certRes = await fetch('/api/v0/users/me/certificates', {
          credentials: 'include'
        });
        if (certRes.ok) {
          const certData = await certRes.json();
          if (certData.success) {
            setCertificates(certData.certificates || []);
          }
        }
      } catch (err) {
        console.error('Error fetching certificates:', err);
      }

      setLoading(false);
    };

    fetchData();
  }, [userId]);

  if (loading || !resolvedParams || userId === null) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  const user = session?.user;

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* User Info Header */}
        <div className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 rounded-2xl shadow-2xl p-8 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={user?.imageUrl || "/uploads/images/default.png"}
                alt={user?.username || "User"}
                className="h-28 w-28 rounded-full border-4 border-white shadow-xl object-cover"
              />
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">{user?.username}</h1>
              <p className="text-orange-100 mb-3 text-lg">{user?.email}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {user?.role}
              </div>
            </div>
          </div>
        </div>

        {/* Learning Progress Overview */}
        {enrollments.length > 0 && courseProgress.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Learning Progress</h2>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="text-sm text-orange-700 font-semibold mb-2">Overall Progress</div>
                <div className="text-3xl font-bold text-orange-900">
                  {Math.round(
                    courseProgress.reduce((sum, p) => sum + p.completionPercentage, 0) / courseProgress.length
                  )}%
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="text-sm text-gray-700 font-semibold mb-2">Avg Score</div>
                <div className="text-3xl font-bold text-gray-900">
                  {Math.round(
                    courseProgress.reduce((sum, p) => sum + p.averageScore, 0) / courseProgress.length
                  )}%
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="text-sm text-orange-700 font-semibold mb-2">Completed</div>
                <div className="text-3xl font-bold text-orange-900">
                  {courseProgress.reduce((sum, p) => sum + p.completedModules, 0)}/
                  {courseProgress.reduce((sum, p) => sum + p.totalModules, 0)}
                </div>
                <div className="text-xs text-orange-600 mt-1">modules</div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="text-sm text-gray-700 font-semibold mb-2">Courses</div>
                <div className="text-3xl font-bold text-gray-900">
                  {courseProgress.filter(p => p.completionPercentage === 100).length}/
                  {courseProgress.length}
                </div>
                <div className="text-xs text-gray-600 mt-1">completed</div>
              </div>
            </div>

            {/* Course Progress List */}
            <div className="space-y-4">
              {courseProgress.map((progress) => (
                <div key={progress.courseId} className="border-2 border-gray-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <a href={`/courses/${progress.courseId}`}
                      className="font-semibold text-lg text-gray-900 hover:text-orange-600 transition"
                    >
                      {progress.courseTitle}
                    </a>
                    <span className="text-lg font-bold text-orange-600">
                      {progress.completionPercentage}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div
                      className={`h-3 rounded-full transition-all ${progress.completionPercentage === 100
                        ? 'bg-orange-500'
                        : progress.completionPercentage >= 50
                          ? 'bg-orange-400'
                          : 'bg-gray-400'
                        }`}
                      style={{ width: `${progress.completionPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                      {progress.completedModules}/{progress.totalModules} modules
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Avg: {progress.averageScore}%
                    </span>

                    <a href={`/courses/${progress.courseId}/learn`}
                      className="ml-auto text-orange-600 hover:text-orange-800 font-semibold flex items-center gap-1 transition"
                    >
                      Continue Learning
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">My Skills</h2>
          </div>
          <UserSkillsSection userId={userId} />
        </div>

        {/* Activities Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Participated Activities</h2>
            <span className="ml-auto bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-bold">
              {activities.length}
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-500 text-lg">No activities participated yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider rounded-tl-lg">
                      Activity
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider rounded-tr-lg">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((a) => (
                    <tr key={a.id} className="hover:bg-orange-50 transition-colors">
                      <td className="px-6 py-4">
                        <a
                          href={`/activities/${a.id}`}
                          className="text-orange-600 hover:text-orange-800 font-semibold hover:underline"
                        >
                          {a.title}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        {new Date(a.start_date).toLocaleDateString()} –{" "}
                        {a.end_date ? new Date(a.end_date).toLocaleDateString() : "Ongoing"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Certificates Section */}
        {certificates.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-7 h-7 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Certificates</h2>
              <span className="ml-auto bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-bold">
                {certificates.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {certificates.map((cert) => (
                <a
                  key={cert.id}
                  href={`/courses/${cert.course_id}/certificate`}
                  className="group border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-orange-400 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 shadow-lg">
                      🏆
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition line-clamp-1">
                        {cert.course_title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        ID: <span className="font-mono font-semibold">{cert.certificate_code}</span>
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {new Date(cert.issued_at).toLocaleDateString()}
                        </span>
                        <span className="font-bold text-orange-600">
                          Grade: {cert.grade}
                        </span>
                        <span className="font-bold text-gray-900">
                          {cert.score}%
                        </span>
                      </div>
                    </div>
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-orange-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/my-certificates"
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                View All Certificates
              </Link>

              <Link
                href="/my-transcripts"
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Transcript
              </Link>
            </div>
          </div>
        )}

        {/* Enrolled Courses Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Enrolled Courses</h2>
            <span className="ml-auto bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-bold">
              {enrollments.length}
            </span>
          </div>

          {enrollments.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500 text-lg mb-6">No courses enrolled yet</p>
              <a href="/courses"
                className="inline-block px-8 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 shadow-lg transition-all"
              >
                Browse Courses
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider rounded-tl-lg">
                      Course Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">
                      Modules
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider rounded-tr-lg">
                      Enrolled Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-orange-50 transition-colors">
                      <td className="px-6 py-4">
                        <a href={`/courses/${enrollment.course.id}`}
                          className="text-orange-600 hover:text-orange-800 font-semibold hover:underline"
                        >
                          {enrollment.course.title}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        {enrollment.course.category ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full ${enrollment.course.level === "Beginner"
                              ? "bg-orange-400"
                              : enrollment.course.level === "Intermediate"
                                ? "bg-gray-500"
                                : enrollment.course.level === "Advanced"
                                  ? "bg-gray-900"
                                  : "bg-gray-300"
                              }`}
                          />
                          <span className="text-sm text-gray-700 font-medium">
                            {enrollment.course.level ?? "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-bold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {enrollment.course.moduleCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Course Progress Statistics */}
        {enrollments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 p-6 hover:border-orange-400 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{enrollments.length}</p>
                  <p className="text-sm text-gray-600 font-medium">Total Courses</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 hover:border-gray-400 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {enrollments.reduce((sum, e) => sum + e.course.moduleCount, 0)}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">Total Modules</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 p-6 hover:border-orange-400 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {enrollments.filter(e => e.course.level === 'Beginner').length}/
                    {enrollments.filter(e => e.course.level === 'Intermediate').length}/
                    {enrollments.filter(e => e.course.level === 'Advanced').length}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">B/I/A Levels</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}