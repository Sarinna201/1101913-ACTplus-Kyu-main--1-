"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["700"],
  subsets: ["latin"],
});

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // ✅ ฟอร์ม validation
    if (!username || !email || !password) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (!email.includes("@")) {
      setError("อีเมลไม่ถูกต้อง");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v0/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "สมัครสมาชิกไม่สำเร็จ");
        setLoading(false);
        return;
      }

      // ✅ บันทึกข้อมูล
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", String(data.user.id));
      localStorage.setItem("userImage", data.user.imageUrl);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("role", data.user.role);

      window.dispatchEvent(new Event("auth-change"));
      router.push("/");
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="w-full h-screen bg-cover bg-center flex flex-col"
      style={{
        backgroundImage: "url('/uploads/images/bg-activity.png')", // ✅ รูปพื้นหลัง
      }}
    >
      <div className="flex-1 flex items-center justify-center">
        <section className="rounded-xl shadow-xl p-8 w-[320px] flex flex-col items-center text-black border bg-white">
          <h1 className={`${poppins.className} text-2xl font-bold mb-6 text-center`}>
            Sign Up
          </h1>
          <form onSubmit={handleSignup} className="w-full flex flex-col gap-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded border px-3 py-2 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border px-3 py-2 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border px-3 py-2 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className={`mt-2 rounded text-white py-2 transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading ? "กำลังสมัคร..." : "Sign Up"}
            </button>

            {error && (
              <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
