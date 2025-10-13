// app/api/v0/modules/[moduleId]/quiz-attempt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
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
    const unwrappedParams = await params;
    const moduleId = parseInt(unwrappedParams.moduleId, 10);

    if (isNaN(moduleId)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid module ID" 
      }, { status: 400 });
    }

    const {
      quizType,
      answers,
      score,
      total,
      passed
    } = await req.json();

    const attempt = await prisma.quiz_attempts.create({
      data: {
        user_id: user.id,
        module_id: moduleId,
        quiz_type: quizType,
        answers: JSON.stringify(answers),
        score,
        total,
        passed
      }
    });

    return NextResponse.json({
      success: true,
      message: "Quiz attempt saved",
      attempt
    });

  } catch (error) {
    console.error("Error saving quiz attempt:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to save quiz attempt" 
    }, { status: 500 });
  }
}

// GET - ดูประวัติการทำ quiz
export async function GET(
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
    const unwrappedParams = await params;
    const moduleId = parseInt(unwrappedParams.moduleId, 10);

    if (isNaN(moduleId)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid module ID" 
      }, { status: 400 });
    }

    const attempts = await prisma.quiz_attempts.findMany({
      where: {
        user_id: user.id,
        module_id: moduleId
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      attempts
    });

  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch quiz attempts" 
    }, { status: 500 });
  }
}