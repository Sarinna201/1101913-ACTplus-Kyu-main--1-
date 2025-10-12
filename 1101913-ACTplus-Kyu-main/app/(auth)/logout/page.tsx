"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["700"],
  subsets: ["latin"],
});

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function doLogout() {
      try {
        // เรียก API logout เพื่อล้าง cookie session ฝั่ง server
        await fetch("/api/v0/auth/logout", { method: "POST" });
      } catch (e) {
        console.error("Logout API error", e);
      }

      // ลบ localStorage keys ทั้งหมดที่เกี่ยวข้อง
      const keys = ["token", "userId", "userImage", "username", "email", "role"];
      keys.forEach((key) => localStorage.removeItem(key));

      // แจ้ง component อื่น ๆ ว่า logout แล้ว (เช่น Navbar)
      window.dispatchEvent(new Event("auth-change"));

      // เปลี่ยนหน้าไปหน้าแรก
      router.replace("/");
    }

    doLogout();
  }, [router]);

  return (
    <div
      className="w-full h-screen bg-white flex flex-col"
    >
      <div className="flex-1 flex items-center justify-center">
        <section
          className="rounded-xl shadow-xl p-8 w-[320px] flex flex-col items-center text-black border bg-white"
        >
          <h1 className={`${poppins.className} text-2xl font-bold mb-6`}>
            <span className="text-orange-600">ACT</span>
            <span className="text-gray-800"> Logout</span>
          </h1>
          <p className="text-gray-600 text-center">
            Logging out…<br />
            กำลังออกจากระบบ กรุณารอสักครู่
          </p>
        </section>
      </div>
    </div>
  );
}
