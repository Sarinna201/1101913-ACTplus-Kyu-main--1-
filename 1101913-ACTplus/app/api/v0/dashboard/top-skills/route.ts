// app/api/v0/dashboard/top-skills/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // หาทักษะที่มีคะแนนรวมสูงสุด
    const topSkills = await prisma.user_skills.groupBy({
      by: ['skill_id'],
      _sum: { total_points: true },
      _count: { user_id: true },
      orderBy: { _sum: { total_points: 'desc' } },
      take: 5
    });

    // ดึงข้อมูลทักษะแต่ละตัว
    const skillsWithDetails = await Promise.all(
      topSkills.map(async (item) => {
        const skill = await prisma.skills.findUnique({
          where: { id: item.skill_id }
        });
        return {
          id: skill?.id,
          code: skill?.code,
          name: skill?.name,
          color: skill?.color,
          totalPoints: item._sum.total_points || 0,
          userCount: item._count.user_id
        };
      })
    );

    return NextResponse.json({ skills: skillsWithDetails });

  } catch (error) {
    console.error("Error fetching top skills:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}