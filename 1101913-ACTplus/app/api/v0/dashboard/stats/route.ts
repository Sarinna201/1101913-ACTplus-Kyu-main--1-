// app/api/v0/dashboard/stats/route.ts
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

    // นับจำนวนนักศึกษา
    const totalStudents = await prisma.users.count({
      where: { role: "student" }
    });

    // นับจำนวนกิจกรรมทั้งหมด
    const totalActivities = await prisma.activities.count();

    // รวมชั่วโมงจิตอาสา
    const volunteerHours = await prisma.activities.aggregate({
      _sum: { volunteerHours: true }
    });

    // นับกิจกรรมที่กำลังดำเนินการ
    const now = new Date();
    const ongoingActivities = await prisma.activities.count({
      where: {
        dateStart: { lte: now },
        OR: [
          { dateEnd: { gte: now } },
          { dateEnd: null }
        ]
      }
    });

    return NextResponse.json({
      totalStudents,
      totalActivities,
      totalVolunteerHours: volunteerHours._sum.volunteerHours || 0,
      ongoingActivities
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}