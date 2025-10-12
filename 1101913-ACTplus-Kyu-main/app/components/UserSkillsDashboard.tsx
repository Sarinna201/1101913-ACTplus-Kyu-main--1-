// components/UserSkillsDashboard.tsx
"use client";

import { useState, useEffect } from "react";

type UserSkill = {
  id: number;
  code: string;
  name: string;
  description: string;
  color: string;
  totalPoints: number;
  level: number;
  lastUpdated: string | null;
};

type SkillHistory = {
  id: number;
  skill: {
    id: number;
    code: string;
    name: string;
    color: string;
  };
  activity: {
    id: number;
    title: string;
  };
  points: number;
  earnedAt: string;
};

type Statistics = {
  totalPoints: number;
  activeSkills: number;
  totalSkills: number;
  averageLevel: number;
  completionRate: number;
};

type UserSkillsDashboardProps = {
  userId: number;
  isOwnProfile?: boolean;
};

const getLevelColor = (level: number) => {
  switch (level) {
    case 0: return "bg-gray-200 text-gray-600";
    case 1: return "bg-green-200 text-green-800";
    case 2: return "bg-blue-200 text-blue-800";
    case 3: return "bg-purple-200 text-purple-800";
    case 4: return "bg-orange-200 text-orange-800";
    case 5: return "bg-red-200 text-red-800";
    default: return "bg-gray-200 text-gray-600";
  }
};

const getLevelName = (level: number) => {
  switch (level) {
    case 0: return "Not Started";
    case 1: return "Beginner";
    case 2: return "Developing";
    case 3: return "Proficient";
    case 4: return "Advanced";
    case 5: return "Expert";
    default: return "Unknown";
  }
};

const getProgressPercentage = (level: number, totalPoints: number) => {
  if (level === 0) return (totalPoints / 10) * 100;
  if (level >= 5) return 100;
  
  const ranges = [
    { min: 0, max: 10 },
    { min: 11, max: 25 },
    { min: 26, max: 50 },
    { min: 51, max: 100 },
    { min: 101, max: 200 }
  ];

  const currentRange = ranges[level - 1];
  const pointsInLevel = totalPoints - currentRange.min;
  const pointsNeeded = currentRange.max - currentRange.min + 1;
  
  return (pointsInLevel / pointsNeeded) * 100;
};

export default function UserSkillsDashboard({ userId, isOwnProfile = false }: UserSkillsDashboardProps) {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [history, setHistory] = useState<SkillHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchUserSkills();
  }, [userId]);

  useEffect(() => {
    if (showHistory) {
      fetchSkillHistory();
    }
  }, [showHistory, selectedSkill]);

  const fetchUserSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v0/users/${userId}/skills`);
      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills);
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error("Error fetching user skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillHistory = async () => {
    try {
      setHistoryLoading(true);
      const params = new URLSearchParams({ limit: "20" });
      if (selectedSkill) {
        params.append("skillId", selectedSkill.toString());
      }

      const response = await fetch(`/api/v0/users/${userId}/skills/history?${params}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
      }
    } catch (error) {
      console.error("Error fetching skill history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div className="text-3xl font-bold">{statistics.totalPoints}</div>
            <div className="text-blue-100 text-sm">Total Points</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div className="text-3xl font-bold">{statistics.activeSkills}</div>
            <div className="text-green-100 text-sm">Active Skills</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <div className="text-3xl font-bold">{statistics.averageLevel.toFixed(1)}</div>
            <div className="text-purple-100 text-sm">Average Level</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
            <div className="text-3xl font-bold">{statistics.completionRate}%</div>
            <div className="text-orange-100 text-sm">Completion</div>
          </div>
        </div>
      )}

      {/* Skills Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isOwnProfile ? "My Skills" : "Skills Overview"}
          </h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            {showHistory ? "Hide History" : "View History"}
          </button>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map(skill => {
            const progressPercentage = getProgressPercentage(skill.level, skill.totalPoints);
            
            return (
              <div 
                key={skill.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedSkill(selectedSkill === skill.id ? null : skill.id);
                  if (!showHistory) setShowHistory(true);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: skill.color }}
                    ></div>
                    <span className="font-semibold text-gray-900">{skill.code}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                    {getLevelName(skill.level)}
                  </span>
                </div>

                <h3 className="font-medium text-gray-900 mb-2 text-sm leading-tight">
                  {skill.name}
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{skill.totalPoints} points</span>
                    <span>Level {skill.level}</span>
                  </div>
                  
                  {skill.level < 5 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(progressPercentage, 100)}%`,
                          backgroundColor: skill.color
                        }}
                      ></div>
                    </div>
                  )}

                  {skill.lastUpdated && (
                    <div className="text-xs text-gray-500">
                      Last updated: {new Date(skill.lastUpdated).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill History */}
      {showHistory && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Skill History
              {selectedSkill && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  - {skills.find(s => s.id === selectedSkill)?.code}
                </span>
              )}
            </h3>
            {selectedSkill && (
              <button
                onClick={() => setSelectedSkill(null)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Show All Skills
              </button>
            )}
          </div>

          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No skill history found
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: record.skill.color }}
                    ></div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {record.skill.code} - {record.skill.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        From: <a href={`/activities/${record.activity.id}`} className="text-indigo-600 hover:underline">{record.activity.title}</a>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">+{record.points} pts</div>
                    <div className="text-xs text-gray-500">
                      {new Date(record.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}