"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      setLoading(false);
      setError(data.error || "Unable to register.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setLoading(false);
    if (signInResult?.error) {
      router.push("/signin");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#2D0E28] via-[#4A1942] to-[#7B3F74] px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-[#C9A84C]/40 bg-[#FDFAF5] p-7 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-[#C9A84C]">Join Lumiere</p>
        <h1 className="mt-2 text-4xl text-[#4A1942] [font-family:var(--font-cormorant)]">Create Account</h1>
        <p className="mt-2 text-sm text-[#2C2C2C]/75">Book appointments and manage everything in one place.</p>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[#4A1942]">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#C9A84C]/40 bg-white px-4 py-2.5 text-sm outline-none ring-[#C9A84C] focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#4A1942]">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#C9A84C]/40 bg-white px-4 py-2.5 text-sm outline-none ring-[#C9A84C] focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#4A1942]">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#C9A84C]/40 bg-white px-4 py-2.5 text-sm outline-none ring-[#C9A84C] focus:ring-2"
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-[#4A1942] transition hover:bg-[#E8D5A3] disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#2C2C2C]/80">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-[#4A1942] hover:text-[#7B3F74]">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
