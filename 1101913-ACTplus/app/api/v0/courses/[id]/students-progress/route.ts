// app/api/v0/courses/[id]/students-progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    // Check if user is instructor/staff
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
        error: "You don't have permission to view student progress" 
      }, { status: 403 });
    }

    // Get all enrolled students
    const enrollments = await prisma.enrollments_courses.findMany({
      where: { course_id: courseId },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            imageUrl: true
          }
        }
      }
    });

    // Get progress for each student
    const studentsProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const progress = await prisma.module_progress.findMany({
          where: {
            user_id: enrollment.user_id,
            course_id: courseId
          }
        });

        const totalModules = await prisma.modules.count({
          where: { cid: courseId }
        });

        const completedModules = progress.filter(p => p.completed).length;
        const completionPercentage = totalModules > 0 
          ? Math.round((completedModules / totalModules) * 100) 
          : 0;

        const testScores = progress.filter(p => p.test_score !== null && p.test_total !== null);
        const averageScore = testScores.length > 0
          ? testScores.reduce((sum, p) => sum + ((p.test_score! / p.test_total!) * 100), 0) / testScores.length
          : 0;

        return {
          student: enrollment.users,
          enrolledAt: enrollment.created_at,
          totalModules,
          completedModules,
          completionPercentage,
          averageScore: Math.round(averageScore),
          moduleProgress: progress
        };
      })
    );

    return NextResponse.json({
      success: true,
      students: studentsProgress,
      total: studentsProgress.length
    });

  } catch (error) {
    console.error("Error fetching students progress:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch students progress" 
    }, { status: 500 });
  }
}