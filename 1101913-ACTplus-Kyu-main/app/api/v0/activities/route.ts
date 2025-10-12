// app/api/v0/activities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as any;

    const canCreate = user.role === "staff" || user.role === "instructor";
    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // อ่าน FormData แทน JSON
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
        { error: "Missing required fields: title, detail, dateStart, year, term, authority" },
        { status: 400 }
      );
    }

    // Handle file upload
    let imageUrl = "/uploads/images/default.png"; // Default image path
    
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

        // Set the image URL (relative path for database)
        imageUrl = `/uploads/images/${fileName}`;
      } catch (fileError) {
        console.error("File upload error:", fileError);
        // Continue with default image if upload fails
      }
    }

    // Create activity in database
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
        uid: user.id
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
    
  } catch (error: any) {
    console.error("Error creating activity:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// GET method for listing activities (existing functionality)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "12");
    const limit = searchParams.get("limit"); // เพิ่ม limit parameter
    const simple = searchParams.get("simple") === "true"; // เพิ่ม simple mode

    const skip = (page - 1) * pageSize;

    // Build where clause for search
    const where: any = {};
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { detail: { contains: q } },
        { authority: { contains: q } }
      ];
    }

    // Get total count
    const total = await prisma.activities.count({ where });

    // Determine take value
    let take = pageSize;
    if (limit) {
      take = parseInt(limit);
    }

    // Get activities with pagination
    const activities = await prisma.activities.findMany({
      where,
      include: simple ? {
        users: {
          select: {
            id: true,
            username: true
          }
        }
      } : {
        users: true,
        participates: {
          include: {
            users: true
          }
        },
        activity_skills: {
          include: {
            skills: true
          }
        }
      },
      orderBy: {
        dateStart: sort === "oldest" ? "asc" : "desc"
      },
      skip: limit ? 0 : skip, // ไม่ใช้ skip ถ้ามี limit
      take
    });

    // Simple format for homepage
    if (simple) {
      return NextResponse.json({
        success: true,
        activities: activities.map(a => ({
          id: a.id,
          title: a.title,
          detail: a.detail,
          imageUrl: a.imageUrl,
          dateStart: a.dateStart,
          dateEnd: a.dateEnd,
          year: a.year,
          term: a.term,
          volunteerHours: a.volunteerHours,
          authority: a.authority,
          creatorName: (a.users as any).username
        })),
        total,
        count: activities.length
      });
    }

    // Full format for activities page
    const items = activities.map(activity => {
      const now = new Date();
      const startDate = new Date(activity.dateStart);
      const endDate = activity.dateEnd ? new Date(activity.dateEnd) : null;

      let status: { code: "upcoming" | "ongoing" | "ended"; label: string; color: "green" | "yellow" | "red" };

      if (now < startDate) {
        status = { code: "upcoming", label: "Upcoming", color: "green" };
      } else if (endDate && now > endDate) {
        status = { code: "ended", label: "Ended", color: "red" };
      } else {
        status = { code: "ongoing", label: "Ongoing", color: "yellow" };
      }

      return {
        id: activity.id,
        title: activity.title,
        content: activity.detail.substring(0, 150) + (activity.detail.length > 150 ? "..." : ""),
        detail: activity.detail,
        imageUrl: activity.imageUrl,
        lecturer: activity.uid,
        start_date: activity.dateStart.toISOString(),
        end_date: activity.dateEnd?.toISOString() || null,
        skillTitles: (activity as any).activity_skills?.map((as: any) => as.skills.code) || [],
        skills: (activity as any).activity_skills?.map((as: any) => ({
          id: as.skills.id,
          code: as.skills.code,
          name: as.skills.name,
          color: as.skills.color,
          points: as.points
        })) || [],
        participantCount: (activity as any).participates?.length || 0,
        status
      };
    });

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
      pageSize
    });

  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}