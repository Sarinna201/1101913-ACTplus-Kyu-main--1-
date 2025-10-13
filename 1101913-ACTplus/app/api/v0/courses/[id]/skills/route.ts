// app/api/v0/courses/[id]/skills/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - ดึง skills ของ course
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unwrappedParams = await params;
    const courseId = parseInt(unwrappedParams.id, 10);

    if (isNaN(courseId)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid course ID" 
      }, { status: 400 });
    }

    const courseSkills = await prisma.course_skills.findMany({
      where: { course_id: courseId },
      include: {
        skills: true
      }
    });

    const skills = courseSkills.map(cs => ({
      id: cs.skills.id,
      code: cs.skills.code,
      name: cs.skills.name,
      description: cs.skills.description,
      color: cs.skills.color,
      points: cs.points
    }));

    return NextResponse.json({
      success: true,
      skills
    });

  } catch (error) {
    console.error("Error fetching course skills:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// POST - เพิ่ม skill ให้ course
export async function POST(
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

    if (isNaN(courseId)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid course ID" 
      }, { status: 400 });
    }

    const { skillId, points } = await req.json();

    // ตรวจสอบว่า course เป็นของ instructor นี้หรือไม่
    const course = await prisma.courses.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json({ 
        success: false,
        error: "Course not found" 
      }, { status: 404 });
    }

    if (user.role !== "staff" && course.instructor !== user.id) {
      return NextResponse.json({ 
        success: false,
        error: "You can only add skills to your own courses" 
      }, { status: 403 });
    }

    // เพิ่ม skill
    const courseSkill = await prisma.course_skills.create({
      data: {
        course_id: courseId,
        skill_id: skillId,
        points: points || 1
      },
      include: {
        skills: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Skill added to course",
      skill: {
        id: courseSkill.skills.id,
        code: courseSkill.skills.code,
        name: courseSkill.skills.name,
        color: courseSkill.skills.color,
        points: courseSkill.points
      }
    });

  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false,
        error: "This skill is already added to the course" 
      }, { status: 400 });
    }
    console.error("Error adding skill to course:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// DELETE - ลบ skill จาก course
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
    if (user.role !== "instructor" && user.role !== "staff") {
      return NextResponse.json({ 
        success: false,
        error: "Forbidden" 
      }, { status: 403 });
    }

    const unwrappedParams = await params;
    const courseId = parseInt(unwrappedParams.id, 10);
    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get("skillId");

    if (isNaN(courseId) || !skillId) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid parameters" 
      }, { status: 400 });
    }

    await prisma.course_skills.delete({
      where: {
        course_id_skill_id: {
          course_id: courseId,
          skill_id: parseInt(skillId)
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Skill removed from course"
    });

  } catch (error) {
    console.error("Error removing skill from course:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 });
  }
}