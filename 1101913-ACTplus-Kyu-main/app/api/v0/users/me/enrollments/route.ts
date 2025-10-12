// app/api/v0/users/me/enrollments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - ดูคอร์สที่ผู้ใช้ลงทะเบียน
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        success: false,
        error: "Unauthorized" 
      }, { status: 401 });
    }

    const user = session.user as any;

    const enrollments = await prisma.enrollments_courses.findMany({
      where: { user_id: user.id },
      include: {
        courses: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            },
            modules: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      enrollments: enrollments.map(e => ({
        id: e.id,
        enrolledAt: e.created_at,
        course: {
          id: e.courses.id,
          title: e.courses.title,
          description: e.courses.description,
          category: e.courses.category,
          level: e.courses.level,
          duration: e.courses.duration,
          rating: e.courses.rating ? parseFloat(e.courses.rating.toString()) : null,
          instructorName: e.courses.user?.username || 'Unknown',
          moduleCount: e.courses.modules.length
        }
      })),
      total: enrollments.length
    });

  } catch (error) {
    console.error("Error fetching user enrollments:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch enrollments" 
    }, { status: 500 });
  }
}