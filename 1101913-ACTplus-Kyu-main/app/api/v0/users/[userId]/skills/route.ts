// app/api/v0/users/[userId]/skills/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unwrappedParams = await params;
    const userId = parseInt(unwrappedParams.userId, 10);

    console.log("userId:", userId); // Debug

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const currentUser = session.user as any;
    const currentUserId = typeof currentUser.id === 'string' 
      ? parseInt(currentUser.id, 10) 
      : currentUser.id;

    // ตรวจสอบสิทธิ์ - ดูได้เฉพาะตัวเองหรือ staff
    if (currentUserId !== userId && currentUser.role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ดึงทักษะทั้งหมดที่มีในระบบ
    const allSkills = await prisma.skills.findMany({
      orderBy: { code: 'asc' }
    });

    // ดึงทักษะของผู้ใช้
    const userSkills = await prisma.user_skills.findMany({
      where: { user_id: userId },
      include: { skills: true }
    });

    // สร้าง map สำหรับค้นหาทักษะของผู้ใช้
    const userSkillsMap = new Map(
      userSkills.map(us => [us.skill_id, us])
    );

    // รวมข้อมูลทักษะทั้งหมดพร้อมข้อมูลของผู้ใช้
    const skills = allSkills.map(skill => {
      const userSkill = userSkillsMap.get(skill.id);
      return {
        id: skill.id,
        code: skill.code,
        name: skill.name,
        description: skill.description,
        color: skill.color,
        totalPoints: userSkill?.total_points || 0,
        level: userSkill?.level || 0,
        lastUpdated: userSkill?.last_updated?.toISOString() || null
      };
    });

    // คำนวณสถิติรวม
    const totalPoints = skills.reduce((sum, s) => sum + s.totalPoints, 0);
    const activeSkills = skills.filter(s => s.totalPoints > 0).length;
    const averageLevel = activeSkills > 0 
      ? skills.reduce((sum, s) => sum + s.level, 0) / activeSkills 
      : 0;

    return NextResponse.json({
      success: true,
      skills,
      statistics: {
        totalPoints,
        activeSkills,
        totalSkills: allSkills.length,
        averageLevel: Math.round(averageLevel * 10) / 10,
        completionRate: Math.round((activeSkills / allSkills.length) * 100)
      }
    });

  } catch (error) {
    console.error("Error fetching user skills:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}