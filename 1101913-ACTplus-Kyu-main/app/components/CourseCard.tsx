// components/CourseCard.tsx
import Link from "next/link";

type Course = {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  instructorName?: string;
  rating?: number | null;
};

type CourseCardProps = {
  course: Course;
  hasCertificate?: boolean;
};

// ฟังก์ชันช่วยแปลง level เป็นสีแบคกราวน์และข้อความ
const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "beginner":
      return "bg-green-100 text-green-800";
    case "intermediate":
      return "bg-yellow-100 text-yellow-800";
    case "advanced":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// คอมโพเนนต์ Badge แสดง Certified
function CertificateBadge() {
  return (
    <div className="absolute top-3 right-3 z-10">
      <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg select-none pointer-events-none">
        <span>🏆</span>
        <span>Certified</span>
      </div>
    </div>
  );
}

// คอมโพเนนต์ แสดงระดับความยากของคอร์ส (level)
function LevelBadge({ level }: { level: string }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(
        level
      )}`}
    >
      {level}
    </span>
  );
}

// คอมโพเนนต์ แสดงคะแนน rating ถ้ามี
function RatingBadge({ rating }: { rating?: number | null }) {
  if (typeof rating !== "number") return null;
  return (
    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full select-none">
      <span className="text-yellow-400">⭐</span>
      <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
    </div>
  );
}

// คอมโพเนนต์ แสดงข้อมูลรายละเอียด (category, duration, instructor) แทนไอคอนด้วยข้อความ
function CourseDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1 text-sm text-gray-700">
      <span className="font-semibold text-gray-600">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

export default function CourseCard({ course, hasCertificate }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} className="group block relative h-full">
      <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden transition-all hover:shadow-lg hover:border-orange-300 relative flex flex-col h-full">
        {/* Certificate Badge */}
        {hasCertificate && <CertificateBadge />}

        {/* Header Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 flex-shrink-0">
          <div className="flex items-start justify-between mb-2">
            <LevelBadge level={course.level} />
            <RatingBadge rating={course.rating} />
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-orange-100 transition line-clamp-2">
            {course.title}
          </h3>
        </div>

        {/* Content Section */}
        <div className="p-6 flex-grow flex flex-col justify-between">
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">
            {course.description}
          </p>

          <div className="space-y-2 mb-4">
            <CourseDetail label="Class" value={course.category} />
            <CourseDetail label="Duration" value={course.duration} />
            <CourseDetail label="Teacher" value={course.instructorName ?? "Unknown"} />
          </div>

          <button className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition group-hover:bg-orange-700">
            View Course
          </button>
        </div>
      </div>
    </Link>
  );
}
