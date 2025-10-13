// app/api/v0/activities/[id]/attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - ดึงรายชื่อผู้เข้าร่วมพร้อมสถานะเช็คชื่อ
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
    const activityId = parseInt(unwrappedParams.id, 10);

    if (!activityId || isNaN(activityId)) {
      return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 });
    }

    // ตรวจสอบว่าเป็น instructor/staff
    const user = session.user as any;
    const activity = await prisma.activities.findUnique({
      where: { id: activityId }
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const canManage = user.role === "staff" || (user.role === "instructor" && activity.uid === user.id);
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ดึงข้อมูลผู้เข้าร่วม
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "username";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const participants = await prisma.participates.findMany({
      where: {
        aid: activityId,
        ...(search && {
          users: {
            OR: [
              { username: { contains: search } },
              { email: { contains: search } }
            ]
          }
        })
      },
      include: {
        users: true
      },
      orderBy: sortBy === "checkedAt" 
        ? { checkedAt: sortOrder as "asc" | "desc" }
        : sortBy === "checkedIn"
        ? { checkedIn: sortOrder as "asc" | "desc" }
        : { users: { [sortBy]: sortOrder as "asc" | "desc" } }
    });

    const result = participants.map(p => ({
      id: p.id,
      userId: p.uid,
      username: p.users.username,
      email: p.users.email,
      imageUrl: p.users.imageUrl,
      role: p.role,
      checkedIn: p.checkedIn,
      checkedAt: p.checkedAt?.toISOString() || null
    }));

    return NextResponse.json({
      participants: result,
      total: result.length,
      activity: {
        id: activity.id,
        title: activity.title
      }
    });

  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - เช็คชื่อผู้เข้าร่วม
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

    // ตรวจสอบว่าเป็น instructor/staff
    const user = session.user as any;
    const activity = await prisma.activities.findUnique({
      where: { id: activityId }
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const canManage = user.role === "staff" || (user.role === "instructor" && activity.uid === user.id);
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { participantId, checkedIn } = await req.json();

    if (!participantId) {
      return NextResponse.json({ error: "Participant ID is required" }, { status: 400 });
    }

    // อัพเดทสถานะเช็คชื่อ
    const updatedParticipant = await prisma.participates.update({
      where: { id: participantId },
      data: {
        checkedIn: checkedIn,
        checkedAt: checkedIn ? new Date() : null
      },
      include: { users: true }
    });

    return NextResponse.json({
      id: updatedParticipant.id,
      userId: updatedParticipant.uid,
      username: updatedParticipant.users.username,
      email: updatedParticipant.users.email,
      imageUrl: updatedParticipant.users.imageUrl,
      role: updatedParticipant.role,
      checkedIn: updatedParticipant.checkedIn,
      checkedAt: updatedParticipant.checkedAt?.toISOString() || null
    });

  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - เช็คชื่อหลายคนพร้อมกัน
export async function PUT(
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
    const activity = await prisma.activities.findUnique({
      where: { id: activityId }
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const canManage = user.role === "staff" || (user.role === "instructor" && activity.uid === user.id);
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { participantIds, checkedIn } = await req.json();

    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: "Participant IDs array is required" }, { status: 400 });
    }

    // อัพเดทหลายคนพร้อมกัน
    await prisma.participates.updateMany({
      where: {
        id: { in: participantIds },
        aid: activityId
      },
      data: {
        checkedIn: checkedIn,
        checkedAt: checkedIn ? new Date() : null
      }
    });

    return NextResponse.json({ 
      message: `Updated ${participantIds.length} participants`,
      count: participantIds.length 
    });

  } catch (error) {
    console.error("Error bulk updating attendance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}