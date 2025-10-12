// app/api/v0/certificates/verify/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const unwrappedParams = await params;
    const code = unwrappedParams.code;

    const certificate = await prisma.certificates.findUnique({
      where: { certificate_code: code },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        courses: {
          select: {
            id: true,
            title: true,
            category: true,
            level: true,
            duration: true
          }
        }
      }
    });

    if (!certificate) {
      return NextResponse.json({
        success: false,
        valid: false,
        message: "Certificate not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      certificate: {
        code: certificate.certificate_code,
        studentName: certificate.users.username,
        studentEmail: certificate.users.email,
        courseTitle: certificate.course_title,
        completionDate: certificate.completion_date,
        issuedAt: certificate.issued_at,
        grade: certificate.grade,
        score: certificate.score,
        instructorName: certificate.instructor_name,
        courseDetails: certificate.courses
      }
    });

  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to verify certificate" 
    }, { status: 500 });
  }
}