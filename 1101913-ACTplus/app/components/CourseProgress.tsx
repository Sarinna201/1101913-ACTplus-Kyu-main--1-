// components/CourseProgress.tsx
'use client';

import { useEffect, useState } from 'react';

type CourseProgressProps = {
  courseId: number;
  isEnrolled: boolean;
};

type ModuleProgress = {
  id: number;
  module_id: number;
  pre_test_score: number | null;
  pre_test_total: number | null;
  test_score: number | null;
  test_total: number | null;
  video_completed: boolean;
  completed: boolean;
  completed_at: string | null;
  modules: {
    id: number;
    title: string;
    order: number;
  };
};

export default function CourseProgress({ courseId, isEnrolled }: CourseProgressProps) {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isEnrolled) {
      fetchProgress();
    }
  }, [courseId, isEnrolled]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v0/courses/${courseId}/progress`);
      const data = await res.json();
      
      if (data.success) {
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isEnrolled || loading) {
    return null;
  }

  if (!progress) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Your Progress</h3>

      {/* Overall Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-600 font-medium">Completion</span>
            <span className="text-2xl font-bold text-blue-900">{progress.completionPercentage}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress.completionPercentage}%` }}
            />
          </div>
          <p className="text-xs text-blue-600 mt-2">
            {progress.completedModules} of {progress.totalModules} modules
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-600 font-medium">Average Score</span>
            <span className="text-2xl font-bold text-green-900">{progress.averageScore}%</span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${progress.averageScore}%` }}
            />
          </div>
          <p className="text-xs text-green-600 mt-2">
            Based on test quizzes
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-600 font-medium">Modules</span>
            <span className="text-2xl font-bold text-purple-900">
              {progress.completedModules}/{progress.totalModules}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-purple-600">
              {progress.completedModules} completed
            </span>
          </div>
        </div>
      </div>

      {/* Module-by-Module Progress */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Module Progress</h4>
        <div className="space-y-2">
          {progress.modules.map((moduleProgress: ModuleProgress, index: number) => (
            <div 
              key={moduleProgress.id}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                moduleProgress.completed 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {moduleProgress.completed ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">{moduleProgress.modules.order}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">
                  {moduleProgress.modules.title}
                </p>
                <div className="flex items-center gap-4 mt-1">
                  {moduleProgress.pre_test_score !== null && (
                    <span className="text-xs text-gray-600">
                      Pre-test: {moduleProgress.pre_test_score}/{moduleProgress.pre_test_total}
                    </span>
                  )}
                  {moduleProgress.video_completed && (
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      Video watched
                    </span>
                  )}
                  {moduleProgress.test_score !== null && (
                    <span className={`text-xs font-semibold ${
                      ((moduleProgress.test_score / moduleProgress.test_total!) * 100) >= 70
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}>
                      Test: {moduleProgress.test_score}/{moduleProgress.test_total} 
                      ({Math.round((moduleProgress.test_score / moduleProgress.test_total!) * 100)}%)
                    </span>
                  )}
                </div>
              </div>

              {moduleProgress.completed && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}