// app/api/v0/transcripts/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const unwrappedParams = await params;
        const code = unwrappedParams.code;

        const transcript = await prisma.transcripts.findUnique({
            where: { transcript_code: code },
            include: {
                users: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        imageUrl: true
                    }
                }
            }
        });

        if (!transcript) {
            return NextResponse.json({
                success: false,
                error: "Transcript not found"
            }, { status: 404 });
        }

        // Check if expired
        const isExpired = transcript.valid_until && new Date() > transcript.valid_until;

        // Parse JSON data
        const data = {
            ...transcript,
            courses: JSON.parse(transcript.courses_data),
            activities: JSON.parse(transcript.activities_data),
            skills: JSON.parse(transcript.skills_data),
            isExpired
        };

        return NextResponse.json({
            success: true,
            transcript: data
        });

    } catch (error) {
        console.error("Error fetching transcript:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to fetch transcript"
        }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({
                success: false,
                error: "Unauthorized"
            }, { status: 401 });
        }

        const unwrappedParams = await params;
        const code = unwrappedParams.code;

        const transcript = await prisma.transcripts.findUnique({
            where: { transcript_code: code }
        });

        if (!transcript) {
            return NextResponse.json({
                success: false,
                error: "Transcript not found"
            }, { status: 404 });
        }

        const currentUser = session.user as any;
        if (transcript.user_id !== currentUser.id) {
            return NextResponse.json({
                success: false,
                error: "Forbidden"
            }, { status: 403 });
        }

        await prisma.transcripts.delete({
            where: { transcript_code: code }
        });

        return NextResponse.json({
            success: true,
            message: "Transcript deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting transcript:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to delete transcript"
        }, { status: 500 });
    }
}