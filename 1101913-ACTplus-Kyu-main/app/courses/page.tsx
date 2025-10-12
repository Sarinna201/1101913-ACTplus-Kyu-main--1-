// app/courses/page.tsx
'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import CreateCourseForm from "@/app/components/CreateCourseForm";
import CourseCard from "@/app/components/CourseCard";
import CourseFilters from "@/app/components/CourseFilters";
import CoursesHeader from "@/app/components/CoursesHeader";

type Course = {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  instructor: number;
  instructorName?: string;
  rating?: number;
  createdAt: string;
};

export default function CoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const canCreateCourse =
    session?.user?.role === "instructor" || session?.user?.role === "staff";

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v0/courses");
      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await res.json();

      if (data.success) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreated = (newCourse: any) => {
    setCourses((prev) => [newCourse, ...prev]);
    setShowCreateForm(false);
  };

  const filteredCourses = courses.filter((course) => {
    const matchSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchLevel = levelFilter === "all" || course.level === levelFilter;

    return matchSearch && matchCategory && matchLevel;
  });

  const categories = Array.from(new Set(courses.map((c) => c.category)));
  const levels = Array.from(new Set(courses.map((c) => c.level)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <CoursesHeader
          canCreateCourse={canCreateCourse}
          showCreateForm={showCreateForm}
          toggleCreateForm={() => setShowCreateForm(!showCreateForm)}
        />

        {showCreateForm && canCreateCourse && (
          <div className="mb-10">
            <CreateCourseForm
              onSuccess={handleCourseCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        <CourseFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          categories={categories}
          levels={levels}
        />

        <div className="mb-6">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-semibold">{filteredCourses.length}</span> of{" "}
            <span className="font-semibold">{courses.length}</span> courses
          </p>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or create a new course</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
