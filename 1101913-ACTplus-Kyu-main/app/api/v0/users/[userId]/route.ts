import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: ดึงข้อมูลผู้ใช้
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const userId = params.userId;

  try {
    const user = await prisma.users.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error('Get User Error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: ลบผู้ใช้
export async function DELETE(req: NextRequest, { params }: { params: { userId: string } }) {
  const userId = params.userId;

  try {
    await prisma.users.delete({
      where: { id: Number(userId) },
    });

    return NextResponse.json({
      success: true,
      message: 'ลบผู้ใช้เรียบร้อยแล้ว'
    });
  } catch (err) {
    console.error('Delete User Error:', err);
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบผู้ใช้'
    }, { status: 500 });
  }
}

// PUT: แก้ไขข้อมูลผู้ใช้
export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
  const userId = params.userId;
  const body = await req.json();
  const { username, email, role } = body;

  try {
    await prisma.users.update({
      where: { id: Number(userId) },
      data: {
        username,
        email,
        role,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว'
    });
  } catch (err) {
    console.error('Update User Error:', err);
    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้'
    }, { status: 500 });
  }
}
