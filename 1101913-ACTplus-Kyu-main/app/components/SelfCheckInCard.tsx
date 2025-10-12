// components/SelfCheckInCard.tsx
"use client";

import { useState, useEffect } from "react";

type CheckInStatus = {
  isParticipant: boolean;
  checkedIn: boolean;
  checkedAt: string | null;
  canCheckIn: boolean;
  activityStatus?: {
    isStarted: boolean;
    isEnded: boolean;
    startDate: string;
    endDate: string | null;
  };
};

type SelfCheckInCardProps = {
  activityId: number;
  onCheckInSuccess?: () => void;
};

export default function SelfCheckInCard({ activityId, onCheckInSuccess }: SelfCheckInCardProps) {
  const [status, setStatus] = useState<CheckInStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCheckInStatus();
  }, [activityId]);

  const fetchCheckInStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/v0/activities/${activityId}/self-checkin`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch check-in status");
      }

      const data = await response.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || "Failed to load check-in status");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setChecking(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`/api/v0/activities/${activityId}/self-checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check in");
      }

      setSuccessMessage(data.message || "Check-in successful!");
      await fetchCheckInStatus();
      
      if (onCheckInSuccess) {
        onCheckInSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to check in");
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!status?.isParticipant) {
    return null;
  }

  // Already checked in
  if (status.checkedIn && status.checkedAt) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm border-2 border-green-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 mb-1">✓ Attendance Confirmed</h3>
            <p className="text-sm text-green-700 mb-2">
              You have successfully checked in for this activity!
            </p>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Checked in at: {new Date(status.checkedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Can check in
  if (status.canCheckIn) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm border-2 border-indigo-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-indigo-900 mb-1">Ready to Check In</h3>
            <p className="text-sm text-indigo-700">
              Confirm your attendance by checking in now. This will record your participation.
            </p>
          </div>
          <button
            onClick={handleCheckIn}
            disabled={checking}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
          >
            {checking ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Checking In...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Check In Now
              </span>
            )}
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
      </div>
    );
  }

  // Activity not started yet
  if (status.activityStatus && !status.activityStatus.isStarted) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl shadow-sm border-2 border-yellow-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-900 mb-1">Activity Not Started Yet</h3>
            <p className="text-sm text-yellow-700 mb-2">
              Check-in will be available when the activity begins.
            </p>
            <div className="text-sm text-yellow-600">
              <strong>Starts:</strong> {new Date(status.activityStatus.startDate).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Activity has ended
  if (status.activityStatus && status.activityStatus.isEnded) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl shadow-sm border-2 border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Activity Has Ended</h3>
            <p className="text-sm text-gray-700 mb-2">
              Check-in is no longer available for this activity.
            </p>
            {!status.checkedIn && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                <strong>Warning:</strong> You did not check in for this activity. Your attendance may not be recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}