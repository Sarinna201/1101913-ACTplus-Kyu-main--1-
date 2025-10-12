import { activities, activityParticipates, activitySkills, skills } from "./activities/activities";
import { users } from "./users/users";

export function getAllActivities() {
    return activities.map((act) => enrichActivity(act.id));
}

export function enrichActivity(aid: number) {
    const act = activities.find((a) => a.id === aid)!;

    const lecturer = users.find((u) => u.id === act.lecturer);
    const skillIds = activitySkills.filter((as) => as.aid === aid).map((as) => as.sid);
    const skillTitles = skills
        .filter((s) => skillIds.includes(s.id))
        .map((s) => s.title);

    const participants = activityParticipates
        .filter((p) => p.aid === aid)
        .map((p) => users.find((u) => u.id === p.uid)!)
        // เผื่อกรณีข้อมูล role พิมพ์ผิดจาก "staff" เป็น "stuff" ใน mock
        .map((u) => ({ ...u, role: u.role === "stuff" ? "staff" : u.role }));

    return {
        ...act,
        lecturerUser: lecturer ? { id: lecturer.id, username: lecturer.username, imageUrl: lecturer.imageUrl } : null,
        skillTitles,
        participants,
    };
}

export function getActivity(aid: number) {
    return enrichActivity(aid);
}
