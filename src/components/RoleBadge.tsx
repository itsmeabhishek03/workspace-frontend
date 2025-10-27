"use client";

export function RoleBadge({ role }: { role: "owner" | "admin" | "member" }) {
  const styles: Record<string, string> = {
    owner: "bg-purple-500/20 text-purple-300 border border-purple-300/30",
    admin: "bg-blue-500/20 text-blue-300 border border-blue-300/30",
    member: "bg-zinc-700/40 text-zinc-200 border border-white/10",
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-xs ${styles[role]}`}>{role}</span>
  );
}
