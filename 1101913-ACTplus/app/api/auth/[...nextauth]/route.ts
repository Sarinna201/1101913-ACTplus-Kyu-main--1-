import NextAuth, { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AdapterUser } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role as "user" | "instructor" | "staff", // cast to union type
          imageUrl: user.imageUrl || "/uploads/images/user-default1.png",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: User | AdapterUser | null }) {
      if (user) {
        token.id = typeof user.id === "number" ? user.id : parseInt(user.id as string);
        token.username = "username" in user ? user.username : "";
        token.email = user.email;
        token.role = "role" in user ? (user.role as "user" | "instructor" | "staff") : "user";
        token.imageUrl = "imageUrl" in user ? user.imageUrl : "";
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      session.user = {
        id: token.id,
        username: token.username,
        email: token.email,
        role: token.role,
        imageUrl: token.imageUrl,
      };
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
