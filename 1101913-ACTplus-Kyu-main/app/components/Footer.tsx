"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Footer() {
  const { data: session, status } = useSession();

  return (
    <footer className="border-t bg-black">
      <div className="max-w-5xl mx-auto px-4 py-4 text-sm text-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>&copy; {new Date().getFullYear()} LearningHub. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-orange-400">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-orange-400">
            Terms
          </Link>
        </div>

        {/* ตรวจสอบสถานะการเข้าสู่ระบบ */}
        <div className="flex gap-4 items-center mt-3 sm:mt-0">
          {status === "loading" ? (
            <p>Loading...</p>
          ) : session ? (
            <>
              <span className="text-orange-400">Welcome, {session.user?.username}</span> {/* ใช้ username แทน name */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm px-3 py-1 rounded border border-white text-white hover:bg-gray-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm px-3 py-1 rounded border border-white text-white hover:bg-gray-800"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm px-3 py-1 rounded bg-orange-500 text-white hover:bg-orange-400"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
