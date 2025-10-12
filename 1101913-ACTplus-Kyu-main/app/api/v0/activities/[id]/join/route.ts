// app/api/v0/activities/[id]/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    const user = session.user as any;

    // ตรวจสอบว่ากิจกรรมมีอยู่จริง
    const activity = await prisma.activities.findUnique({
      where: { id: activityId }
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    // ตรวจสอบว่าเข้าร่วมแล้วหรือไม่
    const existingParticipation = await prisma.participates.findFirst({
      where: {
        aid: activityId,
        uid: user.id
      }
    });

    if (existingParticipation) {
      return NextResponse.json({ error: "Already participating" }, { status: 400 });
    }

    // เพิ่มการเข้าร่วม
    await prisma.participates.create({
      data: {
        aid: activityId,
        uid: user.id,
        role: "user"
      }
    });

    // ดึงข้อมูลกิจกรรมที่อัพเดทแล้ว (รวม skills)
    const updatedActivity = await prisma.activities.findUnique({
      where: { id: activityId },
      include: {
        users: true,
        participates: { include: { users: true } },
        activity_skills: {
          include: {
            skills: true
          }
        }
      }
    });

    if (!updatedActivity) {
      return NextResponse.json({ error: "Activity not found after update" }, { status: 404 });
    }

    const response = {
      id: updatedActivity.id,
      title: updatedActivity.title,
      detail: updatedActivity.detail,
      imageUrl: updatedActivity.imageUrl,
      lecturer: updatedActivity.uid,
      lecturerInfo: {
        id: updatedActivity.users.id,
        username: updatedActivity.users.username,
        email: updatedActivity.users.email,
        imageUrl: updatedActivity.users.imageUrl,
      },
      start_date: updatedActivity.dateStart.toISOString(),
      end_date: updatedActivity.dateEnd?.toISOString() || null,
      year: updatedActivity.year,
      term: updatedActivity.term,
      volunteerHours: updatedActivity.volunteerHours,
      authority: updatedActivity.authority,
      skills: updatedActivity.activity_skills.map((as) => ({
        id: as.skills.id,
        code: as.skills.code,
        name: as.skills.name,
        description: as.skills.description,
        color: as.skills.color,
        points: as.points
      })),
      participants: updatedActivity.participates.map((p) => ({
        id: p.users.id,
        username: p.users.username,
        email: p.users.email,
        imageUrl: p.users.imageUrl,
        role: p.role,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error joining activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}