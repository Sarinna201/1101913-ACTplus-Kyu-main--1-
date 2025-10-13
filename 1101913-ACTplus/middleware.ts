import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ตรวจเฉพาะหน้า /user/page
    if (pathname === "/user/page") {
        const role = req.cookies.get("role")?.value;
        if (role !== "staff" && role !== "stuff") {
            // ถ้าไม่ใช่ staff → redirect ไปหน้าแรก
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    return NextResponse.next();
}

// apply middleware เฉพาะ path /user/page
export const config = {
    matcher: ["/user/page"],
};
