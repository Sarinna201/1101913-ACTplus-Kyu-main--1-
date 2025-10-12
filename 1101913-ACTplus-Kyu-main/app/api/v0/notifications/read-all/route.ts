// app/api/v0/notifications/read-all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    await prisma.notifications.updateMany({
      where: {
        user_id: user.id,
        read: false
      },
      data: { read: true }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error marking all as read:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}