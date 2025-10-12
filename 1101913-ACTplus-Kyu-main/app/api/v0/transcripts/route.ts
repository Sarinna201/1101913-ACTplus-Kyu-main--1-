// app/api/v0/transcripts/route.ts
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

    const transcripts = await prisma.transcripts.findMany({
      where: { user_id: user.id },
      orderBy: { generated_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      transcripts,
      total: transcripts.length
    });

  } catch (error) {
    console.error("Error fetching transcripts:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch transcripts" 
    }, { status: 500 });
  }
}