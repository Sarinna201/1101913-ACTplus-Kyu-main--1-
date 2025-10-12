// app/api/cron/create-notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // ตรวจสอบ authorization (ใช้ secret key)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // ดึงกิจกรรมที่เกี่ยวข้อง
    const activities = await prisma.activities.findMany({
      where: {
        OR: [
          // กิจกรรมที่เริ่มแล้วภายใน 24 ชม.
          {
            dateStart: {
              gte: oneDayAgo,
              lte: now
            }
          },
          // กิจกรรมที่จะสิ้นสุดภายใน 24 ชม.
          {
            dateEnd: {
              gte: now,
              lte: oneDayLater
            }
          },
          // กิจกรรมที่สิ้นสุดแล้วภายใน 24 ชม.
          {
            dateEnd: {
              gte: oneDayAgo,
              lte: now
            }
          }
        ]
      },
      include: {
        participates: {
          where: { role: "user" }
        }
      }
    });

    let createdCount = 0;

    for (const activity of activities) {
      const startDate = new Date(activity.dateStart);
      const endDate = activity.dateEnd ? new Date(activity.dateEnd) : null;

      for (const participant of activity.participates) {
        // กิจกรรมเริ่มแล้ว
        const hoursSinceStart = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceStart > 0 && hoursSinceStart <= 24 && !participant.checkedIn) {
          const existing = await prisma.notifications.findFirst({
            where: {
              user_id: participant.uid,
              activity_id: activity.id,
              type: "activity_started"
            }
          });

          if (!existing) {
            await prisma.notifications.create({
              data: {
                user_id: participant.uid,
                activity_id: activity.id,
                type: "activity_started",
                message: `"${activity.title}" has started! Don't forget to check in.`
              }
            });
            createdCount++;
          }
        }

        // กิจกรรมใกล้สิ้นสุด
        if (endDate) {
          const hoursUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          if (hoursUntilEnd > 0 && hoursUntilEnd <= 24 && !participant.checkedIn) {
            const existing = await prisma.notifications.findFirst({
              where: {
                user_id: participant.uid,
                activity_id: activity.id,
                type: "activity_ending"
              }
            });

            if (!existing) {
              await prisma.notifications.create({
                data: {
                  user_id: participant.uid,
                  activity_id: activity.id,
                  type: "activity_ending",
                  message: `"${activity.title}" is ending soon! Last chance to check in.`
                }
              });
              createdCount++;
            }
          }

          // กิจกรรมสิ้นสุดแล้ว
          const hoursSinceEnd = (now.getTime() - endDate.getTime()) / (1000 * 60 * 60);
          if (hoursSinceEnd > 0 && hoursSinceEnd <= 24) {
            const existing = await prisma.notifications.findFirst({
              where: {
                user_id: participant.uid,
                activity_id: activity.id,
                type: "activity_ended"
              }
            });

            if (!existing) {
              await prisma.notifications.create({
                data: {
                  user_id: participant.uid,
                  activity_id: activity.id,
                  type: "activity_ended",
                  message: `"${activity.title}" has ended. ${participant.checkedIn ? 'Thanks for participating!' : 'You missed this activity.'}`
                }
              });
              createdCount++;
            }
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      createdCount,
      message: `Created ${createdCount} notifications`
    });

  } catch (error) {
    console.error("Error creating notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}