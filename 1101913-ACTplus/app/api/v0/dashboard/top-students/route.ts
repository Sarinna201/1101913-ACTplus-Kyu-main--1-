// app/api/v0/dashboard/top-students/route.ts
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

    // หา top 10 นักศึกษาที่มีชั่วโมงจิตอาสามากที่สุด
    const students = await prisma.users.findMany({
      where: { role: "student" },
      select: {
        id: true,
        username: true,
        email: true,
        participates: {
          select: {
            activities: {
              select: { volunteerHours: true }
            }
          }
        }
      }
    });

    const studentsWithHours = students.map(student => {
      const totalHours = student.participates.reduce(
        (sum, p) => sum + p.activities.volunteerHours, 
        0
      );
      return {
        id: student.id,
        name: student.username,
        email: student.email,
        hours: totalHours
      };
    });

    // เรียงลำดับและเอา top 10
    const topStudents = studentsWithHours
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 10);

    return NextResponse.json({ students: topStudents });

  } catch (error) {
    console.error("Error fetching top students:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}