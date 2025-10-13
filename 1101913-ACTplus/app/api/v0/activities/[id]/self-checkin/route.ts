// app/api/v0/activities/[id]/self-checkin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ฟังก์ชันคำนวณ level จากคะแนนรวม
function calculateLevel(totalPoints: number): number {
  if (totalPoints === 0) return 0;
  if (totalPoints <= 10) return 1;
  if (totalPoints <= 25) return 2;
  if (totalPoints <= 50) return 3;
  if (totalPoints <= 100) return 4;
  return 5;
}

// ฟังก์ชันบันทึกคะแนนทักษะ
async function awardSkillPoints(userId: number, activityId: number) {
  try {
    // ดึงทักษะที่เกี่ยวข้องกับกิจกรรมนี้
    const activitySkills = await prisma.activity_skills.findMany({
      where: { activity_id: activityId },
      include: { skills: true }
    });

    if (activitySkills.length === 0) {
      console.log(`No skills associated with activity ${activityId}`);
      return { awarded: false, skills: [] };
    }

    const awardedSkills = [];

    for (const activitySkill of activitySkills) {
      const { skill_id, points } = activitySkill;

      // บันทึก history
      await prisma.user_skill_history.create({
        data: {
          user_id: userId,
          skill_id: skill_id,
          activity_id: activityId,
          points: points
        }
      });

      // อัพเดทหรือสร้าง user_skills
      const existingUserSkill = await prisma.user_skills.findUnique({
        where: {
          user_id_skill_id: {
            user_id: userId,
            skill_id: skill_id
          }
        }
      });

      let newTotalPoints: number;
      let newLevel: number;

      if (existingUserSkill) {
        // อัพเดทคะแนนที่มีอยู่
        newTotalPoints = existingUserSkill.total_points + points;
        newLevel = calculateLevel(newTotalPoints);

        await prisma.user_skills.update({
          where: {
            user_id_skill_id: {
              user_id: userId,
              skill_id: skill_id
            }
          },
          data: {
            total_points: newTotalPoints,
            level: newLevel,
            last_updated: new Date()
          }
        });
      } else {
        // สร้างใหม่
        newTotalPoints = points;
        newLevel = calculateLevel(newTotalPoints);

        await prisma.user_skills.create({
          data: {
            user_id: userId,
            skill_id: skill_id,
            total_points: newTotalPoints,
            level: newLevel
          }
        });
      }

      awardedSkills.push({
        skillId: skill_id,
        skillName: activitySkill.skills.name,
        skillCode: activitySkill.skills.code,
        pointsAwarded: points,
        newTotalPoints: newTotalPoints,
        newLevel: newLevel
      });
    }

    return { awarded: true, skills: awardedSkills };
  } catch (error) {
    console.error("Error awarding skill points:", error);
    throw error;
  }
}

