// app/api/v0/_utils.ts
import { NextResponse } from "next/server";
import {
  activities,
  activityParticipates,
  activitySkills,
  skills,
} from "@/app/(data)/activities/activities";
import { users } from "@/app/(data)/users/users";

// — Skill mapping (ไทย+อังกฤษ)
export const SKILL_MAP: Record<string, string> = {
  C1: "C1: Creativity and innovation • ความคิดสร้างสรรค์และนวัตกรรม",
  C2: "C2: Critical thinking, complex problem solving and learning skills • การคิดวิเคราะห์ การแก้ปัญหาที่ซับซ้อน และทักษะการเรียนรู้",
  C3: "C3: Communication and negotiation • การสื่อสารและการเจรจาต่อรอง",
  C4: "C4: Collaboration, teamwork and leadership • การร่วมมือ การทำงานเป็นทีมและภาวะความเป็นผู้นำ",
  C5: "C5: Computing, information, technology and Digital literacy • คอมพิวเตอร์ ข้อมูลข่าวสาร เทคโนโลยีและการรู้เท่าทันสื่อ",
  C6: "C6: Career and life skills • ทักษะชีวิตและอาชีพ",
  C7: "C7: Cross-cultural understanding • การเข้าใจความแตกต่างทางวัฒนธรรม",
};

export type SortKey = "newest" | "oldest";

export function statusOf(now: number, startISO: string, endISO: string) {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  if (now < start) return { code: "upcoming", label: "กิจกรรมใหม่", color: "green" };
  if (now >= start && now <= end)
    return { code: "ongoing", label: "กำลังจัดกิจกรรม", color: "yellow" };
  return { code: "ended", label: "กิจกรรมเสร็จสิ้นแล้ว", color: "red" };
}

// — join activity (detail)
export function joinActivity(aid: number) {
  const act = activities.find((a) => a.id === aid);
  if (!act) return null;

  const lecturer = users.find((u) => u.id === act.lecturer) ?? null;

  const sidList = activitySkills.filter((x) => x.aid === aid).map((x) => x.sid);
  const skillCodes = skills
    .filter((s) => sidList.includes(s.id))
    .map((s) => s.title); // "C1"..."C7"
  const skillMeta = skillCodes.map((code) => ({
    code,
    label: SKILL_MAP[code] ?? code,
  }));

  const participants = activityParticipates
    .filter((p) => p.aid === aid)
    .map((p) => users.find((u) => u.id === p.uid))
    .filter(Boolean)
    .map((u) => ({
      id: u!.id,
      username: u!.username,
      email: u!.email,
      imageUrl: u!.imageUrl,
      role: u!.role === "stuff" ? "staff" : u!.role,
    }));

  return { ...act, lecturer, skillMeta, participants };
}

// — join activity (list)
export function listActivities() {
  // precompute for list
  const sidByAid = new Map<number, number[]>();
  for (const as of activitySkills) {
    const arr = sidByAid.get(as.aid) ?? [];
    arr.push(as.sid);
    sidByAid.set(as.aid, arr);
  }
  const titleBySid = new Map(skills.map((s) => [s.id, s.title]));

  const countByAid = new Map<number, number>();
  for (const p of activityParticipates) {
    countByAid.set(p.aid, (countByAid.get(p.aid) ?? 0) + 1);
  }

  return activities.map((a) => {
    const tids = sidByAid.get(a.id) ?? [];
    const skillTitles = tids.map((sid) => titleBySid.get(sid)!).filter(Boolean);
    const participantCount = countByAid.get(a.id) ?? 0;
    return { ...a, skillTitles, participantCount };
  });
}

export function jsonOk(data: any, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}
export function jsonBad(message: string, init?: ResponseInit) {
  return NextResponse.json({ error: message }, { status: 400, ...init });
}
export function jsonNotFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}
