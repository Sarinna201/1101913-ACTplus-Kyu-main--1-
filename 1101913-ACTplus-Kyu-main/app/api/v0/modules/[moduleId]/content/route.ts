// app/api/v0/modules/[moduleId]/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - ดึงเนื้อหา module
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const unwrappedParams = await params;
    const moduleId = parseInt(unwrappedParams.moduleId, 10);

    if (isNaN(moduleId)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid module ID" 
      }, { status: 400 });
    }

    const module = await prisma.modules.findUnique({
      where: { id: moduleId },
      select: {
        id: true,
        title: true,
        summary: true,
        duration: true,
        contents: true,
        pre_test_quiz: true,
        learning_video: true,
        test_quiz: true
      }
    });

    if (!module) {
      return NextResponse.json({ 
        success: false,
        error: "Module not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      module: {
        ...module,
        preTestQuiz: module.pre_test_quiz ? JSON.parse(module.pre_test_quiz) : null,
        learningVideo: module.learning_video,
        testQuiz: module.test_quiz ? JSON.parse(module.test_quiz) : null
      }
    });

  } catch (error) {
    console.error("Error fetching module content:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// PUT - อัพเดทเนื้อหา module
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
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
    const moduleId = parseInt(unwrappedParams.moduleId, 10);

    if (isNaN(moduleId)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid module ID" 
      }, { status: 400 });
    }

    const { 
      title, 
      summary, 
      duration, 
      contents, 
      preTestQuiz, 
      learningVideo, 
      testQuiz 
    } = await req.json();

    // ตรวจสอบว่า module นี้อยู่ใน course ของ instructor หรือไม่
    const module = await prisma.modules.findUnique({
      where: { id: moduleId },
      include: { courses: true }
    });

    if (!module) {
      return NextResponse.json({ 
        success: false,
        error: "Module not found" 
      }, { status: 404 });
    }

    if (user.role !== "staff" && module.courses.instructor !== user.id) {
      return NextResponse.json({ 
        success: false,
        error: "You can only edit modules in your own courses" 
      }, { status: 403 });
    }

    // อัพเดท module
    const updatedModule = await prisma.modules.update({
      where: { id: moduleId },
      data: {
        title: title || module.title,
        summary: summary !== undefined ? summary : module.summary,
        duration: duration !== undefined ? duration : module.duration,
        contents: contents !== undefined ? contents : module.contents,
        pre_test_quiz: preTestQuiz ? JSON.stringify(preTestQuiz) : module.pre_test_quiz,
        learning_video: learningVideo !== undefined ? learningVideo : module.learning_video,
        test_quiz: testQuiz ? JSON.stringify(testQuiz) : module.test_quiz
      }
    });

    return NextResponse.json({
      success: true,
      message: "Module updated successfully",
      module: updatedModule
    });

  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 });
  }
}