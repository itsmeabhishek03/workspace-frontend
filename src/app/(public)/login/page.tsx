"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { login } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/store";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("abhi@gmail.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { token, ready } = useAuth((s) => ({ token: s.token, ready: s.ready }));
  const setToken = useAuth((s) => s.setToken);
  const setUser = useAuth((s) => s.setUser);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.push("/app");
    }
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await login({ email, password });
      setToken(res.accessToken);
      setUser(res.user ?? null);
      router.replace("/app");
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-sm text-zinc-400 mb-6">Sign in to your workspace</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••"
            />
          </div>
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-5 text-sm text-zinc-400">
          New here?{" "}
          <Link className="underline" href="/register">
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
