// app/api/v0/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    const { username, email, password } = await req.json();
    if (!username || !email || !password) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ตรวจสอบว่ามี email นี้ในระบบหรือยัง
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
        return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }


    const id = Math.floor(Math.random() * 10000);
    const role = "user";
    const hashedPassword = await bcrypt.hash(password, 10);// hash password

    // เพิ่มข้อมูลผู้ใช้ลง database
    const user = await prisma.users.create({
        data: {
            username,
            email,
            password: hashedPassword,
            imageUrl: "/uploads/images/user-default1.png",
            role: "user",
        },
    });

    const res = NextResponse.json({
        token: "mock-token-" + user.id,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            imageUrl: user.imageUrl,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
        },
    });
    // set cookie for middleware
    res.cookies.set("role", user.role, { path: "/", maxAge: 60 * 60 * 24 });
    return res;
}
