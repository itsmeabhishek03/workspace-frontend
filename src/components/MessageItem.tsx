"use client";

type MsgUser = { id?: string; _id?: string; name?: string; email?: string; avatarUrl?: string | null };
type Message = {
  id?: string;
  _id?: string;
  body: string;
  userId?: string;
  user?: MsgUser;              
  createdAt?: string | Date;
  editedAt?: string | Date | null;
  deletedAt?: string | Date | null;
  pending?: boolean;            
  failed?: boolean;        
};

function timeAgo(ts?: string | Date | null) {
  if (!ts) return "";
  const d = typeof ts === "string" ? new Date(ts) : ts;
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleString();
}

export function MessageItem({ m }: { m: Message }) {
  const id = (m as any).id ?? (m as any)._id;
  const user = m.user;
  const initials =
    (user?.name || user?.email || "U")
      .split(" ")
      .map((p) => p[0]?.toUpperCase())
      .slice(0, 2)
      .join("");

  const soft = m.deletedAt ? "line-through text-zinc-500" : "";
  const pendingBadge = m.pending ? "opacity-60" : "";
  const failedBadge = m.failed ? "border-red-500/40" : "border-white/10";

  return (
    <div key={id} className={`flex gap-3 items-start p-3 rounded-xl border ${failedBadge} bg-[#111114]/60`}>
      {/* avatar */}
      <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-lg bg-white/10 text-sm">
        {initials}
      </div>

      {/* content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {user?.name || user?.email || "User"}
          </div>
          <div className="text-[11px] text-zinc-500">
            {timeAgo(m.createdAt)}
            {m.editedAt && <span className="ml-1 italic">(edited)</span>}
            {m.deletedAt && <span className="ml-1 italic text-red-300">(deleted)</span>}
          </div>
          {m.pending && <span className="text-[11px] text-zinc-500 ml-2">sending…</span>}
          {m.failed && <span className="text-[11px] text-red-400 ml-2">failed</span>}
        </div>
        <div className={`mt-1 whitespace-pre-wrap break-words text-sm ${soft} ${pendingBadge}`}>
          {m.body}
        </div>
      </div>
    </div>
  );
}