// components/ModuleContentEditor.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

type ModuleContent = {
  id: number;
  title: string;
  summary?: string;
  duration?: string;
  contents?: string;
  preTestQuiz: Question[] | null;
  learningVideo: string | null;
  testQuiz: Question[] | null;
};

type ModuleContentEditorProps = {
  moduleId: number;
  courseId: number;
  canEdit: boolean;
};

export default function ModuleContentEditor({ 
  moduleId, 
  courseId, 
  canEdit 
}: ModuleContentEditorProps) {
  const [module, setModule] = useState<ModuleContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'pretest' | 'video' | 'test'>('pretest');

  // Pre-test state
  const [preTestQuestions, setPreTestQuestions] = useState<Question[]>([]);
  
  // Video state
  const [videoUrl, setVideoUrl] = useState('');
  
  // Test state
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchModuleContent();
  }, [moduleId]);

  const fetchModuleContent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v0/modules/${moduleId}/content`);
      const data = await res.json();
      
      if (data.success) {
        setModule(data.module);
        setPreTestQuestions(data.module.preTestQuiz || []);
        setVideoUrl(data.module.learningVideo || '');
        setTestQuestions(data.module.testQuiz || []);
      }
    } catch (error) {
      console.error('Error fetching module content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/v0/modules/${moduleId}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preTestQuiz: preTestQuestions.length > 0 ? preTestQuestions : null,
          learningVideo: videoUrl || null,
          testQuiz: testQuestions.length > 0 ? testQuestions : null
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Module content saved successfully!');
      } else {
        alert(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving module content:', error);
      alert('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  // Question management functions
  const addQuestion = (type: 'pretest' | 'test') => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };

    if (type === 'pretest') {
      setPreTestQuestions([...preTestQuestions, newQuestion]);
    } else {
      setTestQuestions([...testQuestions, newQuestion]);
    }
  };

  const updateQuestion = (
    type: 'pretest' | 'test',
    id: string,
    field: keyof Question,
    value: any
  ) => {
    const updateFunc = type === 'pretest' ? setPreTestQuestions : setTestQuestions;
    const questions = type === 'pretest' ? preTestQuestions : testQuestions;

    updateFunc(
      questions.map(q =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const updateOption = (
    type: 'pretest' | 'test',
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    const updateFunc = type === 'pretest' ? setPreTestQuestions : setTestQuestions;
    const questions = type === 'pretest' ? preTestQuestions : testQuestions;

    updateFunc(
      questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, idx) =>
                idx === optionIndex ? value : opt
              )
            }
          : q
      )
    );
  };

  const deleteQuestion = (type: 'pretest' | 'test', id: string) => {
    if (!confirm('Delete this question?')) return;

    if (type === 'pretest') {
      setPreTestQuestions(preTestQuestions.filter(q => q.id !== id));
    } else {
      setTestQuestions(testQuestions.filter(q => q.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-gray-900">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Edit Module Content</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('pretest')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'pretest'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pre-Test Quiz ({preTestQuestions.length})
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'video'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Learning Video
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'test'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Test Quiz ({testQuestions.length})
        </button>
      </div>

      {/* Pre-Test Tab */}
      {activeTab === 'pretest' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Pre-test to assess students prior knowledge</p>
            <button
              onClick={() => addQuestion('pretest')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              + Add Question
            </button>
          </div>

          <div className="space-y-6">
            {preTestQuestions.map((question, qIndex) => (
              <QuestionEditor
                key={question.id}
                question={question}
                index={qIndex}
                type="pretest"
                onUpdate={updateQuestion}
                onUpdateOption={updateOption}
                onDelete={deleteQuestion}
              />
            ))}

            {preTestQuestions.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No pre-test questions yet. Click Add Question to create one.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Video Tab */}
      {activeTab === 'video' && (
        <div>
          <p className="text-gray-600 mb-4">Add a learning video for this module</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Video URL</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports YouTube, Vimeo, and direct video URLs
              </p>
            </div>

            {videoUrl && (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <VideoPreview url={videoUrl} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Tab */}
      {activeTab === 'test' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">Test quiz to evaluate students learning</p>
            <button
              onClick={() => addQuestion('test')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              + Add Question
            </button>
          </div>

          <div className="space-y-6">
            {testQuestions.map((question, qIndex) => (
              <QuestionEditor
                key={question.id}
                question={question}
                index={qIndex}
                type="test"
                onUpdate={updateQuestion}
                onUpdateOption={updateOption}
                onDelete={deleteQuestion}
              />
            ))}

            {testQuestions.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No test questions yet. Click Add Question to create one.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Question Editor Component
function QuestionEditor({
  question,
  index,
  type,
  onUpdate,
  onUpdateOption,
  onDelete
}: {
  question: Question;
  index: number;
  type: 'pretest' | 'test';
  onUpdate: (type: 'pretest' | 'test', id: string, field: keyof Question, value: any) => void;
  onUpdateOption: (type: 'pretest' | 'test', questionId: string, optionIndex: number, value: string) => void;
  onDelete: (type: 'pretest' | 'test', id: string) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-lg">Question {index + 1}</h4>
        <button
          onClick={() => onDelete(type, question.id)}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Delete
        </button>
      </div>

      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium mb-2">Question</label>
          <textarea
            value={question.question}
            onChange={(e) => onUpdate(type, question.id, 'question', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Enter your question..."
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium mb-2">Options</label>
          <div className="space-y-2">
            {question.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={question.correctAnswer === optIndex}
                  onChange={() => onUpdate(type, question.id, 'correctAnswer', optIndex)}
                  className="w-4 h-4 text-orange-500"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => onUpdateOption(type, question.id, optIndex, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder={`Option ${optIndex + 1}`}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Select the correct answer by clicking the radio button
          </p>
        </div>

        {/* Explanation (optional) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={question.explanation || ''}
            onChange={(e) => onUpdate(type, question.id, 'explanation', e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Explain why this is the correct answer..."
          />
        </div>
      </div>
    </div>
  );
}

// Video Preview Component
function VideoPreview({ url }: { url: string }) {
  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtube.com')
        ? url.split('v=')[1]?.split('&')[0]
        : url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    // Direct video URL
    return url;
  };

  const embedUrl = getEmbedUrl(url);
  const isDirect = !url.includes('youtube.com') && !url.includes('vimeo.com') && !url.includes('youtu.be');

  if (isDirect) {
    return (
      <video controls className="w-full max-h-96 rounded-lg">
        <source src={embedUrl} />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={embedUrl}
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}