// app/api/v0/dashboard/activities-per-month/route.ts
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

    // ดึงกิจกรรมของปีปัจจุบัน
    const currentYear = new Date().getFullYear();
    const activities = await prisma.activities.findMany({
      where: { year: currentYear },
      select: { dateStart: true }
    });

    // จัดกลุ่มตามเดือน
    const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", 
                        "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    
    const monthCounts = Array(12).fill(0);
    
    activities.forEach(activity => {
      const month = new Date(activity.dateStart).getMonth();
      monthCounts[month]++;
    });

    const result = monthNames.map((name, index) => ({
      month: name,
      count: monthCounts[index]
    }));

    return NextResponse.json({ data: result });

  } catch (error) {
    console.error("Error fetching activities per month:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}