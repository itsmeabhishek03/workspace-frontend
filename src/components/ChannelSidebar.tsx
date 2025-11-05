"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  listChannels,
  createChannel,
  updateChannel,
  deleteChannel,
} from "@/lib/api/endpoints";
import { Pencil, Trash2, Check, X } from "lucide-react";

type Channel = { id?: string; _id?: string; name: string };
function normalize(ch: Channel): { id: string; name: string } | null {
  const id = ch.id ?? ch._id;
  if (!id || !ch.name) return null;
  return { id, name: ch.name };
}

export function ChannelSidebar({ workspaceId }: { workspaceId: string }) {
  const [channels, setChannels] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await listChannels(workspaceId);
        const arr: Channel[] = (res as any)?.channels ?? [];
        const normalized = arr.map(normalize).filter(Boolean) as Array<{
          id: string;
          name: string;
        }>;
        setChannels(normalized);
      } catch (e: any) {
        setErr(e?.message || "Failed to load channels");
      } finally {
        setLoading(false);
      }
    })();
  }, [workspaceId]);

  const refreshChannels = async () => {
    const res = await listChannels(workspaceId);
    const arr: Channel[] = (res as any)?.channels ?? [];
    const normalized = arr.map(normalize).filter(Boolean) as Array<{
      id: string;
      name: string;
    }>;
    setChannels(normalized);
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createChannel(workspaceId, newName.trim());
      await refreshChannels();
      setNewName("");
      document.getElementById("create-channel-dialog")?.classList.add("hidden");
    } catch (e: any) {
      setErr(e?.message || "Failed to create channel");
    } finally {
      setCreating(false);
    }
  };

  const onEdit = async (channelId: string) => {
    if (!editName.trim()) return;
    try {
      await updateChannel(workspaceId, channelId, { name: editName.trim() });
      await refreshChannels();
      setEditingId(null);
      setEditName("");
    } catch (err) {
      console.error("Failed to update channel:", err);
    }
  };

  const onDelete = async (channelId: string) => {
    if (!confirm("Are you sure you want to delete this channel?")) return;
    try {
      await deleteChannel(workspaceId, channelId);
      await refreshChannels();
    } catch (err) {
      console.error("Failed to delete channel:", err);
    }
  };

  return (
    <aside className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-zinc-400">Channels</div>
        <button
          className="btn btn-ghost text-xs text-white hover:text-gray-300"
          onClick={() =>
            document
              .getElementById("create-channel-dialog")
              ?.classList.toggle("hidden")
          }
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
          {channels.map((c) => {
            const href = `/app/w/${workspaceId}/c/${encodeURIComponent(c.id)}`;
            const active = pathname?.startsWith(href);
            const isEditing = editingId === c.id;

            return (
              <div
                key={c.id}
                className="flex items-center justify-between group"
              >
                {isEditing ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input flex-1 text-sm"
                    />
                    <button
                      onClick={() => onEdit(c.id)}
                      className="btn btn-ghost text-white hover:text-green-400"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn btn-ghost text-white hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href={href}
                      className={`block flex-1 rounded-lg px-3 py-2 transition-colors ${
                        active
                          ? "bg-white/10 text-white"
                          : "hover:bg-white/5 text-zinc-200"
                      }`}
                    >
                      #{c.name}
                    </Link>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="btn btn-ghost text-white hover:text-gray-300 p-1"
                        onClick={() => {
                          setEditingId(c.id);
                          setEditName(c.name);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-ghost text-white hover:text-gray-300 p-1"
                        onClick={() => onDelete(c.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </nav>
      )}

      {/* Create Channel Dialog */}
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
              className="btn btn-ghost text-white hover:text-gray-300"
              onClick={() =>
                document
                  .getElementById("create-channel-dialog")
                  ?.classList.add("hidden")
              }
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
