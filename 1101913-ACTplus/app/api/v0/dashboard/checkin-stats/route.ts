// app/api/v0/dashboard/checkin-stats/route.ts
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

    const totalParticipations = await prisma.participates.count({
      where: { role: "user" }
    });

    const checkedIn = await prisma.participates.count({
      where: { 
        role: "user",
        checkedIn: true 
      }
    });

    const notCheckedIn = totalParticipations - checkedIn;

    return NextResponse.json({
      stats: [
        { name: 'Checked In', value: checkedIn },
        { name: 'Not Checked In', value: notCheckedIn }
      ]
    });

  } catch (error) {
    console.error("Error fetching check-in stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}