// components/CourseSkillsManager.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

type Skill = {
  id: number;
  code: string;
  name: string;
  description: string;
  color: string;
};

type SelectedSkill = {
  skillId: number;
  points: number;
};

type CourseSkillsManagerProps = {
  courseId: number;
  canEdit: boolean;
};

export default function CourseSkillsManager({ courseId, canEdit }: CourseSkillsManagerProps) {
  const [courseSkills, setCourseSkills] = useState<SelectedSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Debounce timer for points update
  const pointsTimers = useRef<Record<number, NodeJS.Timeout>>({});
  
  // Track ongoing operations to prevent duplicates
  const pendingOperations = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchCourseSkills();
    fetchAllSkills();
  }, [courseId]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(pointsTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const fetchCourseSkills = async () => {
    try {
      const res = await fetch(`/api/v0/courses/${courseId}/skills`);
      const data = await res.json();
      if (data.success) {
        const selected: SelectedSkill[] = data.skills.map((s: any) => ({
          skillId: s.id,
          points: s.points
        }));
        setCourseSkills(selected);
      }
    } catch (error) {
      console.error('Error fetching course skills:', error);
    }
  };

  const fetchAllSkills = async () => {
    try {
      const res = await fetch('/api/v0/skills');
      const data = await res.json();
      setAllSkills(data);
    } catch (error) {
      console.error('Error fetching all skills:', error);
    }
  };

  const handleSkillToggle = async (skillId: number) => {
    const operationKey = `toggle-${skillId}`;
    
    // Prevent duplicate operations
    if (pendingOperations.current.has(operationKey)) {
      return;
    }
    
    pendingOperations.current.add(operationKey);
    
    const isSelected = courseSkills.some(s => s.skillId === skillId);
    
    if (isSelected) {
      // Optimistic update - remove locally first
      setCourseSkills(courseSkills.filter(s => s.skillId !== skillId));
      
      try {
        const res = await fetch(`/api/v0/courses/${courseId}/skills?skillId=${skillId}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        
        if (!data.success) {
          // Rollback on error
          setCourseSkills(prev => [...prev, { skillId, points: 1 }]);
          alert(data.error);
        }
      } catch (error) {
        // Rollback on error
        setCourseSkills(prev => [...prev, { skillId, points: 1 }]);
        console.error('Error removing skill:', error);
      }
    } else {
      // Optimistic update - add locally first
      setCourseSkills(prev => [...prev, { skillId, points: 1 }]);
      
      try {
        const res = await fetch(`/api/v0/courses/${courseId}/skills`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillId, points: 1 })
        });
        const data = await res.json();
        
        if (!data.success) {
          // Rollback on error
          setCourseSkills(prev => prev.filter(s => s.skillId !== skillId));
          alert(data.error);
        }
      } catch (error) {
        // Rollback on error
        setCourseSkills(prev => prev.filter(s => s.skillId !== skillId));
        console.error('Error adding skill:', error);
      }
    }
    
    pendingOperations.current.delete(operationKey);
  };

  const handleSkillPointsChange = (skillId: number, points: number) => {
    const validPoints = Math.max(1, Math.min(10, points));
    
    // Update UI immediately (optimistic update)
    setCourseSkills(
      courseSkills.map(s => 
        s.skillId === skillId ? { ...s, points: validPoints } : s
      )
    );

    // Clear existing timer for this skill
    if (pointsTimers.current[skillId]) {
      clearTimeout(pointsTimers.current[skillId]);
    }

    // Debounce: wait 500ms before sending to server
    pointsTimers.current[skillId] = setTimeout(async () => {
      const operationKey = `points-${skillId}`;
      
      if (pendingOperations.current.has(operationKey)) {
        return;
      }
      
      pendingOperations.current.add(operationKey);
      
      try {
        // Use upsert approach via API
        const res = await fetch(`/api/v0/courses/${courseId}/skills/update-points`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillId, points: validPoints })
        });
        
        const data = await res.json();
        
        if (!data.success) {
          console.error('Failed to update points:', data.error);
          // Optionally rollback or refetch
          fetchCourseSkills();
        }
      } catch (error) {
        console.error('Error updating skill points:', error);
        // Optionally refetch to sync
        fetchCourseSkills();
      } finally {
        pendingOperations.current.delete(operationKey);
        delete pointsTimers.current[skillId];
      }
    }, 500); // 500ms debounce
  };

  if (!canEdit && courseSkills.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Skills You'll Learn</h3>
        {canEdit && (
          <p className="text-sm text-gray-600">
            Select skills that students will develop through this course
          </p>
        )}
      </div>

      {canEdit ? (
        <>
          {/* Skills Grid for Editing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allSkills.map(skill => {
              const isSelected = courseSkills.some(s => s.skillId === skill.id);
              const selectedSkill = courseSkills.find(s => s.skillId === skill.id);
              
              return (
                <div 
                  key={skill.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleSkillToggle(skill.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: skill.color }}
                        ></div>
                        <span className="font-medium text-sm">{skill.code}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSkillToggle(skill.id)}
                          className="ml-auto"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{skill.name}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{skill.description}</p>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-indigo-200">
                      <label className="block text-xs font-medium text-indigo-700 mb-1">
                        Points (1-10):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={selectedSkill?.points || 1}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSkillPointsChange(skill.id, parseInt(e.target.value) || 1);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-20 px-2 py-1 text-xs border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Skills Summary */}
          {courseSkills.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Selected Skills Summary:</h4>
              <div className="flex flex-wrap gap-2">
                {courseSkills.map(selectedSkill => {
                  const skill = allSkills.find(s => s.id === selectedSkill.skillId);
                  return skill ? (
                    <span 
                      key={skill.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white border rounded-full text-sm text-gray-900"
                    >
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: skill.color }}
                      ></div>
                      {skill.code}
                      <span className="text-xs text-gray-900">({selectedSkill.points} pts)</span>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Display Only - For Students */}
          {courseSkills.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No skills specified for this course</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {courseSkills.map(selectedSkill => {
                const skill = allSkills.find(s => s.id === selectedSkill.skillId);
                return skill ? (
                  <div
                    key={skill.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: skill.color }}
                    >
                      {skill.code.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{skill.name}</p>
                      <p className="text-xs text-gray-600">
                        {skill.code} • {selectedSkill.points} points
                      </p>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}