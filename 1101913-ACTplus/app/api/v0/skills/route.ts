// ===== app/api/v0/skills/route.ts =====
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - ดึงทักษะทั้งหมด
export async function GET() {
  try {
    const skills = await prisma.skills.findMany({
      orderBy: { code: 'asc' }
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - สร้างทักษะใหม่ (เฉพาะ admin/staff)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "staff" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { code, name, description, color } = await req.json();

    if (!code || !name) {
      return NextResponse.json(
        { error: "Code and name are required" },
        { status: 400 }
      );
    }

    const skill = await prisma.skills.create({
      data: { code, name, description, color }
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Skill code already exists" }, { status: 400 });
    }
    console.error("Error creating skill:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}