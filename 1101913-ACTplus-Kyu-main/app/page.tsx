"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Star,
  Users,
  Award,
  CheckCircle,
} from "lucide-react";

// Type definitions
type Course = {
  id: number;
  title: string;
  description: string;
  category?: string;
  level?: string;
  rating?: number;
  instructorName?: string;
};

type Activity = {
  id: number;
  title: string;
  detail: string;
  imageUrl?: string;
  dateStart: string;
  dateEnd?: string;
};

export default function HomePage() {
  const { data: session } = useSession();
  const [topCourses, setTopCourses] = useState<Course[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      // Fetch courses
      const resCourses = await fetch("/api/v0/courses");
      if (resCourses.ok) {
        const data = await resCourses.json();
        const sorted = [...data.courses]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4);
        setTopCourses(sorted);
      }

      // Fetch activities
      const resActivities = await fetch("/api/v0/activities?pageSize=3&page=1");
      if (resActivities.ok) {
        const data = await resActivities.json();
        const mapped = data.items.map((a: any) => ({
          id: a.id,
          title: a.title,
          detail: a.detail,
          imageUrl: a.imageUrl,
          dateStart: a.start_date,
          dateEnd: a.end_date,
        }));
        setRecentActivities(mapped);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const levelBadge = (level?: string) => {
    const base = "inline-block rounded px-2 py-0.5 text-xs font-medium";
    switch (level?.toLowerCase()) {
      case "beginner":
        return <span className={`${base} bg-green-100 text-green-700`}>Level: Beginner</span>;
      case "intermediate":
        return <span className={`${base} bg-yellow-100 text-yellow-800`}>Level: Intermediate</span>;
      case "advanced":
        return <span className={`${base} bg-red-100 text-red-700`}>Level: Advanced</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-700`}>Level: -</span>;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ---------------- Hero Section ---------------- */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          backgroundImage: "url('/uploads/images/bg-home.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            Welcome To <span className="text-orange-400">ACT+</span>
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow">
            platform for student development, learning, participation in activities and creating your learning records.
          </p>

          {session?.user && (
            <div className="mb-8 bg-white/30 px-6 py-3 rounded-full backdrop-blur-md inline-block text-black font-medium">
              Hello, <strong>{session.user.username}</strong> 👋
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/courses"
              className="inline-flex items-center px-8 py-4 bg-white text-orange-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Start Learning
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- How It Works Section (moved up) ---------------- */}
              <section
        className="py-20 text-gray-800"
        style={{
          background: "linear-gradient(to bottom, #fff7ed, #ffffff)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12 text-orange-600">
          Get started easily in just 3 steps.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-left">
            <div className="flex flex-col items-center text-center border-2 border-orange-500 rounded-2xl p-6 bg-white shadow-md hover:shadow-lg transition">
              <Users className="w-12 h-12 mb-4 text-orange-500" />
              <h3 className="font-semibold text-lg mb-2 text-gray-800">
                1. Apply for membership
              </h3>
              <p className="text-gray-600">
            Create an ACT+ account to start learning and participating in activities.
              </p>
            </div>

            <div className="flex flex-col items-center text-center border-2 border-orange-500 rounded-2xl p-6 bg-white shadow-md hover:shadow-lg transition">
              <BookOpen className="w-12 h-12 mb-4 text-orange-500" />
              <h3 className="font-semibold text-lg mb-2 text-gray-800">
                2. Choose a course or activity
              </h3>
              <p className="text-gray-600">
                Find a topic that interests you and start learning or participating right away.
              </p>
            </div>

            <div className="flex flex-col items-center text-center border-2 border-orange-500 rounded-2xl p-6 bg-white shadow-md hover:shadow-lg transition">
              <Award className="w-12 h-12 mb-4 text-orange-500" />
              <h3 className="font-semibold text-lg mb-2 text-gray-800">
                3. Receive a certificate
              </h3>
              <p className="text-gray-600">
                Upon completion of studies or participation in an activity, receive a certificate and record it on your transcript.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ---------------- Popular Courses ---------------- */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Top courses</h2>
          <p className="text-gray-600 mb-12">Choose from the highest quality courses.</p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 h-48 rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topCourses.map((c) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.id}`}
                  className="flex flex-col justify-between rounded-2xl border border-orange-100 bg-white p-5 shadow-md hover:shadow-xl transition-shadow duration-300 group"
                >
                  <div className="flex flex-col gap-3">
                    <h3 className="font-semibold text-orange-900 text-lg line-clamp-2 group-hover:text-orange-600 transition">
                      {c.title}
                    </h3>
                    <p className="text-gray-700 text-sm line-clamp-3">{c.description}</p>
                    <div className="flex justify-between items-center text-sm mt-2">
                      {levelBadge(c.level)}
                      {c.rating && (
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 mr-1" />
                          {c.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="mt-4 text-orange-600 font-medium flex items-center justify-end text-sm">
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- Recent Activities ---------------- */}
      {recentActivities.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Latest activity</h2>
            <p className="text-gray-600 mb-12">
             Participate in fun activities from various faculties and clubs.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentActivities.map((a) => (
                <Link
                  key={a.id}
                  href={`/activities/${a.id}`}
                  className="rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg transition"
                >
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: a.imageUrl
                        ? `url(${a.imageUrl})`
                        : "linear-gradient(to right, #f97316, #fb923c)",
                    }}
                  />
                  <div className="p-5 text-left">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">{a.detail}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(a.dateStart).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- CTA Section ---------------- */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Ready to start your learning journey?
          </h2>
          <p className="text-gray-600 mb-10">
           Join the ACT+ community to enhance your skills and develop your potential.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition-all duration-200 shadow-lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Sign up for free
          </Link>
        </div>
      </section>
    </main>
  );
}
