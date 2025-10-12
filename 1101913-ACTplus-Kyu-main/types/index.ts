export type Course = {
    id: number;
    title: string;
    description: string | null;
    category: string | null;
    level: "Beginner" | "Intermediate" | "Advanced";
    duration: string | null;
    instructor: string | null;
    rating: number;        // DECIMAL(2,1) -> map เป็น number
    is_public: 0 | 1;      // base table only (viewsยังมีได้ถ้าเลือกselect *)
    created_at?: Date;
    updated_at?: Date;
};

export type Module = {
    id: number;
    course_id: number;
    slug: string;
    title: string;
    order: number;
    duration: string | null;
    summary: string | null;
    content_md: string;     // markdown stored in DB
    updated_at?: Date;
};

export type Asset = {
    id: number;
    module_id: number;
    order: number;
    kind: "pdf" | "image" | "link" | "code" | "zip";
    title: string;
    url: string;
    created_at?: Date;
};

// types.ts
export type Role = "user" | "instructor" | "staff";
export type SkillCode = "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7";

export interface SessionUser {
    id: number;
    username: string;
    email: string;
    role: Role;
    imageUrl?: string;
}

export interface Activity {
    id: number;
    title: string;
    content: string;
    detail: string;
    imageUrl: string;
    lecturer: number | null; // user id (staff), nullable
    start_date: string; // ISO datetime
    end_date: string;   // ISO datetime
}

export interface Skill {
    id: number;
    title: SkillCode;
}

export interface ActivitySkill {
    id: number;
    aid: number;
    sid: number;
}

export interface ActivityParticipate {
    id: number;
    uid: number;
    aid: number;
}

export type Lecturer = {
    id: number;
    username: string;
    email: string;
    imageUrl: string;
};

export type SkillMeta = { code: string; label: string };

export type Participant = {
    id: number;
    username: string;
    email: string;
    imageUrl: string;
    role: string;
};

export type DetailResponse = {
    id: number;
    title: string;
    content?: string;
    detail?: string;
    imageUrl?: string;
    start_date: string;
    end_date: string;
    lecturer: Lecturer | null;   // <<— จาก API เป็น object (หรือ null)
    skillMeta: SkillMeta[];
    participants: Participant[];
};
