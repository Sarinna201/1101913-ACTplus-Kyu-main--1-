// app/api/v0/courses/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (level && level !== 'all') {
      where.level = level;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const courses = await prisma.courses.findMany({
      where,
      include: {
        modules: {
          orderBy: { order: 'asc' }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // แปลง instructor จาก user object
    const coursesWithInstructor = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      instructor: course.instructor,
      instructorName: course.user?.username || 'Unknown',
      instructorEmail: course.user?.email || '',
      rating: course.rating ? parseFloat(course.rating.toString()) : null,
      createdAt: course.createdAt?.toISOString() || new Date().toISOString(),
      contents: course.contents
    }));

    // Count total
    const total = await prisma.courses.count({ where });

    return NextResponse.json({ 
      success: true,
      courses: coursesWithInstructor,
      total
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch courses" 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // ตรวจสอบสิทธิ์ - เฉพาะ instructor/staff
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

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const category = formData.get("category") as string | null;
    const level = formData.get("level") as string | null;
    const duration = formData.get("duration") as string | null;
    const contents = (formData.get("contents") as string) || '';
    
    // แก้ไขส่วนนี้ - ตรวจสอบว่า user.id มีจริงในฐานข้อมูล
    let instructorId = user.id;
    
    // ถ้ามี instructor ถูกส่งมาจาก form ให้ใช้แทน
    const formInstructor = formData.get("instructor");
    if (formInstructor) {
      instructorId = Number(formInstructor);
    }

    // ตรวจสอบว่า instructor id มีอยู่จริงในตาราง users
    const instructorExists = await prisma.users.findUnique({
      where: { id: instructorId }
    });

    if (!instructorExists) {
      return NextResponse.json({ 
        success: false,
        error: `Instructor with ID ${instructorId} does not exist. Please check your user ID.` 
      }, { status: 400 });
    }

    const rating = formData.get("rating") 
      ? parseFloat(formData.get("rating") as string) 
      : null;

    const modulesData = formData.get("modules");
    const modules = modulesData ? JSON.parse(modulesData as string) : [];

    // Validate required fields
    if (!title) {
      return NextResponse.json({ 
        success: false,
        error: "Title is required" 
      }, { status: 400 });
    }

    // Validate level enum
    const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
    if (level && !validLevels.includes(level)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid level. Must be Beginner, Intermediate, or Advanced" 
      }, { status: 400 });
    }

    console.log('Creating course with instructor ID:', instructorId);

    // สร้าง course พร้อม modules - ใช้ summary และ contents ตาม schema
    const course = await prisma.courses.create({
      data: {
        title,
        description,
        category,
        level: level as any,
        duration,
        instructor: instructorId, // ใช้ instructorId ที่ตรวจสอบแล้ว
        contents,
        rating: rating ? parseFloat(rating.toFixed(1)) : null,
        createdAt: new Date(),
        modules: {
          create: modules.map((m: any, index: number) => ({
            title: m.title || `Module ${index + 1}`,
            summary: m.summary || null,
            order: m.order !== undefined ? m.order : index + 1,
            duration: m.duration || null,
            contents: m.contents || null
          }))
        }
      },
      include: {
        modules: {
          orderBy: { order: 'asc' }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      message: "Course created successfully",
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        instructor: course.instructor,
        instructorName: course.user?.username || 'Unknown',
        rating: course.rating ? parseFloat(course.rating.toString()) : null,
        createdAt: course.createdAt?.toISOString()
      }
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to create course",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        success: false,
        error: "Unauthorized" 
      }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "staff") {
      return NextResponse.json({ 
        success: false,
        error: "Forbidden - Staff only" 
      }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: "Course ID is required" 
      }, { status: 400 });
    }

    await prisma.courses.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ 
      success: true,
      message: "Course deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to delete course" 
    }, { status: 500 });
  }
}