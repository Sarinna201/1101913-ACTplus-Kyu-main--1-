"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ActivityEditForm from "@/app/components/ActivityEditForm";
import AttendanceModal from "@/app/components/AttendanceModal";
import SelfCheckInCard from "@/app/components/SelfCheckInCard";

type ActivitySkill = {
  id: number;
  code: string;
  name: string;
  description: string;
  color: string;
  points: number;
};

type Activity = {
  id: number;
  title: string;
  detail: string;
  imageUrl: string;
  lecturer: number;
  lecturerInfo: {
    id: number;
    username: string;
    email: string;
    imageUrl?: string;
  };
  start_date: string;
  end_date: string | null;
  year: number;
  term: number;
  volunteerHours: number | null;
  authority: string;
  skills: ActivitySkill[];
  participants: Array<{
    id: number;
    username: string;
    email: string;
    imageUrl?: string;
    role: string;
  }>;
};

type PageProps = { params: Promise<{ id: string }> };

function fmt(iso: string) {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(iso).toLocaleString("en-US", opts);
}

function getActivityStatus(startDate: string, endDate: string | null) {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (now < start) {
    return { label: "Upcoming", color: "bg-blue-100 text-blue-800", icon: "🗓️" };
  } else if (end && now > end) {
    return { label: "Ended", color: "bg-gray-100 text-gray-800", icon: "✓" };
  } else {
    return { label: "Ongoing", color: "bg-green-100 text-green-800", icon: "▶" };
  }
}

