"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useLogout } from "@/lib/auth/store";
import { ChannelSidebar } from "@/components/ChannelSidebar";

export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { token, ready } = useAuth(s => ({ token: s.token, ready: s.ready }));
  const router = useRouter();
  const logout = useLogout();

  if (!ready) return <div className="min-h-dvh grid place-items-center p-6"><div className="card w-full max-w-md h-28 animate-pulse" /></div>;
  if (!token) { router.replace("/login"); return null; }

  return (
    <div className="min-h-dvh p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Workspace</h1>
          <p className="text-sm text-zinc-400">ID: <span className="text-zinc-300">{workspaceId}</span></p>
        </div>
        <div className="flex gap-2">
          <Link className="btn btn-ghost" href={`/app/w/${workspaceId}/members`}>Members</Link>
          <Link className="btn btn-ghost" href={`/app/w/${workspaceId}/invites`}>Invites</Link>
          <button className="btn btn-ghost" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <ChannelSidebar workspaceId={String(workspaceId)} />
        <main className="card p-6">
          <div className="text-lg font-medium mb-2">Select a channel</div>
          <p className="text-sm text-zinc-400">Choose a channel from the left to view messages.</p>
        </main>
      </div>
    </div>
  );
}
