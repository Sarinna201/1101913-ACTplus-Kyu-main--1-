// app/api/v0/transcripts/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateTranscriptCode, collectUserData } from "@/lib/transcriptUtils";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ 
        success: false,
        error: "Unauthorized" 
      }, { status: 401 });
    }

    const user = session.user as any;
    const { purpose, validDays } = await req.json();

    // Collect user data
    const userData = await collectUserData(user.id);

    // Generate transcript code
    const transcriptCode = await generateTranscriptCode();

    // Calculate valid until date
    const validUntil = validDays 
      ? new Date(Date.now() + validDays * 24 * 60 * 60 * 1000)
      : null;

    // Create transcript
    const transcript = await prisma.transcripts.create({
      data: {
        user_id: user.id,
        transcript_code: transcriptCode,
        purpose: purpose || null,
        valid_until: validUntil,
        total_courses: userData.totals.totalCourses,
        completed_courses: userData.totals.completedCourses,
        total_activities: userData.totals.totalActivities,
        total_volunteer_hours: userData.totals.totalVolunteerHours,
        total_skills: userData.totals.totalSkills,
        courses_data: JSON.stringify(userData.courses),
        activities_data: JSON.stringify(userData.activities),
        skills_data: JSON.stringify(userData.skills)
      }
    });

    return NextResponse.json({
      success: true,
      message: "Transcript generated successfully",
      transcript: {
        id: transcript.id,
        code: transcript.transcript_code,
        generatedAt: transcript.generated_at,
        validUntil: transcript.valid_until
      }
    });

  } catch (error) {
    console.error("Error generating transcript:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to generate transcript" 
    }, { status: 500 });
  }
}