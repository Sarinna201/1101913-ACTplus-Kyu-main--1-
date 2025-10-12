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
    return { label: "Upcoming", colorClass: "bg-orange-100 text-orange-800", icon: "🗓️" };
  } else if (end && now > end) {
    return { label: "Ended", colorClass: "bg-gray-200 text-gray-800", icon: "✓" };
  } else {
    return { label: "Ongoing", colorClass: "bg-orange-200 text-orange-900", icon: "▶" };
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
        const unwrapped = await params;
        const actId = Number(unwrapped.id);
        if (!Number.isFinite(actId)) {
          notFound();
          return;
        }
        setId(actId);
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/v0/activities/${actId}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) notFound();
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setActivity(data);
      } catch (e: any) {
        setError(e.message || "Failed to fetch activity");
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
        const errData = await res.json();
        throw new Error(errData.error || "Failed to join activity");
      }
      const updated = await res.json();
      setActivity(updated);
    } catch (e: any) {
      alert(e.message || "Failed to join");
    } finally {
      setJoinLeaveLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!user || id === null) return;
    if (!window.confirm("Are you sure to leave this activity?")) return;
    try {
      setJoinLeaveLoading(true);
      const res = await fetch(`/api/v0/activities/${id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to leave activity");
      }
      const updated = await res.json();
      setActivity(updated);
    } catch (e: any) {
      alert(e.message || "Failed to leave");
    } finally {
      setJoinLeaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || id === null) return;
    if (!window.confirm("Delete this activity? This cannot be undone.")) return;
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/v0/activities/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errD = await res.json();
        throw new Error(errD.error || "Failed to delete");
      }
      window.location.href = "/activities";
    } catch (e: any) {
      alert(e.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditSave = () => {
    window.location.reload();
  };

  const isParticipant = activity?.participants.some((p) => p.id === user?.id) ?? false;
  const isLecturer = activity?.lecturer === user?.id;
  const isStaff = user?.role === "staff";
  const canEdit = isLecturer || isStaff;
  const canDelete = canEdit;
  const canManageAttendance = canEdit;

  const totalSkillPoints = activity?.skills.reduce((sum, sk) => sum + sk.points, 0) ?? 0;
  const status = activity ? getActivityStatus(activity.start_date, activity.end_date) : null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-center py-20">
          <div className="animate-spin h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Retry
          </button>
          <Link href="/activities" className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Back to Activities
          </Link>
        </div>
      </div>
    );
  }

  if (!activity) {
    return notFound();
  }

  return (
    <section className="p-6 lg:p-10 space-y-10 bg-white text-gray-900">
      {/* Top Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-orange-600">{activity.title}</h1>
        <div className="flex items-center gap-4">
          {user && !canEdit && (
            isParticipant ? (
              <button
                onClick={handleLeave}
                disabled={joinLeaveLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {joinLeaveLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Leave
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joinLeaveLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
              >
                {joinLeaveLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Joining...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Join
                  </>
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Image */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            {activity.imageUrl ? (
              <img src={activity.imageUrl} alt="activity" className="object-cover w-full h-48" />
            ) : (
              <div className="h-48 flex items-center justify-center bg-orange-50 text-6xl">🎯</div>
            )}
          </div>

          {/* Activity Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4 text-orange-600">Details</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>Start:</strong> {fmt(activity.start_date)}</p>
              {activity.end_date && <p><strong>End:</strong> {fmt(activity.end_date)}</p>}
              <p><strong>Term:</strong> Year {activity.year}, Term {activity.term}</p>
              <p><strong>Authority:</strong> {activity.authority}</p>
              {(activity.volunteerHours ?? 0) > 0 && (
                <p><strong>Volunteer:</strong> {activity.volunteerHours} hours</p>
              )}
            </div>
          </div>

          {/* Lecturer */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4 text-orange-600">Lecturer</h3>
            <div className="flex items-center gap-4">
              <img
                src={activity.lecturerInfo?.imageUrl || "/default-avatar.png"}
                alt={activity.lecturerInfo?.username}
                className="h-12 w-12 rounded-full object-cover border border-orange-200"
              />
              <div>
                <div className="font-medium text-gray-900">{activity.lecturerInfo?.username}</div>
                <div className="text-sm text-gray-500">{activity.lecturerInfo?.email}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-orange-100 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-orange-700 mb-4">Quick Stats</h3>
            <ul className="space-y-2 text-sm">
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

        {/* Right Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Check-In (optional) */}
          {user && isParticipant && !canEdit && (
            <SelfCheckInCard activityId={activity.id} onCheckInSuccess={() => console.log("Checked in")} />
          )}

          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{activity.title}</h2>
            <p className="text-gray-700 whitespace-pre-line">{activity.detail}</p>
          </div>

          {/* Skills */}
          {activity.skills?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-600">Skills Development</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {activity.skills.map((skill) => (
                  <div key={skill.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-900">{skill.code}</span>
                      <span className="text-orange-700 font-bold">+{skill.points} pts</span>
                    </div>
                    <h3 className="text-md font-semibold text-gray-800">{skill.name}</h3>
                    <p className="text-sm text-gray-600">{skill.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participants */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-600">Participants</h2>
            {activity.participants.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {activity.participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 border p-4 rounded-lg hover:shadow">
                    <img src={p.imageUrl || "/default-avatar.png"} alt={p.username} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{p.username}</div>
                      <div className="text-sm text-gray-500">{p.email}</div>
                    </div>
                    <Link href={`/users/${p.id}`} className="text-orange-600 text-sm font-semibold hover:underline">View</Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-10">
                <div className="text-5xl mb-2">👥</div>
                <p>No participants yet. Be the first to join!</p>
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
