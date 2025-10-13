// app/courses/[id]/page.tsx
'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CourseSkillsManager from "@/app/components/CourseSkillsManager";
import CourseProgress from "@/app/components/CourseProgress";
import CourseFeedback from '@/app/components/CourseFeedback';

type Course = {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  instructor: number;
  instructorName: string;
  instructorEmail?: string;
  instructorImage?: string;
  rating?: number;
  createdAt?: string;
  contents: string;
};

type Module = {
  id: number;
  title: string;
  summary?: string;
  duration?: string;
  contents?: string;
  order: number;
};

export default function CoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  const [certificate, setCertificate] = useState<any>(null);
  const [canRequestCertificate, setCanRequestCertificate] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);

  // Check if current user can edit
  const canEdit = session?.user && (
    (session.user as any).role === 'staff' ||
    ((session.user as any).role === 'instructor' && course?.instructor === (session.user as any).id)
  );

  useEffect(() => {
    if (!id) return;
    fetchCourse();
    checkEnrollmentStatus();
  }, [id, session]);

  useEffect(() => {
    if (isEnrolled) {
      checkCertificateStatus();
    }
  }, [id, isEnrolled]);

  const checkCertificateStatus = async () => {
    try {
      // Check if has certificate
      const certRes = await fetch(`/api/v0/courses/${id}/certificate`);
      const certData = await certRes.json();

      if (certData.success && certData.certificate) {
        setCertificate(certData.certificate);
      }

      // Check progress to see if eligible
      const progressRes = await fetch(`/api/v0/courses/${id}/progress`);
      const progressData = await progressRes.json();

      if (progressData.success) {
        const { completionPercentage, averageScore } = progressData.progress;
        setCanRequestCertificate(
          completionPercentage === 100 &&
          averageScore >= 70 &&
          !certData.certificate
        );
      }
    } catch (error) {
      console.error('Error checking certificate status:', error);
    }
  };

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v0/courses/${id}`);

      if (!res.ok) {
        throw new Error('Course not found');
      }

      const data = await res.json();

      if (data.success) {
        setCourse(data.course);
        setModules(data.modules || []);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    if (!session?.user) {
      setCheckingEnrollment(false);
      return;
    }

    try {
      const res = await fetch(`/api/v0/courses/${id}/enroll`);
      const data = await res.json();

      if (data.success) {
        setIsEnrolled(data.enrolled);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleEnroll = async () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetch(`/api/v0/courses/${id}/enroll`, {
        method: 'POST'
      });
      const data = await res.json();

      if (data.success) {
        setIsEnrolled(true);
        alert('Successfully enrolled in the course!');
      } else {
        alert(data.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('An error occurred');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetch(`/api/v0/courses/${id}/enroll`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        setIsEnrolled(false);
        alert('Successfully unenrolled from the course');
      } else {
        alert(data.error || 'Failed to unenroll');
      }
    } catch (error) {
      console.error('Error unenrolling:', error);
      alert('An error occurred');
    } finally {
      setEnrolling(false);
    }
  };

  // ✅ เปลี่ยนสีเป็น orange
  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-orange-100 text-orange-800';
      case 'intermediate': return 'bg-orange-200 text-orange-900';
      case 'advanced': return 'bg-orange-300 text-orange-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Course not found</h2>
          <Link href="/courses" className="text-orange-600 hover:underline">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  const handleRequestCertificate = async () => {
    try {
      setGeneratingCert(true);
      const res = await fetch(`/api/v0/courses/${id}/certificate`, {
        method: 'POST'
      });
      const data = await res.json();

      if (data.success) {
        setCertificate(data.certificate);
        setCanRequestCertificate(false);
        alert('Certificate generated successfully!');
        router.push(`/courses/${id}/certificate`);
      } else {
        alert(data.error || 'Failed to generate certificate');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate');
    } finally {
      setGeneratingCert(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Back Button */}
        <Link
          href="/courses"
          className="flex items-center gap-2 text-black hover:text-orange-700 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </Link>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-orange-600 to-orange-800 p-8 text-white">
            <div className="flex items-start justify-between mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
              {/* Edit Button */}
              {canEdit && (
                <Link
                  href={`/courses/${course.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-orange-700 rounded-lg hover:bg-orange-50 transition font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Course
                </Link>
              )}

              {course.rating && (
                <div className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold">{course.rating}</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-orange-200 text-lg">{course.description}</p>
          </div>

          <div className="p-8">
            {/* Course Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📂</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold text-black">{course.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold text-black">{course.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={course.instructorImage || '/uploads/images/user-default1.png'}
                  alt={course.instructorName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-300"
                />
                <div>
                  <p className="text-sm text-gray-600">Instructor</p>
                  <p className="font-semibold text-black">{course.instructorName}</p>
                </div>
              </div>
            </div>

            {/* Progress Section - แสดงเฉพาะคนที่ enroll แล้ว */}
            {isEnrolled && !canEdit && (
              <CourseProgress courseId={course.id} isEnrolled={isEnrolled} />
            )}

            {/* Certificate Section */}
            {isEnrolled && !canEdit && (
              <div className="mb-8">
                {certificate ? (
                  // มี Certificate แล้ว
                  <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-xl shadow-lg p-8 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-6xl">🏆</div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">
                            Congratulations! You've earned a certificate
                          </h3>
                          <p className="text-yellow-100">
                            Certificate ID: <span className="font-mono font-semibold">{certificate.certificate_code}</span>
                          </p>
                          <p className="text-yellow-100">
                            Grade: <span className="font-bold">{certificate.grade}</span> |
                            Score: <span className="font-bold">{certificate.score}%</span>
                          </p>
                        </div>
                      </div>

                      <a href={`/courses/${id}/certificate`}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-yellow-50 transition shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Certificate
                      </a>
                    </div>
                  </div>
                ) : canRequestCertificate ? (
                  // สามารถขอ Certificate ได้
                  <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-xl shadow-lg p-8 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-6xl">🎉</div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">
                            You're eligible for a certificate!
                          </h3>
                          <p className="text-green-100">
                            You've completed all modules with a passing grade.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRequestCertificate}
                        disabled={generatingCert}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition shadow-lg disabled:opacity-50"
                      >
                        {generatingCert ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Get Certificate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Course Contents */}
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold text-black mb-4">About This Course</h2>
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: course.contents }}
              />
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-8">
          <CourseSkillsManager
            courseId={course.id}
            canEdit={!!canEdit}
          />
        </div>

        {/* Modules Section */}
        {modules.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-8 mb-8">
            <h2 className="text-2xl font-bold text-black mb-6">Course Modules</h2>

            <div className="space-y-4">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className="border border-gray-300 rounded-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between p-6 hover:bg-orange-50 transition">
                    <button
                      onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                      className="flex items-start gap-4 flex-1 text-left"
                    >
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-orange-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-black mb-2">{module.title}</h3>
                        {module.summary && (
                          <p className="text-gray-600 text-sm mb-2">{module.summary}</p>
                        )}
                        {module.duration && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>⏱️</span>
                            <span>{module.duration}</span>
                          </div>
                        )}
                      </div>
                      <svg
                        className={`w-6 h-6 text-gray-400 transition-transform ${activeModule === module.id ? 'transform rotate-180' : ''
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Edit Button for Instructor/Staff */}
                    {canEdit && (
                      <Link
                        href={`/courses/${course.id}/modules/${module.id}/edit`}
                        className="ml-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                      >
                        Edit Content
                      </Link>
                    )}
                  </div>

                  {activeModule === module.id && module.contents && (
                    <div className="border-t border-gray-300 p-6 bg-orange-50">
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: module.contents }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <div className="mb-8">
          <CourseFeedback
            courseId={course.id}
            isEnrolled={isEnrolled}
          />
        </div>

        {/* Enroll Button */}
        {!canEdit && (
          <div className="mt-8">
            {checkingEnrollment ? (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : isEnrolled ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-lg font-medium mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  You are enrolled in this course
                </div>

                <Link
                  href={`/courses/${id}/learn`}
                  className="inline-block px-8 py-4 bg-orange-600 text-white text-lg font-semibold rounded-lg hover:bg-orange-700 transition shadow-lg hover:shadow-xl"
                >
                  Start Learning →
                </Link>

                <div className="mt-4">
                  <button
                    onClick={handleUnenroll}
                    disabled={enrolling}
                    className="text-red-600 hover:text-red-700 text-sm underline disabled:opacity-50"
                  >
                    {enrolling ? 'Processing...' : 'Unenroll from course'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="px-8 py-4 bg-orange-600 text-white text-lg font-semibold rounded-lg hover:bg-orange-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in this Course'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}