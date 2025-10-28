"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listChannels, createChannel } from "@/lib/api/endpoints";

type Channel = { id?: string; _id?: string; name: string };

function normalize(ch: Channel): { id: string; name: string } | null {
  const id = (ch as any).id ?? (ch as any)._id;
  const name = (ch as any).name;
  if (!id || !name) return null;
  return { id, name };
}

export function ChannelSidebar({ workspaceId }: { workspaceId: string }) {
  const [channels, setChannels] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await listChannels(workspaceId);
        const arr: Channel[] = (res as any)?.channels ?? (Array.isArray(res) ? res : []);
        const normalized = arr.map(normalize).filter(Boolean) as Array<{ id: string; name: string }>;
        setChannels(normalized);
      } catch (e: any) {
        setErr(e?.message || "Failed to load channels");
      } finally {
        setLoading(false);
      }
    })();
  }, [workspaceId]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setErr(null);
    try {
      const res = await createChannel(workspaceId, newName.trim());
      // res.channel is { _id, name, ... }
      const normalized = normalize(res.channel as any);
      if (normalized) {
        setChannels((cs) => [...cs, normalized]);
      } else {
        // fallback: refetch if shape is not as expected
        try {
          const r = await listChannels(workspaceId);
          const arr: Channel[] = (r as any)?.channels ?? (Array.isArray(r) ? r : []);
          const mapped = arr.map(normalize).filter(Boolean) as Array<{ id: string; name: string }>;
          setChannels(mapped);
        } catch {}
      }
      setNewName("");
      // optionally close the inline dialog
      document.getElementById("create-channel-dialog")?.classList.add("hidden");
    } catch (e: any) {
      setErr(e?.message || "Failed to create channel");
    } finally {
      setCreating(false);
    }
  };

  return (
    <aside className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-zinc-400">Channels</div>
        <button
          className="btn btn-ghost text-xs"
          onClick={() => document.getElementById("create-channel-dialog")?.classList.toggle("hidden")}
        >
          + New
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : err ? (
        <p className="text-sm text-red-400">{err}</p>
      ) : channels.length === 0 ? (
        <p className="text-sm text-zinc-400">No channels yet.</p>
      ) : (
        <nav className="space-y-1">
          {channels.map((c) => (
            <Link
              key={c.id}
              href={`/app/w/${workspaceId}/c/${encodeURIComponent(c.id)}`}
              className="block rounded-lg px-3 py-2 hover:bg-white/5"
              title={`#${c.name}`}
            >
              #{c.name}
            </Link>
          ))}
        </nav>
      )}

      {/* Create Channel Dialog (simple inline) */}
      <div id="create-channel-dialog" className="hidden mt-4">
        <form onSubmit={onCreate} className="space-y-2">
          <input
            className="input"
            placeholder="channel-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="btn btn-primary" disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => document.getElementById("create-channel-dialog")?.classList.add("hidden")}
            >
              Cancel
            </button>
          </div>
          {err && <p className="text-xs text-red-400">{err}</p>}
        </form>
      </div>
    </aside>
  );
}
