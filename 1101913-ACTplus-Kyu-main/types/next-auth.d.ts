import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      username: string;
      email: string;
      role: "user" | "instructor" | "staff";
      imageUrl?: string | null;
    };
  }

  interface User {
    id: number;
    username: string;
    role: "user" | "instructor" | "staff";
    imageUrl?: string | null;
  }
}
