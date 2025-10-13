// ===== app/api/v0/activities/[id]/skills/route.ts =====
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - ดึงทักษะของกิจกรรม
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unwrappedParams = await params;
    const activityId = parseInt(unwrappedParams.id, 10);

    if (!activityId || isNaN(activityId)) {
      return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 });
    }

    const activitySkills = await prisma.activity_skills.findMany({
      where: { activity_id: activityId },
      include: { skills: true }
    });

    const skills = activitySkills.map(as => ({
      id: as.skills.id,
      code: as.skills.code,
      name: as.skills.name,
      description: as.skills.description,
      color: as.skills.color,
      points: as.points
    }));

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Error fetching activity skills:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - เพิ่มทักษะให้กิจกรรม
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unwrappedParams = await params;
    const activityId = parseInt(unwrappedParams.id, 10);

    if (!activityId || isNaN(activityId)) {
      return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 });
    }

    // ตรวจสอบสิทธิ์
    const user = session.user as any;
    const activity = await prisma.activities.findUnique({ where: { id: activityId } });
    
    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const canEdit = user.role === "staff" || (user.role === "instructor" && activity.uid === user.id);
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { skillIds } = await req.json(); // [{ skillId: 1, points: 2 }, ...]

    if (!Array.isArray(skillIds)) {
      return NextResponse.json({ error: "skillIds must be an array" }, { status: 400 });
    }

    // ลบทักษะเก่า
    await prisma.activity_skills.deleteMany({
      where: { activity_id: activityId }
    });

    // เพิ่มทักษะใหม่
    if (skillIds.length > 0) {
      await prisma.activity_skills.createMany({
        data: skillIds.map((item: any) => ({
          activity_id: activityId,
          skill_id: item.skillId,
          points: item.points || 1
        }))
      });
    }

    // ดึงทักษะที่อัพเดทแล้ว
    const updatedSkills = await prisma.activity_skills.findMany({
      where: { activity_id: activityId },
      include: { skills: true }
    });

    const result = updatedSkills.map(as => ({
      id: as.skills.id,
      code: as.skills.code,
      name: as.skills.name,
      description: as.skills.description,
      color: as.skills.color,
      points: as.points
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating activity skills:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}