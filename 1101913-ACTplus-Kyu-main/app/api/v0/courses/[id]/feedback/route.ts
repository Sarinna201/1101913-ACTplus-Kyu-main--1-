// app/api/v0/courses/[id]/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - ดึง feedbacks ทั้งหมดของ course
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

    const feedbacks = await prisma.feedbacks.findMany({
      where: { course_id: courseId },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            imageUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average rating
    const averageRating = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.star, 0) / feedbacks.length
      : 0;

    // Count ratings by star
    const ratingCounts = {
      5: feedbacks.filter(f => f.star === 5).length,
      4: feedbacks.filter(f => f.star === 4).length,
      3: feedbacks.filter(f => f.star === 3).length,
      2: feedbacks.filter(f => f.star === 2).length,
      1: feedbacks.filter(f => f.star === 1).length,
    };

    return NextResponse.json({
      success: true,
      feedbacks: feedbacks.map(f => ({
        id: f.id,
        star: f.star,
        comment: f.comment,
        createdAt: f.createdAt,
        user: {
          id: f.users.id,
          username: f.users.username,
          imageUrl: f.users.imageUrl
        }
      })),
      statistics: {
        total: feedbacks.length,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingCounts
      }
    });

  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// POST - สร้าง/อัพเดท feedback
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

    const unwrappedParams = await params;
    const courseId = parseInt(unwrappedParams.id, 10);

    if (isNaN(courseId)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid course ID" 
      }, { status: 400 });
    }

    const currentUser = session.user as any;
    const body = await req.json();
    const { star, comment } = body;

    // Validate
    if (!star || star < 1 || star > 5) {
      return NextResponse.json({ 
        success: false,
        error: "Star rating must be between 1 and 5" 
      }, { status: 400 });
    }

    // Check if user is enrolled
    const enrollment = await prisma.enrollments_courses.findFirst({
      where: {
        user_id: currentUser.id,
        course_id: courseId
      }
    });

    if (!enrollment) {
      return NextResponse.json({ 
        success: false,
        error: "You must be enrolled in this course to leave feedback" 
      }, { status: 403 });
    }

    // Check if feedback already exists - แก้ syntax
    const existingFeedback = await prisma.feedbacks.findUnique({
      where: {
        course_id_user_id: { // ใช้ชื่อ constraint แทน
          course_id: courseId,
          user_id: currentUser.id
        }
      }
    });

    let feedback;

    if (existingFeedback) {
      // Update existing feedback
      feedback = await prisma.feedbacks.update({
        where: {
          course_id_user_id: { // แก้ตรงนี้ด้วย
            course_id: courseId,
            user_id: currentUser.id
          }
        },
        data: {
          star: parseInt(star),
          comment: comment || null
        }
      });
    } else {
      // Create new feedback
      feedback = await prisma.feedbacks.create({
        data: {
          course_id: courseId,
          user_id: currentUser.id,
          star: parseInt(star),
          comment: comment || null
        }
      });
    }

    // Update course rating
    const allFeedbacks = await prisma.feedbacks.findMany({
      where: { course_id: courseId }
    });

    const averageRating = allFeedbacks.reduce((sum, f) => sum + f.star, 0) / allFeedbacks.length;

    await prisma.courses.update({
      where: { id: courseId },
      data: {
        rating: Math.round(averageRating * 10) / 10
      }
    });

    return NextResponse.json({
      success: true,
      message: existingFeedback ? "Feedback updated successfully" : "Feedback created successfully",
      feedback: {
        id: feedback.id,
        star: feedback.star,
        comment: feedback.comment,
        createdAt: feedback.createdAt
      }
    });

  } catch (error) {
    console.error("Error creating/updating feedback:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// DELETE - ลบ feedback
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

    const currentUser = session.user as any;

    // Delete feedback - แก้ syntax
    await prisma.feedbacks.delete({
      where: {
        course_id_user_id: { // แก้ตรงนี้
          course_id: courseId,
          user_id: currentUser.id
        }
      }
    });

    // Recalculate course rating
    const allFeedbacks = await prisma.feedbacks.findMany({
      where: { course_id: courseId }
    });

    if (allFeedbacks.length > 0) {
      const averageRating = allFeedbacks.reduce((sum, f) => sum + f.star, 0) / allFeedbacks.length;
      await prisma.courses.update({
        where: { id: courseId },
        data: {
          rating: Math.round(averageRating * 10) / 10
        }
      });
    } else {
      await prisma.courses.update({
        where: { id: courseId },
        data: {
          rating: null
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Feedback deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json({ 
      success: false,
      error: "Internal server error" 
    }, { status: 500 });
  }
}