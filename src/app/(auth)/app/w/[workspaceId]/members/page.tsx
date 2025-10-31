"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/store";
import { listMembers, changeRole, removeMember } from "@/lib/api/endpoints";
import { RoleBadge } from "@/components/RoleBadge";

type Role = "owner" | "admin" | "member";
type MemberRow = {
  userId: string;
  role: Role;
  joinedAt: string;
  user: { id: string; name: string; email: string; avatarUrl?: string | null };
};

export default function MembersPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const router = useRouter();

  // table state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"" | Role>("");
  const [sort, setSort] = useState<"name" | "createdAt">("name");

  // data
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const { token, ready, user } = useAuth((s) => ({
    token: s.token,
    ready: s.ready,
    user: s.user,
  }));

  const myUserId = user?.id ? String(user.id) : "";
  const me = useMemo(
    () => rows.find((r) => String(r.userId) === myUserId),
    [rows, myUserId]
  );
  const myRole: Role | null = me?.role ?? null;

  const ownerCount = useMemo(
    () => rows.filter((r) => r.role === "owner").length,
    [rows]
  );

  // fetch members
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await listMembers({
          workspaceId: String(workspaceId),
          page,
          limit,
          search,
          role,
          sort,
        });
        if (!alive) return;
        setRows(res.members as any);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to fetch members");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [token, ready, workspaceId, page, limit, search, role, sort, router]);

  // admin guard — your backend already protects this route; this UI is extra
  //  const myRole: Role | null = me?.role ?? null;
  const isAdminPlus = myRole === "admin" || myRole === "owner";

  // client-side permission helpers (mirror your rules best-effort)
  function canChangeRole(target: MemberRow, to: Role) {
    if (!isAdminPlus) return false;
    if (myRole === "admin") {
      // admins cannot modify admins/owners; only members
      if (target.role !== "member") return false;
      if (to === "owner") return false; // cannot promote to owner
      return true;
    }
    // owner rules:
    if (target.userId === myUserId && to !== "owner") {
      // self-demotion: block if last owner
      if (ownerCount <= 1) return false;
    }
    // demoting another owner: must not remove last owner
    if (target.role === "owner" && to !== "owner" && ownerCount <= 1)
      return false;
    return true;
  }

  function canRemove(target: MemberRow) {
    if (!isAdminPlus) return false;
    if (myRole === "admin") return target.role === "member"; // admins can remove members only
    // owner can remove anyone except last owner (and prevent self if last owner)
    if (target.role === "owner" && ownerCount <= 1) return false;
    if (
      target.userId === myUserId &&
      target.role === "owner" &&
      ownerCount <= 1
    )
      return false;
    return true;
  }

  async function onChangeRole(target: MemberRow, to: Role) {
    if (target.role === to) return;
    if (!canChangeRole(target, to)) return;
    const ok = confirm(`Change role of ${target.user.name} to "${to}"?`);
    if (!ok) return;

    // optimistic update
    const prev = [...rows];
    setRows(
      rows.map((r) => (r.userId === target.userId ? { ...r, role: to } : r))
    );
    try {
      await changeRole(String(workspaceId), target.userId, to);
      // refetch to ensure counts/guards (like ownerCount) are correct
      const fresh = await listMembers({
        workspaceId: String(workspaceId),
        page,
        limit,
        search,
        role,
        sort,
      });
      setRows(fresh.members as any);
      setTotal(fresh.total);
      setTotalPages(fresh.totalPages);
    } catch (e: any) {
      // rollback
      setRows(prev);
      alert(e?.message || "Failed to change role");
    }
  }

  async function onRemove(target: MemberRow) {
    if (!canRemove(target)) return;
    const ok = confirm(`Remove ${target.user.name} from this workspace?`);
    if (!ok) return;

    const prev = [...rows];
    setRows(rows.filter((r) => r.userId !== target.userId));
    try {
      await removeMember(String(workspaceId), target.userId);
      // if we removed someone relevant to ownerCount, you may want to refetch:
      const fresh = await listMembers({
        workspaceId: String(workspaceId),
        page,
        limit,
        search,
        role,
        sort,
      });
      setRows(fresh.members as any);
      setTotal(fresh.total);
      setTotalPages(fresh.totalPages);
    } catch (e: any) {
      setRows(prev);
      alert(e?.message || "Failed to remove member");
    }
  }

  if (!ready) {
    return (
      <div className="min-h-dvh grid place-items-center p-6">
        <div className="card w-full max-w-md h-28 animate-pulse" />
      </div>
    );
  }
  if (!token) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Members</h1>
          <p className="text-sm text-zinc-400">Admin+ only • Total: {total}</p>
        </div>
        <div className="text-sm">
          <span className="text-zinc-400">You: </span>
          {myRole ? (
            <RoleBadge role={myRole} />
          ) : (
            <span className="text-zinc-400">unknown</span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 grid gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="label">Search</label>
          <input
            className="input"
            placeholder="Name or email"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
        <div>
          <label className="label">Role</label>
          <select
            className="input"
            value={role}
            onChange={(e) => {
              setPage(1);
              setRole(e.target.value as any);
            }}
          >
            <option value="">All</option>
            <option value="owner">owner</option>
            <option value="admin">admin</option>
            <option value="member">member</option>
          </select>
        </div>
        <div>
          <label className="label">Sort</label>
          <select
            className="input"
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value as any);
            }}
          >
            <option value="name">name (A→Z)</option>
            <option value="createdAt">joined (newest)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 text-xs uppercase tracking-wide text-zinc-400 border-b border-white/10">
          <div className="col-span-4">User</div>
          <div className="col-span-2">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Joined</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : err ? (
          <div className="p-4 text-sm text-red-400">{err}</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-zinc-400">No members found.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {rows.map((m) => (
              <div
                key={m.userId}
                className="grid grid-cols-12 items-center px-4 py-3"
              >
                {/* User */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                    {(m.user.name || m.user.email)
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {m.user.name || "—"}
                    </div>
                    <div className="truncate text-xs text-zinc-500">
                      {m.user.email}
                    </div>
                  </div>
                </div>

                {/* Email (short) */}
                <div className="col-span-2 truncate text-sm">
                  {m.user.email}
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <RoleBadge role={m.role} />
                </div>

                {/* Joined */}
                <div className="col-span-2 text-sm text-zinc-400">
                  {m.joinedAt ? new Date(m.joinedAt).toLocaleString() : "—"}
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  <div className="flex items-center justify-end gap-2">
                    {/* Role change buttons */}
                    {(["member", "admin", "owner"] as Role[]).map((r) => (
                      <button
                        key={r}
                        className="btn btn-ghost text-xs px-2 py-1"
                        disabled={!canChangeRole(m, r) || m.role === r}
                        title={
                          !canChangeRole(m, r)
                            ? "Not allowed"
                            : m.role === r
                            ? "Already this role"
                            : `Make ${r}`
                        }
                        onClick={() => onChangeRole(m, r)}
                      >
                        {r[0].toUpperCase()}
                      </button>
                    ))}
                    {/* Remove */}
                    <button
                      className="btn btn-ghost text-xs px-2 py-1"
                      disabled={!canRemove(m)}
                      title={!canRemove(m) ? "Not allowed" : "Remove"}
                      onClick={() => onRemove(m)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input w-28"
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(parseInt(e.target.value, 10));
            }}
          >
            {[10, 20, 30, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
          <button
            className="btn btn-ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            className="btn btn-ghost"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
