// app/api/v0/courses/[id]/enroll/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST - ลงทะเบียนเรียน
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        success: false,
        error: "Please login to enroll in this course" 
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

    // ตรวจสอบว่า course มีอยู่จริง
    const course = await prisma.courses.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json({ 
        success: false,
        error: "Course not found" 
      }, { status: 404 });
    }

    // ตรวจสอบว่าเคยลงทะเบียนแล้วหรือไม่
    const existingEnrollment = await prisma.enrollments_courses.findUnique({
      where: {
        user_id_course_id: {
          user_id: user.id,
          course_id: courseId
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json({ 
        success: false,
        error: "You are already enrolled in this course" 
      }, { status: 400 });
    }

    // สร้าง enrollment
    const enrollment = await prisma.enrollments_courses.create({
      data: {
        user_id: user.id,
        course_id: courseId
      }
    });

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in the course",
      enrollment: {
        id: enrollment.id,
        userId: enrollment.user_id,
        courseId: enrollment.course_id,
        createdAt: enrollment.created_at
      }
    });

  } catch (error: any) {
    console.error("Error enrolling in course:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false,
        error: "You are already enrolled in this course" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false,
      error: "Failed to enroll in course" 
    }, { status: 500 });
  }
}

// DELETE - ยกเลิกการลงทะเบียน
export async function DELETE(
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

    // ลบ enrollment
    await prisma.enrollments_courses.delete({
      where: {
        user_id_course_id: {
          user_id: user.id,
          course_id: courseId
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Successfully unenrolled from the course"
    });

  } catch (error) {
    console.error("Error unenrolling from course:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to unenroll from course" 
    }, { status: 500 });
  }
}

// GET - ตรวจสอบสถานะการลงทะเบียน
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        success: true,
        enrolled: false
      });
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

    const enrollment = await prisma.enrollments_courses.findUnique({
      where: {
        user_id_course_id: {
          user_id: user.id,
          course_id: courseId
        }
      }
    });

    return NextResponse.json({
      success: true,
      enrolled: !!enrollment,
      enrollment: enrollment ? {
        id: enrollment.id,
        enrolledAt: enrollment.created_at
      } : null
    });

  } catch (error) {
    console.error("Error checking enrollment:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to check enrollment status" 
    }, { status: 500 });
  }
}