// POST - ผู้ใช้เช็คชื่อตัวเอง
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unwrappedParams = await params;
    const activityId = parseInt(unwrappedParams.id, 10);

    if (!activityId || isNaN(activityId)) {
      return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 });
    }

    const user = session.user as any;

    // ตรวจสอบว่ากิจกรรมมีอยู่จริง
    const activity = await prisma.activities.findUnique({
      where: { id: activityId }
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    // ตรวจสอบว่าผู้ใช้เข้าร่วมกิจกรรมนี้หรือไม่
    const participation = await prisma.participates.findFirst({
      where: {
        aid: activityId,
        uid: user.id
      }
    });

    if (!participation) {
      return NextResponse.json({ 
        error: "You must join this activity before checking in" 
      }, { status: 403 });
    }

    // ตรวจสอบว่ากิจกรรมกำลังดำเนินการอยู่หรือไม่
    const now = new Date();
    const startDate = new Date(activity.dateStart);
    const endDate = activity.dateEnd ? new Date(activity.dateEnd) : null;

    if (now < startDate) {
      return NextResponse.json({ 
        error: "Activity has not started yet. Check-in will be available when the activity begins." 
      }, { status: 400 });
    }

    if (endDate && now > endDate) {
      return NextResponse.json({ 
        error: "Activity has already ended. Check-in is no longer available." 
      }, { status: 400 });
    }

    // ตรวจสอบว่าเช็คชื่อแล้วหรือยัง
    if (participation.checkedIn) {
      return NextResponse.json({ 
        error: "You have already checked in for this activity",
        checkedAt: participation.checkedAt?.toISOString()
      }, { status: 400 });
    }

    // ใช้ transaction เพื่อความปลอดภัย
    const result = await prisma.$transaction(async (tx) => {
      // เช็คชื่อ
      const updatedParticipation = await tx.participates.update({
        where: { id: participation.id },
        data: {
          checkedIn: true,
          checkedAt: new Date()
        }
      });

      // บันทึกคะแนนทักษะ (ใช้ prisma จาก transaction)
      const skillResult = await awardSkillPointsWithTx(tx, user.id, activityId);

      return {
        participation: updatedParticipation,
        skillResult,
        volunteerHours: activity.volunteerHours
      };
    });

    return NextResponse.json({
      success: true,
      message: "Check-in successful!",
      checkedIn: result.participation.checkedIn,
      checkedAt: result.participation.checkedAt?.toISOString(),
      volunteerHours: result.volunteerHours,
      skillsAwarded: result.skillResult.awarded,
      skills: result.skillResult.skills
    });

  } catch (error) {
    console.error("Error during self check-in:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ฟังก์ชันบันทึกคะแนนทักษะใน transaction
async function awardSkillPointsWithTx(tx: any, userId: number, activityId: number) {
  try {
    // ดึงทักษะที่เกี่ยวข้องกับกิจกรรมนี้
    const activitySkills = await tx.activity_skills.findMany({
      where: { activity_id: activityId },
      include: { skills: true }
    });

    if (activitySkills.length === 0) {
      console.log(`No skills associated with activity ${activityId}`);
      return { awarded: false, skills: [] };
    }

    const awardedSkills = [];

    for (const activitySkill of activitySkills) {
      const { skill_id, points } = activitySkill;

      // บันทึก history
      await tx.user_skill_history.create({
        data: {
          user_id: userId,
          skill_id: skill_id,
          activity_id: activityId,
          points: points
        }
      });

      // อัพเดทหรือสร้าง user_skills
      const existingUserSkill = await tx.user_skills.findUnique({
        where: {
          user_id_skill_id: {
            user_id: userId,
            skill_id: skill_id
          }
        }
      });

      let newTotalPoints: number;
      let newLevel: number;

      if (existingUserSkill) {
        // อัพเดทคะแนนที่มีอยู่
        newTotalPoints = existingUserSkill.total_points + points;
        newLevel = calculateLevel(newTotalPoints);

        await tx.user_skills.update({
          where: {
            user_id_skill_id: {
              user_id: userId,
              skill_id: skill_id
            }
          },
          data: {
            total_points: newTotalPoints,
            level: newLevel,
            last_updated: new Date()
          }
        });
      } else {
        // สร้างใหม่
        newTotalPoints = points;
        newLevel = calculateLevel(newTotalPoints);

        await tx.user_skills.create({
          data: {
            user_id: userId,
            skill_id: skill_id,
            total_points: newTotalPoints,
            level: newLevel
          }
        });
      }

      awardedSkills.push({
        skillId: skill_id,
        skillName: activitySkill.skills.name,
        skillCode: activitySkill.skills.code,
        pointsAwarded: points,
        newTotalPoints: newTotalPoints,
        newLevel: newLevel,
        levelUp: existingUserSkill ? newLevel > existingUserSkill.level : newLevel > 0
      });
    }

    return { awarded: true, skills: awardedSkills };
  } catch (error) {
    console.error("Error awarding skill points:", error);
    throw error;
  }
}

// GET - ดูสถานะการเช็คชื่อของตัวเอง
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unwrappedParams = await params;
    const activityId = parseInt(unwrappedParams.id, 10);

    if (!activityId || isNaN(activityId)) {
      return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 });
    }

    const user = session.user as any;

    // ดึงข้อมูลการเข้าร่วม
    const participation = await prisma.participates.findFirst({
      where: {
        aid: activityId,
        uid: user.id
      },
      include: {
        activities: true
      }
    });

    if (!participation) {
      return NextResponse.json({ 
        isParticipant: false,
        checkedIn: false,
        canCheckIn: false,
        message: "You are not a participant of this activity"
      });
    }

    // ตรวจสอบว่าสามารถเช็คชื่อได้หรือไม่
    const now = new Date();
    const startDate = new Date(participation.activities.dateStart);
    const endDate = participation.activities.dateEnd ? new Date(participation.activities.dateEnd) : null;

    const isStarted = now >= startDate;
    const isEnded = endDate ? now > endDate : false;
    const canCheckIn = isStarted && !isEnded && !participation.checkedIn;

    return NextResponse.json({
      isParticipant: true,
      checkedIn: participation.checkedIn,
      checkedAt: participation.checkedAt?.toISOString() || null,
      canCheckIn: canCheckIn,
      activityStatus: {
        isStarted,
        isEnded,
        startDate: participation.activities.dateStart.toISOString(),
        endDate: participation.activities.dateEnd?.toISOString() || null
      }
    });

  } catch (error) {
    console.error("Error fetching check-in status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}