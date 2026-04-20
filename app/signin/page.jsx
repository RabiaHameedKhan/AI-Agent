"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/post-login";
  const queryError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentialsSignIn(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    window.location.href = result?.url || callbackUrl;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#2D0E28] via-[#4A1942] to-[#7B3F74] px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-[#C9A84C]/40 bg-[#FDFAF5] p-7 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-[#C9A84C]">Welcome Back</p>
        <h1 className="mt-2 text-4xl text-[#4A1942] [font-family:var(--font-cormorant)]">Sign In</h1>
        <p className="mt-2 text-sm text-[#2C2C2C]/75">Access your bookings and salon dashboard.</p>

        <form onSubmit={handleCredentialsSignIn} className="mt-6 space-y-4">
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

          {(error || queryError) && (
            <p className="text-sm text-red-700">{error || "Invalid email or password."}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#C9A84C] px-4 py-2.5 text-sm font-semibold text-[#4A1942] transition hover:bg-[#E8D5A3] disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
          className="mt-3 w-full rounded-full border border-[#C9A84C]/55 bg-white px-4 py-2.5 text-sm font-semibold text-[#4A1942] transition hover:bg-[#F5ECD7]"
        >
          Continue with Google
        </button>

        <p className="mt-5 text-center text-sm text-[#2C2C2C]/80">
          New here?{" "}
          <Link href="/register" className="font-semibold text-[#4A1942] hover:text-[#7B3F74]">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
