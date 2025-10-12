import { User } from "@/types";

export const users: User[] = [
    { id: 1, username: "teddy simon", password: "pass123", email: "staff1@example.com", imageUrl: "/uploads/images/user-default1.png", role: "staff" },
    { id: 2, username: "john doe", password: "pass123", email: "instructor1@example.com", imageUrl: "/uploads/images/user-default2.png", role: "instructor" },
    { id: 3, username: "jane doe", password: "pass123", email: "instructor2@example.com", imageUrl: "/uploads/images/user-default3.png", role: "instructor" },
    { id: 4, username: "adam smith", password: "pass123", email: "user1@example.com", imageUrl: "/uploads/images/user-default1.png", role: "user" },
    { id: 5, username: "bob smith", password: "pass123", email: "user2@example.com", imageUrl: "/uploads/images/user-default3.png", role: "user" },
    { id: 6, username: "alice smith", password: "pass123", email: "user3@example.com", imageUrl: "/uploads/images/user-default2.png", role: "user" },
];