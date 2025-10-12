// components/SkillBadge.tsx
"use client";

type SkillBadgeProps = {
  code: string;
  name: string;
  color: string;
  points?: number;
  size?: 'sm' | 'md' | 'lg';
  showPoints?: boolean;
};

export function SkillBadge({ 
  code, 
  name, 
  color, 
  points, 
  size = 'md', 
  showPoints = false 
}: SkillBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium text-white ${sizeClasses[size]}`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {code}
      {showPoints && points && (
        <span className="ml-1 font-bold">+{points}</span>
      )}
    </span>
  );
}