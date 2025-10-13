// lib/transcriptUtils.ts
import { prisma } from './prisma';

export async function generateTranscriptCode(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  const count = await prisma.transcripts.count({
    where: {
      generated_at: {
        gte: new Date(year, new Date().getMonth(), 1),
        lt: new Date(year, new Date().getMonth() + 1, 1)
      }
    }
  });

  const sequence = String(count + 1).padStart(4, '0');
  return `TRANS-${year}${month}-${sequence}`;
}

export async function collectUserData(userId: number) {
  // Collect all courses
  const enrollments = await prisma.enrollments_courses.findMany({
    where: { user_id: userId },
    include: {
      courses: {
        include: {
          user: {
            select: {
              username: true
            }
          }
        }
      }
    }
  });

  // Get progress for each course
  const coursesData = await Promise.all(
    enrollments.map(async (enrollment) => {
      const progress = await prisma.module_progress.findMany({
        where: {
          user_id: userId,
          course_id: enrollment.course_id
        }
      });

      const totalModules = await prisma.modules.count({
        where: { cid: enrollment.course_id }
      });

      const completedModules = progress.filter(p => p.completed).length;
      const completionPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
      
      const testScores = progress.filter(p => p.test_score !== null && p.test_total !== null);
      const averageScore = testScores.length > 0
        ? Math.round(testScores.reduce((sum, p) => sum + ((p.test_score! / p.test_total!) * 100), 0) / testScores.length)
        : 0;

      return {
        id: enrollment.courses.id,
        title: enrollment.courses.title,
        category: enrollment.courses.category,
        level: enrollment.courses.level,
        instructor: enrollment.courses.user?.username || 'Unknown',
        enrolledAt: enrollment.created_at,
        totalModules,
        completedModules,
        completionPercentage,
        averageScore,
        completed: completionPercentage === 100
      };
    })
  );

  // Collect all activities
  const participations = await prisma.participates.findMany({
    where: { uid: userId },
    include: {
      activities: {
        include: {
          activity_skills: {
            include: {
              skills: true
            }
          }
        }
      }
    }
  });

  const activitiesData = participations.map(p => ({
    id: p.activities.id,
    title: p.activities.title,
    dateStart: p.activities.dateStart,
    dateEnd: p.activities.dateEnd,
    year: p.activities.year,
    term: p.activities.term,
    volunteerHours: p.activities.volunteerHours,
    authority: p.activities.authority,
    role: p.role,
    checkedIn: p.checkedIn,
    skills: p.activities.activity_skills.map(as => ({
      code: as.skills.code,
      name: as.skills.name,
      points: as.points
    }))
  }));

  // Collect all skills
  const userSkills = await prisma.user_skills.findMany({
    where: { user_id: userId },
    include: {
      skills: true
    },
    orderBy: {
      total_points: 'desc'
    }
  });

  const skillsData = userSkills.map(us => ({
    code: us.skills.code,
    name: us.skills.name,
    totalPoints: us.total_points,
    level: us.level,
    color: us.skills.color
  }));

  // Calculate totals
  const totalVolunteerHours = activitiesData.reduce((sum, a) => sum + (a.volunteerHours || 0), 0);
  const completedCourses = coursesData.filter(c => c.completed).length;

  return {
    courses: coursesData,
    activities: activitiesData,
    skills: skillsData,
    totals: {
      totalCourses: coursesData.length,
      completedCourses,
      totalActivities: activitiesData.length,
      totalVolunteerHours,
      totalSkills: skillsData.length
    }
  };
}