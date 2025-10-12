// components/SkillCard.tsx
"use client";

type SkillCardProps = {
  code: string;
  name: string;
  description: string;
  color: string;
  totalPoints?: number;
  level?: number;
  lastUpdated?: string;
  showProgress?: boolean;
};

export function SkillCard({
  code,
  name,
  description,
  color,
  totalPoints = 0,
  level = 0,
  lastUpdated,
  showProgress = true
}: SkillCardProps) {
  // คำนวณความก้าวหน้าในระดับปัจจุบัน
  const getLevelProgress = (points: number, currentLevel: number) => {
    if (currentLevel === 0) return 0;
    
    const levelRanges = [
      { min: 0, max: 10 },    // Level 1
      { min: 11, max: 25 },   // Level 2
      { min: 26, max: 50 },   // Level 3
      { min: 51, max: 100 },  // Level 4
      { min: 101, max: 999 }  // Level 5+
    ];
    
    const currentRange = levelRanges[currentLevel - 1];
    if (!currentRange) return 100;
    
    const progress = ((points - currentRange.min) / (currentRange.max - currentRange.min + 1)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const progress = getLevelProgress(totalPoints, level);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          ></div>
          <h3 className="font-semibold text-gray-900">{code}</h3>
        </div>
        {level > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Level</span>
            <span className="text-lg font-bold text-indigo-600">{level}</span>
          </div>
        )}
      </div>
      
      <h4 className="font-medium text-gray-800 mb-2">{name}</h4>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Points: {totalPoints}</span>
            {level > 0 && level < 5 && (
              <span className="text-gray-500">
                Next level: {level === 1 ? 11 : level === 2 ? 26 : level === 3 ? 51 : 101} pts
              </span>
            )}
          </div>
          
          {level > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${progress}%`, 
                  backgroundColor: color 
                }}
              ></div>
            </div>
          )}
          
          {lastUpdated && (
            <p className="text-xs text-gray-400">
              Last updated: {new Date(lastUpdated).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}