// components/ActivitySkillsList.tsx
"use client";

import { SkillBadge } from "./SkillBadge";

type ActivitySkill = {
  id: number;
  code: string;
  name: string;
  color: string;
  points: number;
};

type ActivitySkillsListProps = {
  skills: ActivitySkill[];
  size?: "sm" | "md" | "lg";
  showPoints?: boolean;
};

export function ActivitySkillsList({
  skills,
  size = "md",
  showPoints = true,
}: ActivitySkillsListProps) {
  if (skills.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic select-none">No skills assigned</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {skills.map((skill) => (
        <SkillBadge
          key={skill.id}
          code={skill.code}
          name={skill.name}
          color={skill.color}
          points={skill.points}
          size={size}
          showPoints={showPoints}
        />
      ))}
    </div>
  );
}
