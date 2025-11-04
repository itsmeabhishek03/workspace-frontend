"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { listMessages } from "@/lib/api/endpoints";
import { MessageItem } from "./MessageItem";

type RawMessage = {
  id?: string;
  _id?: string;
  body: string;
  userId?: string;
  user?: any;
  createdAt?: string;
  editedAt?: string | null;
  deletedAt?: string | null;
};

const PAGE_SIZE = 30;

export function MessageList({
  channelId,
  refreshKey,
  pendingMessages,
  liveMessages, // NEW: real-time appended messages
  onEditFromLive, // optional callbacks
  onDeleteFromLive,
}: {
  channelId: string;
  refreshKey: number;
  pendingMessages: RawMessage[];
  liveMessages?: RawMessage[];
  onEditFromLive?: (m: RawMessage) => void;
  onDeleteFromLive?: (m: RawMessage) => void;
}) {
  const [messages, setMessages] = useState<RawMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [oldestTs, setOldestTs] = useState<string | null>(null); // for `before` pagination
  const scrollRef = useRef<HTMLDivElement>(null);

  // initial load (latest PAGE_SIZE)
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await listMessages(channelId, PAGE_SIZE);
        const arr = res?.messages ?? [];
        const sorted = [...arr].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        if (!alive) return;
        setMessages(sorted);
        const first = sorted[0]?.createdAt;
        setOldestTs(first ? String(first) : null);

        // Scroll bottom
        setTimeout(() => {
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
        }, 0);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load messages");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [channelId]);

  // refresh “page 1” (newest), e.g., after sending
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await listMessages(channelId, PAGE_SIZE);
        const arr = (res as any)?.messages ?? (Array.isArray(res) ? res : []);
        const sorted = [...arr].sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        if (!alive) return;
        setMessages(sorted);
        const first = sorted[0]?.createdAt;
        setOldestTs(first ? String(first) : null);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, [refreshKey, channelId]);

  async function loadOlder() {
    if (!oldestTs) return;

    try {
      const limit = PAGE_SIZE;
      const before = String(oldestTs);

      const res = await listMessages(channelId, limit, before);
      const data = res?.messages ?? [];

      if (data.length === 0) {
        setOldestTs(null); // No more older messages
        return;
      }

      // Sort messages oldest → newest
      const olderSorted = [...data].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Prepend older messages
      setMessages((prev) => [...olderSorted, ...prev]);

      // Update oldest timestamp for next pagination
      const first = olderSorted[0]?.createdAt;
      setOldestTs(first ? String(first) : null);
    } catch (e: any) {
      setErr(e?.message || "Failed to load older messages");
    }
  }

  // merge live + pending on render (without mutating base state)
  const items = useMemo(() => {
    const base = [...messages];
    const pendings = (pendingMessages || []).map((m: any, i: number) => ({
      ...m,
      id: m.id ?? m._id ?? `pending-${i}`,
      pending: true,
    }));
    const lives = (liveMessages || []).map((m: any) => ({
      ...m,
      id: m.id ?? m._id,
    }));
    // merge: base + lives (dedupe by id) + pendings at end
    const map = new Map<string, any>();
    for (const m of base) {
      const id = String((m as any).id ?? (m as any)._id);
      map.set(id, m);
    }
    for (const m of lives) {
      const id = String((m as any).id ?? (m as any)._id);
      const existing = map.get(id);
      if (!existing) map.set(id, m);
      else map.set(id, { ...existing, ...m }); // allow edits/deletes to override
    }
    const merged = [...map.values(), ...pendings];
    merged.sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return merged;
  }, [messages, pendingMessages, liveMessages]);

  return (
    <div className="h-[calc(100dvh-220px)] card p-0 overflow-x-auto">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="text-sm text-zinc-400">Messages</div>
        {oldestTs ? (
          <button className="btn btn-ghost text-xs" onClick={loadOlder}>
            Load older
          </button>
        ) : (
          <div className="text-[11px] text-zinc-500">Beginning</div>
        )}
      </div>

      <div ref={scrollRef} className="overflow-y-auto p-3 space-y-2">
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        )}
        {err && <p className="text-sm text-red-400">{err}</p>}
        {!loading && items.length === 0 && (
          <div className="text-sm text-zinc-400 text-center py-10">
            No messages yet. Say hello 👋
          </div>
        )}
        {items.map((m: any) => (
          <MessageItem key={(m as any).id ?? (m as any)._id} m={m} />
        ))}
      </div>
    </div>
  );
}
