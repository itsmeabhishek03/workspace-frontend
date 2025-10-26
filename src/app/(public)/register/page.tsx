"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/store";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName]   = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const setToken = useAuth(s => s.setToken);
  const setUser  = useAuth(s => s.setUser);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const res = await registerUser({ email, name, password });
      setToken(res.accessToken);
      setUser(res.user ?? null);
      router.replace("/app");
    } catch (e: any) {
      setErr(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-sm text-zinc-400 mb-6">Join and start collaborating</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Alex Doe" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••" />
          </div>
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-5 text-sm text-zinc-400">
          Already have an account? <Link className="underline" href="/login">Sign in</Link>
        </div>
      </div>
    </main>
  );
}
