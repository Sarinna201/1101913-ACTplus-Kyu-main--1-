import { Activity, Skill, ActivitySkill, ActivityParticipate } from "@/types";
import { users } from "../users/users";

export const skills: Skill[] = [
    { id: 1, title: "C1" },
    { id: 2, title: "C2" },
    { id: 3, title: "C3" },
    { id: 4, title: "C4" },
    { id: 5, title: "C5" },
    { id: 6, title: "C6" },
    { id: 7, title: "C7" },
];

export const activities: Activity[] = [
  {
    id: 1,
    title: "Effective Communication",
    content: "Learn how to express ideas clearly and listen actively.",
    detail: "This workshop focuses on verbal and non-verbal communication, active listening, and overcoming common communication barriers.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-01-10T09:00:00.000Z",
    end_date: "2025-01-10T12:00:00.000Z",
  },
  {
    id: 2,
    title: "Teamwork & Collaboration",
    content: "Develop skills for working effectively in groups.",
    detail: "Learn strategies for building trust, resolving conflict, and achieving team goals together.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-01-12T09:00:00.000Z",
    end_date: "2025-01-12T12:00:00.000Z",
  },
  {
    id: 3,
    title: "Leadership Essentials",
    content: "Introduction to leading and motivating others.",
    detail: "Covers leadership styles, delegation, and how to inspire teams toward common objectives.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-01-15T13:00:00.000Z",
    end_date: "2025-01-15T16:00:00.000Z",
  },
  {
    id: 4,
    title: "Problem-Solving Strategies",
    content: "Sharpen your ability to analyze and resolve challenges.",
    detail: "Learn structured problem-solving methods like root cause analysis and creative brainstorming.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-09-18T09:00:00.000Z",
    end_date: "2025-09-19T12:00:00.000Z",
  },
  {
    id: 5,
    title: "Emotional Intelligence",
    content: "Understand and manage emotions in yourself and others.",
    detail: "Covers self-awareness, empathy, and emotional regulation for professional and personal growth.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-01-20T09:00:00.000Z",
    end_date: "2025-01-20T12:00:00.000Z",
  },
  {
    id: 6,
    title: "Conflict Resolution",
    content: "Learn how to handle disagreements constructively.",
    detail: "Teaches mediation skills, negotiation tactics, and how to turn conflicts into growth opportunities.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-01-22T09:00:00.000Z",
    end_date: "2025-01-22T11:00:00.000Z",
  },
  {
    id: 7,
    title: "Critical Thinking",
    content: "Develop logical reasoning and analytical skills.",
    detail: "Exercises in evaluating evidence, questioning assumptions, and making informed decisions.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-01-24T09:00:00.000Z",
    end_date: "2025-01-24T12:00:00.000Z",
  },
  {
    id: 8,
    title: "Adaptability & Flexibility",
    content: "Thrive in changing environments.",
    detail: "Learn techniques to adjust quickly to new challenges, roles, or team dynamics.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-01-27T09:00:00.000Z",
    end_date: "2025-01-27T11:00:00.000Z",
  },
  {
    id: 9,
    title: "Decision-Making",
    content: "Learn to make confident and effective choices.",
    detail: "Explore decision-making frameworks, risk assessment, and handling uncertainty.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-01-29T09:00:00.000Z",
    end_date: "2025-01-29T12:00:00.000Z",
  },
  {
    id: 10,
    title: "Time Management",
    content: "Master the art of prioritizing tasks.",
    detail: "Learn to use tools like the Eisenhower matrix, SMART goals, and scheduling to boost productivity.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-02-01T09:00:00.000Z",
    end_date: "2025-02-01T11:00:00.000Z",
  },
  {
    id: 11,
    title: "Creativity & Innovation",
    content: "Boost your creative thinking skills.",
    detail: "Practice brainstorming techniques, lateral thinking, and idea evaluation for innovation.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-02-03T09:00:00.000Z",
    end_date: "2025-02-03T12:00:00.000Z",
  },
  {
    id: 12,
    title: "Networking Skills",
    content: "Learn how to build meaningful professional relationships.",
    detail: "Practice conversation starters, online networking, and maintaining long-term connections.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-02-05T09:00:00.000Z",
    end_date: "2025-02-05T11:00:00.000Z",
  },
  {
    id: 13,
    title: "Negotiation Skills",
    content: "Win-win negotiation techniques for personal and professional life.",
    detail: "Focuses on preparation, persuasion, and collaborative bargaining methods.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-02-07T09:00:00.000Z",
    end_date: "2025-02-07T12:00:00.000Z",
  },
  {
    id: 14,
    title: "Stress Management",
    content: "Strategies to stay calm and focused under pressure.",
    detail: "Learn practical exercises such as breathing, mindfulness, and cognitive reframing.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-02-10T09:00:00.000Z",
    end_date: "2025-02-10T11:00:00.000Z",
  },
  {
    id: 15,
    title: "Cultural Awareness",
    content: "Improve your ability to work across cultures.",
    detail: "Focuses on respecting diversity, reducing bias, and collaborating in multicultural teams.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-02-12T09:00:00.000Z",
    end_date: "2025-02-12T12:00:00.000Z",
  },
  {
    id: 16,
    title: "Workplace Etiquette",
    content: "Professional behavior in office and online settings.",
    detail: "Covers email etiquette, meeting behavior, and maintaining respect in hybrid workplaces.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-02-14T09:00:00.000Z",
    end_date: "2025-02-14T11:00:00.000Z",
  },
  {
    id: 17,
    title: "Resilience Training",
    content: "Learn how to bounce back from setbacks.",
    detail: "Develop mental toughness, persistence, and optimism to handle challenges.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-02-17T09:00:00.000Z",
    end_date: "2025-02-17T12:00:00.000Z",
  },
  {
    id: 18,
    title: "Presentation Skills",
    content: "Deliver engaging and confident presentations.",
    detail: "Practice structuring presentations, using visuals, and speaking with confidence in front of an audience.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-02-19T09:00:00.000Z",
    end_date: "2025-02-19T12:00:00.000Z",
  },
  {
    id: 19,
    title: "Active Listening",
    content: "Improve understanding and empathy through listening.",
    detail: "Covers techniques to fully concentrate, respond thoughtfully, and remember what others say.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-02-21T09:00:00.000Z",
    end_date: "2025-02-21T11:00:00.000Z",
  },
  {
    id: 20,
    title: "Work-Life Balance",
    content: "Create harmony between career and personal life.",
    detail: "Learn to set boundaries, manage energy, and create routines that balance productivity and rest.",
    imageUrl: "/uploads/images/default.png",
    lecturer: 1,
    start_date: "2025-02-24T09:00:00.000Z",
    end_date: "2025-02-24T12:00:00.000Z",
  },
];


// assign random skills to activities
export const activitySkills: ActivitySkill[] = activities.flatMap((act, i) => {
    const count = (i % 3) + 1; // 1–3 skills
    const picked = new Set<number>();
    while (picked.size < count) {
        picked.add(Math.floor(Math.random() * skills.length) + 1);
    }
    return Array.from(picked).map((sid, idx) => ({
        id: i * 3 + idx + 1,
        aid: act.id,
        sid,
    }));
});

// participants: random users (except staff) join activities
export const activityParticipates: ActivityParticipate[] = activities.flatMap((act, i) => {
    const count = (i % 4) + 1; // 1–4 participants
    const picked = new Set<number>();
    while (picked.size < count) {
        const uid = Math.floor(Math.random() * users.length) + 1;
        if (uid !== 1) picked.add(uid); // skip staff
    }
    return Array.from(picked).map((uid, idx) => ({
        id: i * 4 + idx + 1,
        uid,
        aid: act.id,
    }));
});
