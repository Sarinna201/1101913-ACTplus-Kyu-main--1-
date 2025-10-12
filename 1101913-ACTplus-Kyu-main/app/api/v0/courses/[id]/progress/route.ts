// app/api/v0/courses/[id]/progress/route.ts
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

    // Get all modules in the course
    const modules = await prisma.modules.findMany({
      where: { cid: courseId },
      select: { id: true, title: true, order: true }
    });

    // Get progress for all modules
    const progress = await prisma.module_progress.findMany({
      where: {
        user_id: user.id,
        course_id: courseId
      },
      include: {
        modules: {
          select: {
            id: true,
            title: true,
            order: true
          }
        }
      },
      orderBy: {
        modules: {
          order: 'asc'
        }
      }
    });

    // Calculate overall progress
    const completedModules = progress.filter(p => p.completed).length;
    const totalModules = modules.length;
    const completionPercentage = totalModules > 0 
      ? Math.round((completedModules / totalModules) * 100) 
      : 0;

    // Calculate average scores
    const testScores = progress.filter(p => p.test_score !== null && p.test_total !== null);
    const averageScore = testScores.length > 0
      ? testScores.reduce((sum, p) => sum + ((p.test_score! / p.test_total!) * 100), 0) / testScores.length
      : 0;

    return NextResponse.json({
      success: true,
      progress: {
        modules: progress,
        totalModules,
        completedModules,
        completionPercentage,
        averageScore: Math.round(averageScore)
      }
    });

  } catch (error) {
    console.error("Error fetching course progress:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch course progress" 
    }, { status: 500 });
  }
}