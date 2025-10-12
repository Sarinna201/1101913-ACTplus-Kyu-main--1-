"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CourseSkillsManager from "@/app/components/CourseSkillsManager";
import CourseProgress from "@/app/components/CourseProgress";
import CourseFeedback from "@/app/components/CourseFeedback";

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

  // ตรวจสอบว่าสามารถแก้ไขได้ไหม (instructor หรือ staff)
  const canEdit = session?.user && (
    (session.user as any).role === "staff"
    || ((session.user as any).role === "instructor" && course?.instructor === (session.user as any).id)
  );

  // ฟังก์ชันแปลง level เป็นสีธีมส้มกับโทนย่อย
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner": return "bg-orange-100 text-orange-800";
      case "intermediate": return "bg-orange-200 text-orange-900";
      case "advanced": return "bg-orange-300 text-orange-900";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v0/courses/${id}`);
      if (!res.ok) throw new Error("Course not found");
      const data = await res.json();
      if (data.success) {
        setCourse(data.course);
        setModules(data.modules || []);
      }
    } catch (err) {
      console.error("Error fetching course:", err);
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
    } catch (err) {
      console.error("Error checking enrollment:", err);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleEnroll = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setEnrolling(true);
    try {
      const res = await fetch(`/api/v0/courses/${id}/enroll`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setIsEnrolled(true);
        alert("Successfully enrolled!");
      } else {
        alert(data.error || "Failed to enroll");
      }
    } catch (err) {
      console.error("Enroll error:", err);
      alert("An error occurred");
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!confirm("Are you sure to unenroll from this course?")) return;
    setEnrolling(true);
    try {
      const res = await fetch(`/api/v0/courses/${id}/enroll`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setIsEnrolled(false);
        alert("Unenrolled successfully");
      } else {
        alert(data.error || "Failed to unenroll");
      }
    } catch (err) {
      console.error("Unenroll error:", err);
      alert("An error occurred");
    } finally {
      setEnrolling(false);
    }
  };

  const checkCertificateStatus = async () => {
    try {
      const certRes = await fetch(`/api/v0/courses/${id}/certificate`);
      const certData = await certRes.json();
      if (certData.success && certData.certificate) {
        setCertificate(certData.certificate);
      }
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
    } catch (err) {
      console.error("Certificate check error:", err);
    }
  };

  const handleRequestCertificate = async () => {
    setGeneratingCert(true);
    try {
      const res = await fetch(`/api/v0/courses/${id}/certificate`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setCertificate(data.certificate);
        setCanRequestCertificate(false);
        alert("Certificate generated!");
        router.push(`/courses/${id}/certificate`);
      } else {
        alert(data.error || "Failed to generate certificate");
      }
    } catch (err) {
      console.error("Generate certificate error:", err);
      alert("Failed to generate certificate");
    } finally {
      setGeneratingCert(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <Link href="/courses" className="text-orange-600 hover:underline">Back to courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Back */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
              <div className="flex items-center gap-4">
                {canEdit && (
                  <Link
                    href={`/courses/${course.id}/edit`}
                    className="inline-flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition font-semibold shadow"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Edit Course
                  </Link>
                )}
                {typeof course.rating === "number" && (
                  <div className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-full shadow-inner">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{course.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3">{course.title}</h1>
            <p className="text-orange-100 text-lg">{course.description}</p>
          </div>

          <div className="p-8 space-y-10">
            {/* Course Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                  C
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase font-semibold">Category</p>
                  <p className="text-gray-900 font-semibold">{course.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                  D
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase font-semibold">Duration</p>
                  <p className="text-gray-900 font-semibold">{course.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={course.instructorImage || '/uploads/images/user-default1.png'}
                  alt={course.instructorName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-orange-200 shadow-sm"
                />
                <div>
                  <p className="text-sm text-gray-500 uppercase font-semibold">Instructor</p>
                  <p className="text-gray-900 font-semibold">{course.instructorName}</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            {isEnrolled && !canEdit && (
              <CourseProgress courseId={course.id} isEnrolled={isEnrolled} />
            )}

            {/* Certificate */}
            {isEnrolled && !canEdit && (
              <div>
                {certificate ? (
                  <div className="bg-yellow-100 rounded-xl shadow p-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-7xl select-none">🏆</div>
                      <div>
                        <h3 className="text-2xl font-bold text-yellow-800 mb-2">Congratulations! You got a certificate</h3>
                        <p className="text-yellow-700 font-mono">ID: {certificate.certificate_code}</p>
                        <p className="text-yellow-700">Grade: <span className="font-bold">{certificate.grade}</span> | Score: <span className="font-bold">{certificate.score}%</span></p>
                      </div>
                    </div>
                    <a
                      href={`/courses/${id}/certificate`}
                      className="inline-flex items-center gap-2 bg-yellow-300 text-yellow-900 px-6 py-3 rounded-lg hover:bg-yellow-400 transition shadow"
                    >
                      View Certificate
                    </a>
                  </div>
                ) : canRequestCertificate ? (
                  <div className="bg-green-100 rounded-xl shadow p-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-7xl">🎉</div>
                      <div>
                        <h3 className="text-2xl font-bold text-green-800 mb-2">Eligible for certificate!</h3>
                        <p className="text-green-700">You’ve completed all modules and passed.</p>
                      </div>
                    </div>
                    <button
                      onClick={handleRequestCertificate}
                      disabled={generatingCert}
                      className="inline-flex items-center gap-2 bg-green-300 text-green-900 px-6 py-3 rounded-lg hover:bg-green-400 transition shadow disabled:opacity-50"
                    >
                      {generatingCert
                        ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-900 border-t-transparent"></div>
                        : <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Get Certificate
                          </>
                      }
                    </button>
                  </div>
                ) : null}
              </div>
            )}

            {/* Course Contents */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About This Course</h2>
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: course.contents }}
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-10">
          <CourseSkillsManager courseId={course.id} canEdit={!!canEdit} />
        </div>

        {/* Modules */}
        {modules.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Course Modules</h2>
            <div className="space-y-5">
              {modules.map((module, idx) => (
                <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition cursor-pointer">
                    <button
                      onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                      className="flex items-start gap-5 flex-1 text-left"
                    >
                      <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{module.title}</h3>
                        {module.summary && (
                          <p className="text-gray-600 text-sm mb-2">{module.summary}</p>
                        )}
                        {module.duration && (
                          <div className="text-sm text-gray-500">
                            Duration: {module.duration}
                          </div>
                        )}
                      </div>
                      <svg
                        className={`w-6 h-6 text-gray-400 transition-transform ${activeModule === module.id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {canEdit && (
                      <Link
                        href={`/courses/${course.id}/modules/${module.id}/edit`}
                        className="ml-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium text-sm"
                      >
                        Edit Module
                      </Link>
                    )}
                  </div>

                  {activeModule === module.id && module.contents && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50 transition-all">
                      <div
                        className="prose max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: module.contents }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        <div>
          <CourseFeedback courseId={course.id} isEnrolled={isEnrolled} />
        </div>

        {/* Enroll / Start Learning */}
        {!canEdit && (
          <div className="mt-8 text-center">
            {checkingEnrollment ? (
              <div className="inline-block animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
            ) : isEnrolled ? (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-lg font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Already Enrolled
                </div>
                <Link
                  href={`/courses/${id}/learn`}
                  className="inline-block px-10 py-4 bg-orange-600 text-white text-lg font-semibold rounded-full hover:bg-orange-700 transition shadow-lg"
                >
                  Start Learning →
                </Link>
                <div className="mt-4">
                  <button
                    onClick={handleUnenroll}
                    disabled={enrolling}
                    className="text-red-600 hover:text-red-800 text-sm underline disabled:opacity-50"
                  >
                    {enrolling ? "Processing..." : "Unenroll Course"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="px-10 py-4 bg-orange-600 text-white text-lg font-semibold rounded-full hover:bg-orange-700 transition shadow-lg disabled:opacity-50"
              >
                {enrolling ? "Enrolling..." : "Enroll Course"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
