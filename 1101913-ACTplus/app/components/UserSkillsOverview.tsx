// components/UserSkillsOverview.tsx
"use client";

import { useState, useEffect } from "react";
import { SkillCard } from "./SkillCard";

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

type UserSkillsOverviewProps = {
  userId: number;
};

export function UserSkillsOverview({ userId }: UserSkillsOverviewProps) {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(`/api/v0/users/${userId}/skills`);
        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }
        const data = await response.json();
        setSkills(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading skills: {error}</p>
      </div>
    );
  }

  const earnedSkills = skills.filter(skill => skill.level > 0);
  const unearnedSkills = skills.filter(skill => skill.level === 0);

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <h3 className="text-lg font-semibold">Total Skills</h3>
          <p className="text-3xl font-bold">{earnedSkills.length}</p>
          <p className="text-sm opacity-90">out of {skills.length} available</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <h3 className="text-lg font-semibold">Total Points</h3>
          <p className="text-3xl font-bold">
            {skills.reduce((sum, skill) => sum + skill.totalPoints, 0)}
          </p>
          <p className="text-sm opacity-90">across all skills</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <h3 className="text-lg font-semibold">Avg Level</h3>
          <p className="text-3xl font-bold">
            {earnedSkills.length > 0 
              ? (earnedSkills.reduce((sum, skill) => sum + skill.level, 0) / earnedSkills.length).toFixed(1)
              : '0.0'
            }
          </p>
          <p className="text-sm opacity-90">of earned skills</p>
        </div>
      </div>

      {/* Earned Skills */}
      {earnedSkills.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Earned Skills ({earnedSkills.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedSkills
              .sort((a, b) => b.level - a.level || b.totalPoints - a.totalPoints)
              .map((skill) => (
                <SkillCard
                  key={skill.id}
                  code={skill.code}
                  name={skill.name}
                  description={skill.description}
                  color={skill.color}
                  totalPoints={skill.totalPoints}
                  level={skill.level}
                  lastUpdated={skill.lastUpdated}
                  showProgress={true}
                />
              ))}
          </div>
        </div>
      )}

      {/* Available Skills */}
      {unearnedSkills.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Available Skills ({unearnedSkills.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unearnedSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                code={skill.code}
                name={skill.name}
                description={skill.description}
                color={skill.color}
                totalPoints={0}
                level={0}
                showProgress={false}
              />
            ))}
          </div>
        </div>
      )}

      {skills.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No skills available</p>
        </div>
      )}
    </div>
  );
}