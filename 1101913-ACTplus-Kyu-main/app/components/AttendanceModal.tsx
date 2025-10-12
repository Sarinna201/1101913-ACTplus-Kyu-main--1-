// components/AttendanceModal.tsx
"use client";

import { useState, useEffect } from "react";
import ExportButton from '@/app/components/ExportButton';

type Participant = {
  id: number;
  userId: number;
  username: string;
  email: string;
  imageUrl?: string;
  role: string;
  checkedIn: boolean;
  checkedAt: string | null;
};

type AttendanceModalProps = {
  activityId: number;
  activityTitle: string;
  onClose: () => void;
};

export default function AttendanceModal({ activityId, activityTitle, onClose }: AttendanceModalProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"username" | "email" | "checkedAt" | "checkedIn">("username");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, [activityId, search, sortBy, sortOrder]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        ...(search && { search }),
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/v0/activities/${activityId}/attendance?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch attendance");
      }

      const data = await response.json();
      setParticipants(data.participants);
    } catch (err: any) {
      setError(err.message || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (participantId: number, checkedIn: boolean) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/v0/activities/${activityId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, checkedIn })
      });

      if (!response.ok) {
        throw new Error("Failed to update attendance");
      }

      const updatedParticipant = await response.json();
      setParticipants(prev =>
        prev.map(p => p.id === participantId ? updatedParticipant : p)
      );
    } catch (err: any) {
      alert(err.message || "Failed to update attendance");
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkCheckIn = async (checkedIn: boolean) => {
    if (selectedIds.length === 0) {
      alert("Please select participants first");
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`/api/v0/activities/${activityId}/attendance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantIds: selectedIds, checkedIn })
      });

      if (!response.ok) {
        throw new Error("Failed to bulk update attendance");
      }

      await fetchAttendance();
      setSelectedIds([]);
    } catch (err: any) {
      alert(err.message || "Failed to bulk update attendance");
    } finally {
      setUpdating(false);
    }
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === participants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(participants.map(p => p.id));
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const checkedCount = participants.filter(p => p.checkedIn).length;
  const totalCount = participants.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-lg">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{activityTitle}</h2>
            <p className="text-sm text-gray-600 mt-1">Attendance Management</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-500 hover:text-orange-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 px-5 py-3 border-b border-gray-200">
          <div className="flex-1 bg-orange-50 text-orange-700 px-4 py-2 rounded-md text-center font-medium">
            {checkedCount} Checked In
          </div>
          <div className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-center font-medium">
            {totalCount - checkedCount} Not Checked
          </div>
          <div className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-md text-center font-semibold">
            {totalCount} Total
          </div>
        </div>

        {/* Actions & Search */}
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
          />

          {/* Export Button */}
          <div>
            <ExportButton
              participants={participants.map(p => ({
                id: p.id,
                username: p.username,
                email: p.email,
                role: 'user',
                checkedIn: p.checkedIn,
                checkedAt: p.checkedAt
              }))}
              activityTitle={activityTitle}
              activityDetails={{
                dateStart: new Date().toISOString(),
              }}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-300 bg-gray-100 text-gray-800">
            <span className="text-sm">{selectedIds.length} selected</span>
            <button
              onClick={() => handleBulkCheckIn(true)}
              disabled={updating}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition"
            >
              Check In Selected
            </button>
            <button
              onClick={() => handleBulkCheckIn(false)}
              disabled={updating}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-900 disabled:opacity-50 transition"
            >
              Uncheck Selected
            </button>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-600">
              <p className="mb-4">{error}</p>
              <button
                onClick={fetchAttendance}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Retry
              </button>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">👥</div>
              <p>No participants found</p>
            </div>
          ) : (
            <table className="w-full min-w-[600px] border-collapse text-gray-900">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === participants.length && participants.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 accent-orange-600"
                    />
                  </th>
                  <th className="px-5 py-3 text-left text-sm font-semibold cursor-pointer select-none" onClick={() => handleSort("username")}>
                    Name {sortBy === "username" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="px-5 py-3 text-left text-sm font-semibold cursor-pointer select-none" onClick={() => handleSort("email")}>
                    Email {sortBy === "email" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="px-5 py-3 text-left text-sm font-semibold cursor-pointer select-none" onClick={() => handleSort("checkedIn")}>
                    Status {sortBy === "checkedIn" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="px-5 py-3 text-left text-sm font-semibold cursor-pointer select-none" onClick={() => handleSort("checkedAt")}>
                    Checked At {sortBy === "checkedAt" && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                  <th className="px-5 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(participant.id)}
                        onChange={() => handleSelectOne(participant.id)}
                        className="w-4 h-4 accent-orange-600"
                      />
                    </td>
                    <td className="px-5 py-3 flex items-center gap-3">
                      <img
                        src={participant.imageUrl || "/default-avatar.png"}
                        alt={participant.username}
                        className="h-9 w-9 rounded-full object-cover border border-gray-300"
                      />
                      <span className="font-medium">{participant.username}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">{participant.email}</td>
                    <td className="px-5 py-3">
                      {participant.checkedIn ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          ✓ Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                          ✗ Not Checked
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {participant.checkedAt ? (
                        new Date(participant.checkedAt).toLocaleString()
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-medium">
                      {participant.checkedIn ? (
                        <button
                          onClick={() => handleCheckIn(participant.id, false)}
                          disabled={updating}
                          className="text-orange-600 hover:text-orange-800 disabled:opacity-50 transition"
                        >
                          Uncheck
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(participant.id, true)}
                          disabled={updating}
                          className="text-orange-600 hover:text-orange-800 disabled:opacity-50 transition"
                        >
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-gray-700 text-sm font-semibold">
          <div>
            Total: {checkedCount} / {totalCount} checked in ({totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100)}%)
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
