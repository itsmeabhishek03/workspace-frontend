"use client";

import { useAuth, useLogout } from "@/lib/auth/store";
import { useParams, useRouter } from "next/navigation";
import { ChannelSidebar } from "@/components/ChannelSidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { token, ready } = useAuth((s) => ({ token: s.token, ready: s.ready }));
  const router = useRouter();
  const doLogout = useLogout();
  const pathname = usePathname();

  const noLayoutPath = ["/members", "/invites"];

  if (!ready) {
    return (
      <div className="min-h-dvh grid place-items-center p-6">
        <div className="card w-full max-w-md h-28 animate-pulse" />
      </div>
    );
  }
  if (!token) {
    router.replace("/login");
    return null;
  }

  if (noLayoutPath.some((path) => pathname.endsWith(path))) {
    return (
      <div className="min-h-dvh p-6">
        <header className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Workspace</h1>
            <p className="text-sm text-zinc-400">
              ID: <span className="text-zinc-300">{workspaceId}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              className="btn btn-ghost"
              href={`/app/w/${workspaceId}/members`}
            >
              Members
            </Link>
            <Link
              className="btn btn-ghost"
              href={`/app/w/${workspaceId}/invites`}
            >
              Invites
            </Link>
            <button className="btn btn-ghost" onClick={doLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* No sidebar layout */}
        <div className="grid gap-6">
          <main className="card p-4">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Workspace</h1>
          <p className="text-sm text-zinc-400">
            ID: <span className="text-zinc-300">{workspaceId}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            className="btn btn-ghost"
            href={`/app/w/${workspaceId}/members`}
          >
            Members
          </Link>
          <Link
            className="btn btn-ghost"
            href={`/app/w/${workspaceId}/invites`}
          >
            Invites
          </Link>
          <button className="btn btn-ghost" onClick={doLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <ChannelSidebar workspaceId={String(workspaceId)} />
        <main className="card p-4">{children}</main>
      </div>
    </div>
  );
}
