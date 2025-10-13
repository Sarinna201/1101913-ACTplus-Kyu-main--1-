// components/ActivitySkillsDisplay.tsx
"use client";

import { useState, useEffect } from "react";

type ActivitySkill = {
  id: number;
  code: string;
  name: string;
  description: string;
  color: string;
  points: number;
};

type ActivitySkillsDisplayProps = {
  activityId: number;
  isEditable?: boolean;
  onSkillsUpdate?: (skills: ActivitySkill[]) => void;
};

export default function ActivitySkillsDisplay({
  activityId,
  isEditable = false,
  onSkillsUpdate,
}: ActivitySkillsDisplayProps) {
  const [skills, setSkills] = useState<ActivitySkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivitySkills();
  }, [activityId]);

  const fetchActivitySkills = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v0/activities/${activityId}/skills`);
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
        if (onSkillsUpdate) {
          onSkillsUpdate(data);
        }
      }
    } catch (error) {
      console.error("Error fetching activity skills:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-7 w-7 border-t-4 border-orange-500 border-solid"></div>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="text-center py-10 bg-white border border-gray-200 rounded-lg">
        <div className="text-5xl mb-3">🎯</div>
        <div className="text-gray-600 font-medium">No skills assigned to this activity yet</div>
        {isEditable && (
          <div className="mt-1 text-sm text-gray-400">
            Edit this activity to add skills
          </div>
        )}
      </div>
    );
  }

  const totalPoints = skills.reduce((sum, skill) => sum + skill.points, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <h3 className="text-xl font-semibold text-gray-900">Skills Development</h3>
        <div className="text-sm font-semibold text-orange-600">
          Total: {totalPoints} points
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="relative bg-white border border-gray-300 rounded-md p-5 shadow-sm hover:shadow-md transition-shadow cursor-default"
          >
            {/* Points Badge */}
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                {skill.points} pts
              </span>
            </div>

            {/* Skill Header */}
            <div className="flex items-center gap-3 mb-3 pr-12">
              <div
                className="w-5 h-5 rounded-full flex-shrink-0 border border-gray-300"
                style={{ backgroundColor: skill.color }}
              />
              <span className="font-semibold text-gray-900 text-sm tracking-wide">
                {skill.code}
              </span>
            </div>

            {/* Skill Name */}
            <h4 className="font-medium text-gray-900 text-base mb-1 leading-tight">
              {skill.name}
            </h4>

            {/* Skill Description */}
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {skill.description}
            </p>

            {/* Progress Indicator */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-sm text-gray-500">
              <span>Skill Points</span>
              <span className="font-semibold text-orange-600">+{skill.points}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Skills Summary */}
      <div className="bg-white border border-gray-300 rounded-md p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl select-none">✨</div>
          <h4 className="font-semibold text-gray-900 text-lg">What you'll develop</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-sm">
          {skills.map((skill) => (
            <div key={skill.id} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 border border-gray-300"
                style={{ backgroundColor: skill.color }}
              />
              <span>
                <span className="font-semibold">{skill.code}:</span> {skill.name}
              </span>
              <span className="ml-auto text-xs font-semibold text-gray-500">
                +{skill.points}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-600">
          <span>By participating in this activity, you'll earn:</span>
          <span className="font-semibold text-orange-700">{totalPoints} total skill points</span>
        </div>
      </div>
    </div>
  );
}

// ===== components/ActivitySkillsBadge.tsx =====
// Component เล็กๆ สำหรับแสดงในรายการ Activities

type ActivitySkillsBadgeProps = {
  skills: ActivitySkill[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
};

export function ActivitySkillsBadge({
  skills,
  maxDisplay = 3,
  size = "sm",
}: ActivitySkillsBadgeProps) {
  if (skills.length === 0) return null;

  const displaySkills = skills.slice(0, maxDisplay);
  const remainingCount = Math.max(0, skills.length - maxDisplay);

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  const dotSizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {displaySkills.map((skill) => (
        <span
          key={skill.id}
          className={`inline-flex items-center gap-2 bg-white border border-gray-300 rounded-full font-semibold text-gray-800 ${sizeClasses[size]}`}
        >
          <div
            className={`rounded-full border border-gray-300 ${dotSizeClasses[size]}`}
            style={{ backgroundColor: skill.color }}
          />
          {skill.code}
          <span className="text-gray-500 font-medium">+{skill.points}</span>
        </span>
      ))}

      {remainingCount > 0 && (
        <span
          className={`inline-flex items-center bg-gray-100 text-gray-600 rounded-full border border-gray-300 ${sizeClasses[size]}`}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}
