// app/api/v0/courses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          select: {
            id: true,
            title: true,
            summary: true,
            duration: true,
            order: true,
            contents: true // เพิ่ม contents เพื่อให้ expand ได้
          },
          orderBy: { order: 'asc' }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            imageUrl: true
          }
        },
        course_skills: {
          include: {
            skills: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ 
        success: false,
        error: "Course not found" 
      }, { status: 404 });
    }

    // แปลง format ให้ตรงกับที่ Frontend ต้องการ
    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        instructor: course.instructor,
        instructorName: course.user?.username || 'Unknown', // เพิ่ม
        instructorEmail: course.user?.email, // เพิ่ม
        instructorImage: course.user?.imageUrl, // เพิ่ม
        rating: course.rating ? parseFloat(course.rating.toString()) : null,
        createdAt: course.createdAt?.toISOString(),
        contents: course.contents,
      },
      modules: course.modules, // แยก modules ออกมา
      skills: course.course_skills.map(cs => cs.skills) // แยก skills ออกมา
    });

  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 });
  }
}

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

    const unwrappedParams = await params;
    const courseId = parseInt(unwrappedParams.id, 10);

    if (isNaN(courseId)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid course ID" 
      }, { status: 400 });
    }

    // Check if course exists and user has permission
    const existingCourse = await prisma.courses.findUnique({
      where: { id: courseId }
    });

    if (!existingCourse) {
      return NextResponse.json({ 
        success: false,
        error: "Course not found" 
      }, { status: 404 });
    }

    const currentUser = session.user as any;
    const canEdit = currentUser.role === 'staff' || 
                   (currentUser.role === 'instructor' && existingCourse.instructor === currentUser.id);

    if (!canEdit) {
      return NextResponse.json({ 
        success: false,
        error: "Forbidden" 
      }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const { 
      title, 
      description, 
      category, 
      level, 
      duration, 
      contents 
    } = body;

    // Validate required fields
    if (!title || !description || !contents) {
      return NextResponse.json({ 
        success: false,
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // Update course
    const updatedCourse = await prisma.courses.update({
      where: { id: courseId },
      data: {
        title,
        description,
        category: category || null,
        level: level || null,
        duration: duration || null,
        contents
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            imageUrl: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      course: {
        id: updatedCourse.id,
        title: updatedCourse.title,
        description: updatedCourse.description,
        category: updatedCourse.category,
        level: updatedCourse.level,
        duration: updatedCourse.duration,
        instructor: updatedCourse.instructor,
        instructorName: updatedCourse.user?.username || 'Unknown',
        instructorEmail: updatedCourse.user?.email,
        instructorImage: updatedCourse.user?.imageUrl,
        rating: updatedCourse.rating ? parseFloat(updatedCourse.rating.toString()) : null,
        createdAt: updatedCourse.createdAt?.toISOString(),
        contents: updatedCourse.contents
      }
    });

  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 });
  }
}

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

    const unwrappedParams = await params;
    const courseId = parseInt(unwrappedParams.id, 10);

    if (isNaN(courseId)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid course ID" 
      }, { status: 400 });
    }

    // Check if course exists and user has permission
    const existingCourse = await prisma.courses.findUnique({
      where: { id: courseId }
    });

    if (!existingCourse) {
      return NextResponse.json({ 
        success: false,
        error: "Course not found" 
      }, { status: 404 });
    }

    const currentUser = session.user as any;
    const canDelete = currentUser.role === 'staff' || 
                     (currentUser.role === 'instructor' && existingCourse.instructor === currentUser.id);

    if (!canDelete) {
      return NextResponse.json({ 
        success: false,
        error: "Forbidden" 
      }, { status: 403 });
    }

    // Delete course (cascade will handle related records)
    await prisma.courses.delete({
      where: { id: courseId }
    });

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 });
  }
}