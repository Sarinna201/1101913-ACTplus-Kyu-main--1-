// app/api/v0/users/[userId]/activities/route.ts
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
      return NextResponse.json({ 
        success: false,
        error: "Unauthorized" 
      }, { status: 401 });
    }

    const { userId } = await params;
    const uid = Number(userId);

    if (isNaN(uid)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid user ID" 
      }, { status: 400 });
    }

    const participates = await prisma.participates.findMany({
      where: { uid: uid },
      include: {
        activities: true,
      },
      orderBy: {
        activities: {
          dateStart: 'desc' // เรียงตามวันที่ล่าสุด
        }
      }
    });

    // แปลง field name ให้ตรงกับที่หน้า profile ใช้
    const activities = participates.map((p) => ({
      id: p.activities.id,
      title: p.activities.title,
      detail: p.activities.detail,
      start_date: p.activities.dateStart,  // แก้เป็น start_date
      end_date: p.activities.dateEnd,      // แก้เป็น end_date
      year: p.activities.year,
      term: p.activities.term,
      volunteerHours: p.activities.volunteerHours,
      authority: p.activities.authority,
      checkedIn: p.checkedIn,
      checkedAt: p.checkedAt
    }));

    return NextResponse.json({ 
      success: true, 
      activities,
      total: activities.length 
    });
  } catch (err) {
    console.error("Get User Activities Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}