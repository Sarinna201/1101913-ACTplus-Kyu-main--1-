// app/api/v0/activities/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { unlink } from "fs/promises";

const prisma = new PrismaClient();

// ================= GET Activity =================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unwrappedParams = await params;
  const { id } = unwrappedParams;
  const parsedId = parseInt(id, 10);

  if (!parsedId || isNaN(parsedId)) {
    return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 });
  }

  try {
    const activity = await prisma.activities.findUnique({
      where: { id: parsedId },
      include: {
        users: true,
        participates: { include: { users: true } },
        activity_skills: {
          include: {
            skills: true
          }
        }
      },
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const response = {
      id: activity.id,
      title: activity.title,
      detail: activity.detail,
      imageUrl: activity.imageUrl,
      lecturer: activity.uid,
      lecturerInfo: {
        id: activity.users.id,
        username: activity.users.username,
        email: activity.users.email,
        imageUrl: activity.users.imageUrl,
      },
      start_date: activity.dateStart.toISOString(),
      end_date: activity.dateEnd?.toISOString() || null,
      year: activity.year,
      term: activity.term,
      volunteerHours: activity.volunteerHours,
      authority: activity.authority,
      skills: activity.activity_skills.map((as) => ({
        id: as.skills.id,
        code: as.skills.code,
        name: as.skills.name,
        description: as.skills.description,
        color: as.skills.color,
        points: as.points
      })),
      participants: activity.participates.map((p) => ({
        id: p.users.id,
        username: p.users.username,
        email: p.users.email,
        imageUrl: p.users.imageUrl,
        role: p.role,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ================= POST Activity (Create) =================
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    if (user.role !== "staff" && user.role !== "instructor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // อ่าน FormData
    const formData = await req.formData();
    
    // Extract ข้อมูลจาก FormData
    const title = formData.get("title") as string;
    const detail = formData.get("detail") as string;
    const dateStart = formData.get("dateStart") as string;
    const dateEnd = formData.get("dateEnd") as string;
    const year = formData.get("year") as string;
    const term = formData.get("term") as string;
    const volunteerHours = formData.get("volunteerHours") as string;
    const authority = formData.get("authority") as string;
    const file = formData.get("file") as File | null;

    // Validate required fields
    if (!title || !detail || !dateStart || !year || !term || !authority) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Handle file upload
    let imageUrl = "/uploads/images/default.png"; // Default image
    
    if (file && file.size > 0) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), "public", "uploads", "images");
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `activity_${timestamp}.${fileExtension}`;
        const filePath = join(uploadDir, fileName);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Set the image URL
        imageUrl = `/uploads/images/${fileName}`;
      } catch (fileError) {
        console.error("File upload error:", fileError);
        // Continue with default image if upload fails
      }
    }

    const newActivity = await prisma.activities.create({
      data: {
        title,
        detail,
        imageUrl,
        dateStart: new Date(dateStart),
        dateEnd: dateEnd ? new Date(dateEnd) : null,
        year: parseInt(year, 10),
        term: parseInt(term, 10),
        volunteerHours: volunteerHours ? parseInt(volunteerHours, 10) : 0,
        authority,
        uid: user.id,
      },
      include: { users: true }
    });

    return NextResponse.json({
      id: newActivity.id,
      title: newActivity.title,
      detail: newActivity.detail,
      imageUrl: newActivity.imageUrl,
      lecturer: newActivity.uid,
      lecturerInfo: {
        id: newActivity.users.id,
        username: newActivity.users.username,
        email: newActivity.users.email,
        imageUrl: newActivity.users.imageUrl
      },
      start_date: newActivity.dateStart.toISOString(),
      end_date: newActivity.dateEnd?.toISOString() || null,
      year: newActivity.year,
      term: newActivity.term,
      volunteerHours: newActivity.volunteerHours,
      authority: newActivity.authority
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ================= PUT Activity (Update) =================
export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unwrappedParams = await params;
    const id = parseInt(unwrappedParams.id, 10);
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 });
    }

    const existingActivity = await prisma.activities.findUnique({ where: { id } });
    if (!existingActivity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const user = session.user as any;
    const canEdit = user.role === "staff" || (user.role === "instructor" && existingActivity.uid === user.id);
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // อ่าน FormData
    const formData = await req.formData();
    
    // Extract ข้อมูลจาก FormData
    const title = formData.get("title") as string;
    const detail = formData.get("detail") as string;
    const dateStart = formData.get("dateStart") as string;
    const dateEnd = formData.get("dateEnd") as string;
    const year = formData.get("year") as string;
    const term = formData.get("term") as string;
    const volunteerHours = formData.get("volunteerHours") as string;
    const authority = formData.get("authority") as string;
    const file = formData.get("file") as File | null;

    // Handle file upload
    let imageUrl = existingActivity.imageUrl;
    if (file && file.size > 0) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), "public", "uploads", "images");
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `activity_${timestamp}.${fileExtension}`;
        const filePath = join(uploadDir, fileName);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Delete old file if it exists and isn't default
        if (existingActivity.imageUrl && !existingActivity.imageUrl.includes('default.png')) {
          try {
            const oldFilePath = join(process.cwd(), "public", existingActivity.imageUrl);
            await unlink(oldFilePath);
          } catch (deleteError) {
            console.warn("Could not delete old file:", deleteError);
          }
        }

        // Set new image URL
        imageUrl = `/uploads/images/${fileName}`;
      } catch (fileError) {
        console.error("File upload error:", fileError);
        // Keep existing image if upload fails
      }
    }

    const updatedActivity = await prisma.activities.update({
      where: { id },
      data: {
        title: title || existingActivity.title,
        detail: detail || existingActivity.detail,
        imageUrl,
        dateStart: dateStart ? new Date(dateStart) : existingActivity.dateStart,
        dateEnd: dateEnd ? new Date(dateEnd) : existingActivity.dateEnd,
        year: year ? parseInt(year, 10) : existingActivity.year,
        term: term ? parseInt(term, 10) : existingActivity.term,
        volunteerHours: volunteerHours !== undefined ? parseInt(volunteerHours, 10) : existingActivity.volunteerHours,
        authority: authority || existingActivity.authority,
      },
      include: { users: true }
    });

    return NextResponse.json({
      id: updatedActivity.id,
      title: updatedActivity.title,
      detail: updatedActivity.detail,
      imageUrl: updatedActivity.imageUrl,
      lecturer: updatedActivity.uid,
      lecturerInfo: {
        id: updatedActivity.users.id,
        username: updatedActivity.users.username,
        email: updatedActivity.users.email,
        imageUrl: updatedActivity.users.imageUrl
      },
      start_date: updatedActivity.dateStart.toISOString(),
      end_date: updatedActivity.dateEnd?.toISOString() || null,
      year: updatedActivity.year,
      term: updatedActivity.term,
      volunteerHours: updatedActivity.volunteerHours,
      authority: updatedActivity.authority
    });

  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ================= DELETE Activity =================
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unwrappedParams = await params;
    const id = parseInt(unwrappedParams.id, 10);
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 });
    }

    const existingActivity = await prisma.activities.findUnique({ where: { id } });
    if (!existingActivity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const user = session.user as any;
    const canDelete = user.role === "staff" || (user.role === "instructor" && existingActivity.uid === user.id);
    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete related records first
    await prisma.participates.deleteMany({ where: { aid: id } });
    //await prisma.enrollments_activities.deleteMany({ where: { activity_id: id } });

    // Delete the image file if it's not default
    if (existingActivity.imageUrl && !existingActivity.imageUrl.includes('default.png')) {
      try {
        const filePath = join(process.cwd(), "public", existingActivity.imageUrl);
        await unlink(filePath);
      } catch (deleteError) {
        console.warn("Could not delete image file:", deleteError);
      }
    }

    // Delete the activity
    await prisma.activities.delete({ where: { id } });

    return NextResponse.json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}