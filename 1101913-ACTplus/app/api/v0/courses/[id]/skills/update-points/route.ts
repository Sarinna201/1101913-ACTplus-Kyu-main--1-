// app/api/v0/courses/[id]/skills/update-points/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
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
    if (user.role !== "instructor" && user.role !== "staff") {
      return NextResponse.json({ 
        success: false,
        error: "Forbidden" 
      }, { status: 403 });
    }

    const unwrappedParams = await params;
    const courseId = parseInt(unwrappedParams.id, 10);
    const { skillId, points } = await req.json();

    if (isNaN(courseId) || !skillId || !points) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid parameters" 
      }, { status: 400 });
    }

    // Use upsert to avoid race conditions
    const courseSkill = await prisma.course_skills.upsert({
      where: {
        course_id_skill_id: {
          course_id: courseId,
          skill_id: skillId
        }
      },
      update: {
        points: points
      },
      create: {
        course_id: courseId,
        skill_id: skillId,
        points: points
      }
    });

    return NextResponse.json({
      success: true,
      message: "Points updated successfully"
    });

  } catch (error) {
    console.error("Error updating skill points:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 });
  }
}