"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Poppins } from "next/font/google";
import NotificationBell from "./NotificationBell";

const poppins = Poppins({
  weight: ["700"],
  subsets: ["latin"],
});

export default function Nav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Hooks ต้องเรียกทุกครั้งโดยไม่ขึ้นกับเงื่อนไข
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isAuthed = Boolean(session?.user);
  const isStaff = session?.user?.role === "staff";

  const links = useMemo(() => {
    const baseLinks = [
      { href: "/", label: "Home" },
      { href: "/courses", label: "Courses" },
      { href: "/activities", label: "Activities" },
      { href: "/my-certificates", label: "My Certificates" },
      { href: "/my-transcripts", label: "My Transcripts" },
    ];

    if (isStaff) {
      baseLinks.push(
        { href: "/dashboard", label: "Dashboard" },
        { href: "/register", label: "Register" }
      );
    }

    return baseLinks;
  }, [isStaff]);

  const NavItem = ({ href, label }: { href: string; label: string }) => {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
      <Link
        href={href}
        className={`block px-3 py-2 text-sm transition ${
          isActive ? "text-orange-400" : "text-white hover:text-orange-400"
        }`}
      >
        {label}
      </Link>
    );
  };

  const ProfileLink = () => {
    const user = session?.user;
    if (!user) return null;

    const href = `/users/${user.id}`;
    const img = user.imageUrl || "/img/default-avatar.png";
    const isActive = pathname.startsWith("/users/");

    return (
      <Link
        href={href}
        className={`inline-flex items-center gap-2 rounded px-2 py-1 ${
          isActive ? "text-orange-400" : "text-white hover:text-orange-400"
        }`}
        aria-label="Profile"
      >
        <span className="font-medium">{user.username}</span>
        <img
          src={img}
          alt="Profile"
          className="h-8 w-8 rounded-full object-cover border border-white"
        />
      </Link>
    );
  };

  // Render UI: เช็ค status ภายใน JSX แทน return early
  if (status === "loading") {
    // ระหว่าง loading อาจ return skeleton หรือ null ก็ได้
    return null;
  }

  return (
    <header className="w-full bg-black px-8 py-4 flex items-center relative">
      <Link
        href="/"
        className={`${poppins.className} flex items-center text-2xl font-bold`}
      >
        <span className="text-orange-500">ACT</span>
        <span className="text-white">+</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 ml-auto">
        <nav className="flex gap-4 text-sm text-white">
          {links.map((l) => (
            <NavItem key={l.href} {...l} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <NotificationBell />
              <ProfileLink />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
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

      <button
        className="md:hidden inline-flex items-center justify-center rounded p-2 hover:bg-gray-900 ml-auto"
        aria-label="Toggle menu"
        onClick={() => setOpen((s) => !s)}
      >
        <svg
          className={`h-6 w-6 ${open ? "hidden" : "block"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg
          className={`h-6 w-6 ${open ? "block" : "hidden"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full bg-black border-t border-gray-800 shadow-md md:hidden z-50">
          <div className="px-4 py-4 flex flex-col gap-4">
            <nav className="flex flex-col gap-2 text-white text-base">
              {links.map((l) => (
                <NavItem key={l.href} {...l} />
              ))}
            </nav>

            <div className="border-t border-gray-800 pt-4 flex items-center justify-between">
              {isAuthed ? (
                <>
                  <div className="flex items-center gap-3">
                    <NotificationBell />
                    <ProfileLink />
                  </div>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/login" });
                      setOpen(false);
                    }}
                    className="text-sm px-3 py-1 rounded border border-white text-white hover:bg-gray-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="text-sm px-3 py-1 rounded border border-white text-white hover:bg-gray-800"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="text-sm px-3 py-1 rounded bg-orange-500 text-white hover:bg-orange-400"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
