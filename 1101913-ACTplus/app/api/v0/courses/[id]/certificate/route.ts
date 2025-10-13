// app/api/v0/courses/[id]/certificate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateCertificateCode, calculateGrade, isPassed } from "@/lib/certificateUtils";

// GET - ดูว่ามี certificate หรือยัง
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

    // ค้นหา certificate
    const certificate = await prisma.certificates.findFirst({
      where: {
        user_id: user.id,
        course_id: courseId
      }
    });

    return NextResponse.json({
      success: true,
      certificate,
      hasCertificate: !!certificate
    });

  } catch (error) {
    console.error("Error checking certificate:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to check certificate" 
    }, { status: 500 });
  }
}

// POST - สร้าง certificate
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
    const unwrappedParams = await params;
    const courseId = parseInt(unwrappedParams.id, 10);

    if (isNaN(courseId)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid course ID" 
      }, { status: 400 });
    }

    // ตรวจสอบว่าเรียนจบแล้วหรือยัง
    const progress = await prisma.module_progress.findMany({
      where: {
        user_id: user.id,
        course_id: courseId
      }
    });

    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      include: {
        modules: true,
        user: {
          select: {
            username: true
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

    const totalModules = course.modules.length;
    const completedModules = progress.filter(p => p.completed).length;

    // ต้องเรียนครบทุก module
    if (completedModules < totalModules) {
      return NextResponse.json({ 
        success: false,
        error: `Please complete all modules. You have completed ${completedModules} out of ${totalModules} modules.` 
      }, { status: 400 });
    }

    // คำนวณคะแนนเฉลี่ย
    const testScores = progress.filter(p => p.test_score !== null && p.test_total !== null);
    const averageScore = testScores.length > 0
      ? Math.round(testScores.reduce((sum, p) => sum + ((p.test_score! / p.test_total!) * 100), 0) / testScores.length)
      : 0;

    // ตรวจสอบว่าผ่านเกณฑ์หรือไม่ (70%)
    if (!isPassed(averageScore)) {
      return NextResponse.json({ 
        success: false,
        error: `Your average score is ${averageScore}%. You need at least 70% to receive a certificate.` 
      }, { status: 400 });
    }

    // เช็คว่ามี certificate แล้วหรือยัง
    const existingCert = await prisma.certificates.findFirst({
      where: {
        user_id: user.id,
        course_id: courseId
      }
    });

    if (existingCert) {
      return NextResponse.json({ 
        success: false,
        error: "You already have a certificate for this course" 
      }, { status: 400 });
    }

    // สร้างเลขที่ certificate
    const certificateCode = await generateCertificateCode(courseId, user.id);
    const grade = calculateGrade(averageScore);

    // สร้าง certificate
    const certificate = await prisma.certificates.create({
      data: {
        user_id: user.id,
        course_id: courseId,
        certificate_code: certificateCode,
        completion_date: new Date(),
        grade,
        score: averageScore,
        instructor_name: course.user?.username || 'Unknown',
        course_title: course.title
      }
    });

    return NextResponse.json({
      success: true,
      message: "Certificate generated successfully!",
      certificate
    });

  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to generate certificate" 
    }, { status: 500 });
  }
}