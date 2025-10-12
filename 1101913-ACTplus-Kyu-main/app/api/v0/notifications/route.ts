// app/api/v0/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - ดึง notifications ทั้งหมด
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    const notifications = await prisma.notifications.findMany({
      where: { user_id: user.id },
      include: {
        activities: {
          select: {
            id: true,
            title: true,
            dateStart: true,
            dateEnd: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 50 // จำกัดแค่ 50 รายการล่าสุด
    });

    const result = notifications.map(n => ({
      id: n.id,
      type: n.type,
      activityId: n.activity_id,
      activityTitle: n.activities.title,
      message: n.message,
      timestamp: n.created_at.toISOString(),
      read: n.read
    }));

    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({
      notifications: result,
      unreadCount
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - สร้าง notification ใหม่ (ใช้โดย system/cron job)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // เฉพาะ staff เท่านั้นที่สร้าง notification ได้ (หรือใช้ API key สำหรับ cron job)
    const user = session.user as any;
    if (user.role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, activityId, type, message } = await req.json();

    const notification = await prisma.notifications.create({
      data: {
        user_id: userId,
        activity_id: activityId,
        type,
        message
      }
    });

    return NextResponse.json(notification, { status: 201 });

  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}