// app/api/v0/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.json({ ok: true });
    // clear cookie
    res.cookies.set("role", "", { path: "/", maxAge: 0 });
    return res;
}
