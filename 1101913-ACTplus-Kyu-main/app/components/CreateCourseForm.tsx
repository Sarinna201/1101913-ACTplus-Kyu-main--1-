// components/CreateCourseForm.tsx
'use client';

import dynamic from "next/dynamic";
import { useState, FormEvent, useRef } from "react";
import { useSession } from "next-auth/react";
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

type CreateCourseFormProps = {
  onSuccess: (course: any) => void;
  onCancel: () => void;
};

export default function CreateCourseForm({ onSuccess, onCancel }: CreateCourseFormProps) {
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const [courseContent, setCourseContent] = useState('');
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addModule = () => {
    setModules(prev => [
      ...prev,
      { 
        id: Date.now(), 
        title: '', 
        summary: '', 
        duration: '', 
        order: prev.length + 1, 
        contents: '' 
      }
    ]);
  };

  const handleModuleChange = (id: number, key: string, value: string) => {
    setModules(prev =>
      prev.map(m => (m.id === id ? { ...m, [key]: value } : m))
    );
  };

  const removeModule = (id: number) => {
    setModules(prev => prev.filter(m => m.id !== id));
  };

  const createCourse = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setMessage('');

    try {
      const formdata = new FormData(e.currentTarget);
      formdata.append('contents', courseContent);
      formdata.append('modules', JSON.stringify(modules));

      const res = await fetch('/api/v0/courses', {
        method: 'POST',
        body: formdata
      });

      const data = await res.json();

      if (data.success) {
        setMessage('Course created successfully!');
        
        setCourseContent('');
        setModules([]);
        
        if (formRef.current) {
          formRef.current.reset();
        }
        
        setTimeout(() => {
          onSuccess(data.course);
        }, 1000);
      } else {
        setMessage(data.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      setMessage('An error occurred while creating the course');
    } finally {
      setLoading(false);
    }
  };

  const quillModules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: async function (this: any) {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          input.onchange = async () => {
            if (!input.files) return;
            const file = input.files[0];
            const formData = new FormData();
            formData.append('image', file);
            
            try {
              const res = await fetch('/api/v1/courses/upload', { 
                method: 'POST', 
                body: formData 
              });
              const data = await res.json();
              if (data.url) {
                const range = this.quill.getSelection();
                this.quill.insertEmbed(range.index, 'image', data.url);
              }
            } catch (error) {
              console.error('Error uploading image:', error);
              alert('Failed to upload image');
            }
          };
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-300 p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-semibold text-black mb-8 border-b border-gray-300 pb-2">
        Create New Course
      </h2>

      <form ref={formRef} onSubmit={createCourse} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Course Title <span className="text-orange-600">*</span>
          </label>
          <input
            type="text"
            name="title"
            placeholder="e.g., Introduction to Web Development"
            required
            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black placeholder-gray-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Description
          </label>
          <input
            type="text"
            name="description"
            placeholder="Brief description of the course"
            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black placeholder-gray-400"
          />
        </div>

        {/* Category & Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Category
            </label>
            <select
              name="category"
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
            >
              <option value="Web Developer">Web Developer</option>
              <option value="Fullstack Developer">Fullstack Developer</option>
              <option value="Game Developer">Game Developer</option>
              <option value="Electrical Engineer">Electrical Engineer</option>
              <option value="Software Engineer">Software Engineer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Level <span className="text-orange-600">*</span>
            </label>
            <select
              name="level"
              required
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Duration <span className="text-orange-600">*</span>
          </label>
          <input
            name="duration"
            type="text"
            placeholder="e.g., 8 weeks, 40 hours"
            required
            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black placeholder-gray-400"
          />
        </div>

        {/* Course Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Course Content <span className="text-orange-600">*</span>
          </label>
          <div className="border border-gray-400 rounded-lg overflow-hidden">
            <ReactQuill
              theme="snow"
              value={courseContent}
              onChange={setCourseContent}
              modules={quillModules}
              className="bg-white"
              placeholder="Write about the course objectives, what students will learn, prerequisites, etc."
            />
          </div>
        </div>

        {/* Modules Section */}
        <div className="border-t border-gray-300 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-black">Course Modules</h3>
            <button
              type="button"
              onClick={addModule}
              className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Module
            </button>
          </div>

          <div className="space-y-6">
            {modules.map((m, i) => (
              <div key={m.id} className="border border-gray-300 p-6 rounded-lg bg-gray-50 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-black text-lg">Module #{i + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeModule(m.id)}
                    className="text-orange-600 hover:text-orange-800 text-sm font-semibold transition"
                  >
                    Remove
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Module Title"
                  value={m.title}
                  onChange={e => handleModuleChange(m.id, 'title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black placeholder-gray-500"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Summary"
                    value={m.summary}
                    onChange={e => handleModuleChange(m.id, 'summary', e.target.value)}
                    className="px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g., 2 hours)"
                    value={m.duration}
                    onChange={e => handleModuleChange(m.id, 'duration', e.target.value)}
                    className="px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black placeholder-gray-500"
                  />
                </div>

                <div className="border border-gray-400 rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={m.contents}
                    onChange={val => handleModuleChange(m.id, 'contents', val)}
                    modules={quillModules}
                    className="bg-white"
                    placeholder="Module content, lessons, and materials..."
                  />
                </div>
              </div>
            ))}

            {modules.length === 0 && (
              <p className="text-center text-gray-500 py-12 italic">
                No modules added yet. Click "Add Module" to create one.
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg text-center ${
            message.toLowerCase().includes('success') 
              ? 'bg-orange-100 text-orange-800 border border-orange-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Course...' : 'Create Course'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-400 text-gray-800 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
