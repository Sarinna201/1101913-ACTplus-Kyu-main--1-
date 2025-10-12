// app/courses/[id]/edit/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import EditCourseForm from '@/app/components/EditCourseForm';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchCourse();
    }
  }, [status, params.id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v0/courses/${params.id}`);
      const data = await res.json();

      if (data.success) {
        setCourse(data.course);

        // Check authorization
        const currentUser = session?.user as any;
        const canEdit = currentUser?.role === 'staff' || 
                       (currentUser?.role === 'instructor' && data.course.instructor === currentUser.id);
        
        setAuthorized(canEdit);

        if (!canEdit) {
          alert('You do not have permission to edit this course');
          router.push(`/courses/${params.id}`);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Failed to load course');
      router.push('/courses');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!authorized || !course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/courses/${params.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Course
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
              <p className="text-gray-600">Update course information and contents</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <EditCourseForm
            courseId={course.id}
            initialData={{
              title: course.title,
              description: course.description,
              category: course.category,
              level: course.level,
              duration: course.duration,
              contents: course.contents
            }}
          />
        </div>
      </div>
    </div>
  );
}