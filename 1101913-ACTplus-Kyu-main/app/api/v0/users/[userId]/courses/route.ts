import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> } // 👈 params เป็น Promise
) {
  const { userId } = await context.params; // ✅ ต้อง await
  const uid = Number(userId);

  try {
    const courses = await prisma.enrollments_courses.findMany({
      where: { user_id: uid },
      select: {
        id: true,
        created_at: true,
        courses: {
          select: {
            id: true,
            title: true,
            category: true,
            level: true,
          },
        },
      },
    });

    const enrolledCourses = courses.map((e) => e.courses);

    return NextResponse.json({ success: true, courses: enrolledCourses });
  } catch (err) {
    console.error("Get Enrolled Courses Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
