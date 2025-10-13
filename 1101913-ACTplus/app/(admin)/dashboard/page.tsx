"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from "recharts";

const COLORS = ["#f97316", "#6b7280", "#a1a1aa", "#374151", "#d4d4d8"];  // ส้ม + เฉดเทา-ดำ

type Skill = {
  id: number;
  code: string;
  name: string;
  color: string;
  totalPoints: number;
  userCount: number;
};

type Student = {
  id: number;
  name: string;
  email: string;
  hours: number;
};

type StatCardProps = {
  icon: string;
  title: string;
  value: number;
  bgColor: string;
};

type Stats = {
  totalStudents: number;
  totalActivities: number;
  totalVolunteerHours: number;
  ongoingActivities: number;
};

type ParticipationRate = {
  term: string;
  rate: number;
};

type CheckinStat = {
  name: string;
  value: number;
};

type ActivityPerMonth = {
  month: string;
  count: number;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role !== "staff") {
      router.replace("/");
    }
  }, [session, status, router]);

  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalActivities: 0,
    totalVolunteerHours: 0,
    ongoingActivities: 0
  });

  const [topSkills, setTopSkills] = useState<Skill[]>([]);
  const [participationRate, setParticipationRate] = useState<ParticipationRate[]>([]);
  const [checkinStats, setCheckinStats] = useState<CheckinStat[]>([]);
  const [activitiesPerMonth, setActivitiesPerMonth] = useState<ActivityPerMonth[]>([]);
  const [topStudents, setTopStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statsRes,
        skillsRes,
        participationRes,
        checkinRes,
        monthRes,
        studentsRes
      ] = await Promise.all([
        fetch('/api/v0/dashboard/stats'),
        fetch('/api/v0/dashboard/top-skills'),
        fetch('/api/v0/dashboard/participation-rate'),
        fetch('/api/v0/dashboard/checkin-stats'),
        fetch('/api/v0/dashboard/activities-per-month'),
        fetch('/api/v0/dashboard/top-students')
      ]);

      if (!statsRes.ok) throw new Error("Failed to fetch stats");
      if (!skillsRes.ok) throw new Error("Failed to fetch top skills");
      if (!participationRes.ok) throw new Error("Failed to fetch participation rate");
      if (!checkinRes.ok) throw new Error("Failed to fetch checkin stats");
      if (!monthRes.ok) throw new Error("Failed to fetch activities per month");
      if (!studentsRes.ok) throw new Error("Failed to fetch top students");

      const statsData = await statsRes.json();
      const skillsData = await skillsRes.json();
      const participationData = await participationRes.json();
      const checkinData = await checkinRes.json();
      const monthData = await monthRes.json();
      const studentsData = await studentsRes.json();

      setStats(statsData);
      setTopSkills(skillsData.skills || []);
      setParticipationRate(participationData.rate || []);
      setCheckinStats(checkinData.stats || []);
      setActivitiesPerMonth(monthData.data || []);
      setTopStudents(studentsData.students || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "staff") {
      fetchDashboardData();
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading session...</p>
      </div>
    );
  }

  if (session?.user?.role !== "staff") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Access Denied</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <p className="text-red-500 text-center">Error: {error}</p>
      </div>
    );
  }

  // ✅ คำนวณ max value สำหรับ Y-axis
  const maxActivityCount = Math.max(...activitiesPerMonth.map(m => m.count), 5);
  const yAxisMax = Math.ceil(maxActivityCount / 5) * 5; // ปัดขึ้นเป็นทวีคูณของ 5

  const maxParticipationRate = Math.max(...participationRate.map(r => r.rate), 100);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-10">
        Dashboard Overview
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon="👨‍🎓"
          title="Total Students"
          value={stats.totalStudents}
          bgColor="bg-gradient-to-br from-orange-400 to-orange-600"
        />
        <StatCard
          icon="📅"
          title="Total Activities"
          value={stats.totalActivities}
          bgColor="bg-gradient-to-br from-gray-500 to-gray-700"
        />
        <StatCard
          icon="⏱️"
          title="Volunteer Hours"
          value={stats.totalVolunteerHours}
          bgColor="bg-gradient-to-br from-gray-400 to-gray-600"
        />
        <StatCard
          icon="🎯"
          title="Ongoing Activities"
          value={stats.ongoingActivities}
          bgColor="bg-gradient-to-br from-orange-300 to-orange-500"
        />
      </div>

      {/* Top Skills */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-10">
        <h2 className="text-xl font-bold text-orange-600 mb-4">
          Top 5 Skills in System
        </h2>
        {topSkills.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No skills data available</p>
        ) : (
          <div className="space-y-3">
            {topSkills.map((skill, index) => (
              <div key={skill.id} className="flex items-center gap-4 p-3 hover:bg-orange-50 rounded-lg transition">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">
                  {index + 1}
                </div>
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: skill.color }}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{skill.name}</p>
                  <p className="text-sm text-gray-500">{skill.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">
                    {skill.totalPoints}
                  </p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-700">
                    {skill.userCount}
                  </p>
                  <p className="text-xs text-gray-500">users</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Activities per Month */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-orange-600 mb-4">
            Activities per Month ({new Date().getFullYear()})
          </h2>
          {activitiesPerMonth.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activity data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activitiesPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis 
                  stroke="#6b7280"
                  domain={[0, yAxisMax]}
                  ticks={Array.from({ length: (yAxisMax / 5) + 1 }, (_, i) => i * 5)}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Check-in Statistics */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-orange-600 mb-4">
            Check‑in Statistics
          </h2>
          {checkinStats.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No check-in data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={checkinStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {checkinStats.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Participation Rate */}
      {participationRate.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-10">
          <h2 className="text-xl font-bold text-orange-600 mb-4">
            Average Participation Rate by Term
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={participationRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="term" stroke="#6b7280" />
              <YAxis 
                stroke="#6b7280"
                domain={[0, maxParticipationRate]}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#f97316" 
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Students by Volunteer Hours */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-orange-600 mb-4">
          Top 10 Students by Volunteer Hours
        </h2>
        {topStudents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No students data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-gray-800">
              <thead>
                <tr className="bg-orange-100 text-orange-700">
                  <th className="p-3 text-left">Rank</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-center">Hours</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((stu, idx) => (
                  <tr key={stu.id} className="border-b hover:bg-orange-50 transition">
                    <td className="p-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">
                        {idx + 1}
                      </div>
                    </td>
                    <td className="p-3 font-medium">{stu.name}</td>
                    <td className="p-3 text-gray-600">{stu.email}</td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
                        {stu.hours}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, bgColor }: StatCardProps) {
  return (
    <div className={`${bgColor} text-white p-6 rounded-2xl shadow transform transition hover:scale-105`}>
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value.toLocaleString()}</div>
      <div className="text-sm opacity-90">{title}</div>
    </div>
  );
}