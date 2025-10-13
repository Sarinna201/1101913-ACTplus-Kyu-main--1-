// app/api/v0/courses/[id]/enrollments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - ดูรายการนักเรียนที่ลงทะเบียน (สำหรับ instructor/staff)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        success: false,
        error: "Unauthorized" 
      }, { status: 401 });
    }

    const user = session.user as any;
    const unwrappedParams = await params;
    const courseId = parseInt(unwrappedParams.id, 10);

    if (isNaN(courseId)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid course ID" 
      }, { status: 400 });
    }

    // ตรวจสอบว่าเป็น instructor/staff และเป็นเจ้าของ course หรือไม่
    const course = await prisma.courses.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json({ 
        success: false,
        error: "Course not found" 
      }, { status: 404 });
    }

    if (user.role !== 'staff' && course.instructor !== user.id) {
      return NextResponse.json({ 
        success: false,
        error: "You don't have permission to view enrollments" 
      }, { status: 403 });
    }

    // ดึงรายการนักเรียน
    const enrollments = await prisma.enrollments_courses.findMany({
      where: { course_id: courseId },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            imageUrl: true,
            role: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      enrollments: enrollments.map(e => ({
        id: e.id,
        enrolledAt: e.created_at,
        student: {
          id: e.users.id,
          username: e.users.username,
          email: e.users.email,
          imageUrl: e.users.imageUrl,
          role: e.users.role
        }
      })),
      total: enrollments.length
    });

  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch enrollments" 
    }, { status: 500 });
  }
}