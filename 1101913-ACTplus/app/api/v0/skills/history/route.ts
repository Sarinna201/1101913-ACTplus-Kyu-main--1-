// app/api/v0/users/[id]/skills/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unwrappedParams = await params;
    const userId = parseInt(unwrappedParams.id, 10);

    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const currentUser = session.user as any;

    // ตรวจสอบสิทธิ์
    if (currentUser.id !== userId && currentUser.role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get("skillId");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = { user_id: userId };
    if (skillId) {
      where.skill_id = parseInt(skillId, 10);
    }

    const history = await prisma.user_skill_history.findMany({
      where,
      include: {
        skills: true,
        activities: true
      },
      orderBy: { earned_at: 'desc' },
      take: limit
    });

    const items = history.map(h => ({
      id: h.id,
      skill: {
        id: h.skills.id,
        code: h.skills.code,
        name: h.skills.name,
        color: h.skills.color
      },
      activity: {
        id: h.activities.id,
        title: h.activities.title
      },
      points: h.points,
      earnedAt: h.earned_at.toISOString()
    }));

    return NextResponse.json({
      success: true,
      history: items
    });

  } catch (error) {
    console.error("Error fetching skill history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}