export default function ActivityDetailPage({ params }: PageProps) {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<number | null>(null);
  const [joinLeaveLoading, setJoinLeaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const unwrappedParams = await params;
        const activityId = Number(unwrappedParams.id);
        if (!Number.isFinite(activityId)) {
          notFound();
          return;
        }

        setId(activityId);
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/v0/activities/${activityId}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) notFound();
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setActivity(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch activity");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [params]);

  const handleJoin = async () => {
    if (!user || id === null) return;
    try {
      setJoinLeaveLoading(true);
      const res = await fetch(`/api/v0/activities/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to join activity");
      }
      const updatedData = await res.json();
      setActivity(updatedData);
    } catch (err: any) {
      console.error("Join error:", err);
      alert(err.message || "Failed to join activity");
    } finally {
      setJoinLeaveLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!user || id === null) return;
    const confirmed = window.confirm("Are you sure you want to leave this activity?");
    if (!confirmed) return;

    try {
      setJoinLeaveLoading(true);
      const res = await fetch(`/api/v0/activities/${id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to leave activity");
      }
      const updatedData = await res.json();
      setActivity(updatedData);
    } catch (err: any) {
      console.error("Leave error:", err);
      alert(err.message || "Failed to leave activity");
    } finally {
      setJoinLeaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || id === null) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this activity? This action cannot be undone and will remove all participant records."
    );
    if (!confirmed) return;

    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/v0/activities/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete activity");
      }
      window.location.href = "/activities";
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message || "Failed to delete activity");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditSave = () => {
    window.location.reload();
  };

  const isParticipant = activity?.participants?.some((p) => p.id === user?.id) ?? false;
  const isLecturer = activity?.lecturer === user?.id;
  const isStaff = user?.role === "staff";
  const canEdit = isLecturer || isStaff;
  const canDelete = isLecturer || isStaff;
  const canManageAttendance = isLecturer || isStaff;

  const totalSkillPoints = activity?.skills?.reduce((sum, skill) => sum + skill.points, 0) || 0;
  const status = activity ? getActivityStatus(activity.start_date, activity.end_date) : null;

  if (loading) {
    return (
      <div className="max-w-7xl m-auto p-4">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl m-auto p-4">
        <div className="text-center py-12">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Activity</h3>
          <p className="text-red-500 mb-6">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
            <Link
              href="/activities"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Activities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) return notFound();

  return (
    <section className="p-6 lg:p-10 space-y-10 bg-white text-gray-900">
      {/* Breadcrumb & Actions */}
      <div className="mb-6">
        <Link
          href="/activities"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Activities
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Status Badge */}
          {status && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${status.color}`}>
              <span>{status.icon}</span>
              {status.label}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {user && canEdit && (
              <>
                <button
                  onClick={() => setShowAttendanceModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Attendance
                </button>

                <button
                  onClick={() => setShowEditForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>

                {canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {user && !canEdit && (
              <>
                {isParticipant ? (
                  <button
                    onClick={handleLeave}
                    disabled={joinLeaveLoading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {joinLeaveLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Leaving...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Leave Activity
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={joinLeaveLoading}
                    className="inline-flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {joinLeaveLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Joining...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Join Activity
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Activity Image */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="aspect-[4/3] bg-gradient-to-br from-indigo-100 to-purple-100 relative">
              {activity.imageUrl ? (
                <img
                  src={activity.imageUrl}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-6xl">🎯</div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Activity Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Start Date</div>
                  <div className="font-medium text-gray-900 text-sm">{fmt(activity.start_date)}</div>
                </div>
              </div>

              {activity.end_date && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-1">End Date</div>
                    <div className="font-medium text-gray-900 text-sm">{fmt(activity.end_date)}</div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Academic Period</div>
                  <div className="font-medium text-gray-900 text-sm">Year {activity.year}, Term {activity.term}</div>
                </div>
              </div>

              {activity.volunteerHours && activity.volunteerHours > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-1">Volunteer Hours</div>
                    <div className="font-medium text-gray-900 text-sm">{activity.volunteerHours} hours</div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Authority</div>
                  <div className="font-medium text-gray-900 text-sm">{activity.authority}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Lecturer Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Lecturer
            </h3>
            <div className="flex items-center gap-4">
              <img
                src={activity.lecturerInfo?.imageUrl || "/default-avatar.png"}
                alt={activity.lecturerInfo?.username}
                className="h-14 w-14 border-2 border-indigo-100 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{activity.lecturerInfo?.username}</div>
                <div className="text-sm text-gray-500 truncate">{activity.lecturerInfo?.email}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-orange-100 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-orange-700 mb-4">Quick Stats</h3>
            <ul className="space-y-2 text-sm text-black">
              <li><strong>Participants:</strong> {activity.participants.length}</li>
              {activity.skills?.length > 0 && (
                <>
                  <li><strong>Skills:</strong> {activity.skills.length}</li>
                  <li><strong>Total Points:</strong> {totalSkillPoints}</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Self Check-in Card (for participants who are not instructors) */}
          {user && isParticipant && !canEdit && (
            <SelfCheckInCard 
              activityId={activity.id}
              onCheckInSuccess={() => {
                // Optional: Refresh activity data or show success notification
                console.log("Check-in successful!");
              }}
            />
          )}

          {/* Title & Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{activity.title}</h1>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">{activity.detail}</p>
            </div>
          </div>

          {/* Skills Development */}
          {activity.skills && activity.skills.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Skills Development
                </h2>
                <div className="text-lg font-semibold text-orange-500">
                  Total: {totalSkillPoints} points
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {activity.skills.map(skill => (
                  <div
                    key={skill.id}
                    className="group bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-5 border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full shadow-sm"
                          style={{ backgroundColor: skill.color }}
                        ></div>
                        <span className="font-bold text-gray-900 text-lg">{skill.code}</span>
                      </div>
                      <span className="bg-orange-100 text-black text-sm font-semibold px-3 py-1.5 rounded-full">
                        +{skill.points} pts
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{skill.name}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{skill.description}</p>
                  </div>
                ))}
              </div>

              
            </div>
          )}

          {/* Participants Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Participants
              </h2>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="font-semibold">{activity.participants.length}</span>
                <span className="text-sm">joined</span>
              </div>
            </div>

            {activity.participants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activity.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="group flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                  >
                    <div className="relative">
                      <img
                        src={participant.imageUrl || "/default-avatar.png"}
                        alt={participant.username}
                        className="h-14 w-14 border-2 border-gray-200 rounded-full object-cover group-hover:border-indigo-300 transition-colors"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{participant.username}</div>
                      <div className="text-sm text-gray-500 truncate">{participant.email}</div>
                    </div>
                    <Link
                      className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-200 transition-all"
                      href={`/users/${participant.id}`}
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No participants yet</h3>
                <p className="text-gray-500 mb-6">Be the first to join this activity!</p>
                {user && !canEdit && !isParticipant && (
                  <button
                    onClick={handleJoin}
                    disabled={joinLeaveLoading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Join Now
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditForm && (
        <ActivityEditForm
          activity={activity}
          onSave={handleEditSave}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      {showAttendanceModal && (
        <AttendanceModal
          activityId={activity.id}
          activityTitle={activity.title}
          onClose={() => setShowAttendanceModal(false)}
        />
      )}
    </section>
  );
}