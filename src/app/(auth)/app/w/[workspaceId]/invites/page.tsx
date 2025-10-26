"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { sendInvite } from "@/lib/api/endpoints";

type InviteRole = "member" | "admin";

export default function InvitesPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("member");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lastInvite, setLastInvite] = useState<any | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true); setErr(null);
    try {
      const res = await sendInvite(String(workspaceId), { email: email.trim().toLowerCase(), role });
      setLastInvite(res.invite);
    } catch (e:any) {
      setErr(e?.message || "Failed to send invite");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!lastInvite?.email) return;
    setBusy(true); setErr(null);
    try {
      const res = await sendInvite(String(workspaceId), { email: lastInvite.email, role: lastInvite.role });
      setLastInvite(res.invite);
    } catch (e:any) {
      setErr(e?.message || "Failed to resend");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Invitations</h1>
        <p className="text-sm text-zinc-400">Send workspace invites by email (admin+)</p>
      </div>

      <form onSubmit={submit} className="card p-5 space-y-4 max-w-xl">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="teammate@example.com" />
        </div>
        <div>
          <label className="label">Role</label>
          <select className="input" value={role} onChange={e=>setRole(e.target.value as InviteRole)}>
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
        </div>
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button className="btn btn-primary" disabled={busy}>{busy ? "Sending..." : "Send invite"}</button>
      </form>

      {lastInvite && (
        <div className="card p-5 max-w-xl">
          <div className="text-lg font-medium mb-2">Last invite</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="text-zinc-400">Email</div><div>{lastInvite.email}</div>
            <div className="text-zinc-400">Role</div><div>{lastInvite.role}</div>
            <div className="text-zinc-400">Status</div><div>{lastInvite.status ?? "pending"}</div>
            <div className="text-zinc-400">Send Count</div><div>{lastInvite.sendCount ?? 0}</div>
            {lastInvite.lastSentAt && (<><div className="text-zinc-400">Last Sent</div><div>{new Date(lastInvite.lastSentAt).toLocaleString()}</div></>)}
            {lastInvite.expiresAt && (<><div className="text-zinc-400">Expires</div><div>{new Date(lastInvite.expiresAt).toLocaleString()}</div></>)}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-ghost" onClick={resend} disabled={busy}>Resend</button>
          </div>
          {process.env.NEXT_PUBLIC_SHOW_INVITE_TOKEN === "true" && lastInvite.token && (
            <p className="text-xs text-zinc-500 mt-3 break-all">Token (dev): {lastInvite.token}</p>
          )}
        </div>
      )}

      {!lastInvite && (
        <p className="text-sm text-zinc-500">No invites sent in this session yet.</p>
      )}
    </div>
  );
}
