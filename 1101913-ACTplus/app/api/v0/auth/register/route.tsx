// app/api/v0/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { username, email, password, role } = await req.json();

  if (!username || !email || !password || !role) {
    return NextResponse.json({ 
      success: false,
      message: 'Missing fields' 
    }, { status: 400 });
  }

  const validRoles = ['user', 'instructor', 'staff'];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ 
      success: false,
      message: 'Invalid role' 
    }, { status: 400 });
  }

  try {
    // ตรวจสอบ username ซ้ำ
    const existingUsername = await prisma.users.findFirst({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ 
        success: false,
        message: 'Username already taken' 
      }, { status: 409 });
    }

    // ตรวจสอบ email ซ้ำ
    const existingEmail = await prisma.users.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ 
        success: false,
        message: 'Email already registered' 
      }, { status: 409 });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // เพิ่มข้อมูลผู้ใช้และ return ข้อมูลกลับมา
    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
        imageUrl: "/uploads/images/user-default1.png",
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        imageUrl: true
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Register successful',
      user: newUser // ส่งข้อมูล user กลับไป
    });
  } catch (err) {
    console.error('Register Error:', err);
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error' 
    }, { status: 500 });
  }
}