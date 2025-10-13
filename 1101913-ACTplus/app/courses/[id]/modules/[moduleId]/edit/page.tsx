// app/courses/[id]/modules/[moduleId]/edit/page.tsx
'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ModuleContentEditor from "@/app/components/ModuleContentEditor";

export default function EditModulePage() {
    const { id: courseId, moduleId } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        checkPermission();
    }, [courseId, session]);

    const checkPermission = async () => {
        try {
            if (!session?.user) {
                router.push(`/courses/${courseId}`);
                return;
            }

            const user = session.user as any;

            // Staff สามารถแก้ไขได้ทั้งหมด
            if (user.role === 'staff') {
                setCanEdit(true);
                setLoading(false);
                return;
            }

            // Instructor ต้องเป็นเจ้าของ course
            if (user.role === 'instructor') {
                const res = await fetch(`/api/v0/courses/${courseId}`);
                const data = await res.json();

                if (data.success && data.course.instructor === user.id) {
                    setCanEdit(true);
                } else {
                    router.push(`/courses/${courseId}`);
                }
            } else {
                router.push(`/courses/${courseId}`);
            }
        } catch (error) {
            console.error('Error checking permission:', error);
            router.push(`/courses/${courseId}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!canEdit) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/courses/${courseId}`}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Course
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Module Content</h1>
                    <p className="text-gray-600 mt-2">Create pre-test, add learning video, and test quiz</p>
                </div>

                {/* Module Content Editor */}
                <ModuleContentEditor
                    moduleId={parseInt(moduleId as string)}
                    courseId={parseInt(courseId as string)}
                    canEdit={true}
                />
            </div>
        </div>
    );
}