// app/api/v0/dashboard/participation-rate/route.ts
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

    // หาข้อมูลการเข้าร่วมแบ่งตาม term และ year
    const activities = await prisma.activities.findMany({
      select: {
        year: true,
        term: true,
        _count: {
          select: { participates: true }
        }
      }
    });

    // จัดกลุ่มข้อมูลตาม year และ term
    const groupedData = activities.reduce((acc, activity) => {
      const key = `${activity.year}/${activity.term}`;
      if (!acc[key]) {
        acc[key] = { term: key, totalParticipations: 0, activityCount: 0 };
      }
      acc[key].totalParticipations += activity._count.participates;
      acc[key].activityCount += 1;
      return acc;
    }, {} as Record<string, any>);

    // แปลงเป็น array และคำนวณ average
    const rateData = Object.values(groupedData)
      .map((item: any) => ({
        term: item.term,
        rate: item.activityCount > 0 
          ? Math.round((item.totalParticipations / item.activityCount) * 10) / 10 
          : 0
      }))
      .sort((a, b) => a.term.localeCompare(b.term));

    return NextResponse.json({ rate: rateData });

  } catch (error) {
    console.error("Error fetching participation rate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}