// app/courses/components/CoursesHeader.tsx

type Props = {
  canCreateCourse: boolean;
  showCreateForm: boolean;
  toggleCreateForm: () => void;
};

export default function CoursesHeader({ canCreateCourse, showCreateForm, toggleCreateForm }: Props) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Our Courses</h1>
          <p className="text-gray-600 text-lg">
            Discover and learn new skills with our comprehensive courses
          </p>
        </div>

        {canCreateCourse && (
          <button
            onClick={toggleCreateForm}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showCreateForm ? "Close Form" : "Create Course"}
          </button>
        )}
      </div>
    </div>
  );
}
