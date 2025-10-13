import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (err) {
    console.error('Get Users Error:', err);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}