"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";

const poppins = Poppins({ weight: ["700"], subsets: ["latin"] });

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setErr(res.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div
      className="w-full h-screen bg-cover bg-center flex flex-col"
      style={{
        backgroundImage: "url('/uploads/images/bg-activity.png')",
      }}
    >
      {/* Login Box */}
      <div className="flex-1 flex items-center justify-center">
        <div className="rounded-xl shadow-xl p-8 w-[320px] flex flex-col items-center text-black border bg-white">
          <h1 className={`${poppins.className} text-2xl font-bold mb-6 text-center`}>
            Login
          </h1>
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border px-3 py-2 focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border px-3 py-2 focus:outline-none"
              required
            />
            {err && <p className="text-red-600 text-sm">{err}</p>}
            <button
              type="submit"
              className="mt-2 rounded bg-orange-500 text-white py-2 hover:bg-orange-600 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
