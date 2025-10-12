// app/api/v0/users/me/certificates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        success: false,
        error: "Unauthorized" 
      }, { status: 401 });
    }

    const user = session.user as any;

    const certificates = await prisma.certificates.findMany({
      where: { user_id: user.id },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            category: true,
            level: true
          }
        }
      },
      orderBy: {
        issued_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      certificates,
      total: certificates.length
    });

  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch certificates" 
    }, { status: 500 });
  }
}