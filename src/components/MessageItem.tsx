// src/components/MessageItem.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/store";
import { editMessage, deleteMessage } from "@/lib/api/endpoints";

function initials(name?: string, email?: string) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }
  if (email) return email[0]?.toUpperCase() || "U";
  return "U";
}

export function MessageItem({ m }: { m: any }) {
  const { user } = useAuth((s) => ({ user: s.user }));
  const myId = user?.id;
  const isMine = String(m.user?.id || m.userId) === String(myId);

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(m.body);

  async function onSave() {
    if (!text.trim()) return;
    try {
      await editMessage(String(m._id || m.id), text.trim());
      setEditing(false);
    } catch (e: any) {
      alert(e?.message || "Failed to edit");
    }
  }

  async function onDelete() {
    const ok = confirm("Delete this message?");
    if (!ok) return;
    try {
      await deleteMessage(String(m._id || m.id));
    } catch (e: any) {
      alert(e?.message || "Failed to delete");
    }
  }

  const deleted = !!m.deletedAt;

  return (
    <div className="flex gap-3 items-start p-3 rounded-xl border border-white/10 bg-[#111114]/60">
      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-xs">
        {initials(m.user?.name, m.user?.email)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="truncate">
            <span className="text-sm font-medium">
              {m.user?.name || m.user?.email || "Unknown"}
            </span>
            <span className="ml-2 text-xs text-zinc-500">
              {new Date(m.createdAt).toLocaleString()}
              {m.editedAt && " • edited"}
            </span>
          </div>
          {/* controls (show for my messages; admins can still act, but server enforces) */}
          {!deleted && isMine && (
            <div className="flex gap-1">
              {!editing && (
                <button
                  className="btn btn-ghost text-xs px-2 py-1"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </button>
              )}
              <button
                className="btn btn-ghost text-xs px-2 py-1"
                onClick={onDelete}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {deleted ? (
          <div className="text-sm italic text-zinc-500">Message deleted</div>
        ) : editing ? (
          <div className="mt-2 flex gap-2">
            <textarea
              className="input min-h-[40px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="btn btn-primary" onClick={onSave}>
              Save
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setText(m.body);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="text-sm text-zinc-300 whitespace-pre-wrap break-words">
            {m.body}
          </div>
        )}
      </div>
    </div>
  );
}
