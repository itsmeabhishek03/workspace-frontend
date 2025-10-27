"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { listMessages } from "@/lib/api/endpoints";
import { MessageItem } from "./MessageItem";

type RawMessage = {
  id?: string; _id?: string;
  body: string;
  userId?: string;
  user?: any;
  createdAt?: string;
  editedAt?: string | null;
  deletedAt?: string | null;
};

type PageResp = {
  messages: RawMessage[];
  page: number;
  totalPages: number;
};

const PAGE_SIZE = 30;

export function MessageList({
  channelId,
  refreshKey,       // bump this after send to refetch newest page
  pendingMessages,  // optimistic messages array
}: {
  channelId: string;
  refreshKey: number;
  pendingMessages: RawMessage[];
}) {
  const [pages, setPages] = useState<PageResp[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // first load
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const res = await listMessages(channelId, 1, PAGE_SIZE);
        if (!alive) return;
        const tp = (res as any)?.totalPages ?? 1;
        setPages([res as any]);
        setPage(1);
        setTotalPages(tp);
        // scroll to bottom after initial load
        setTimeout(() => {
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
        }, 0);
      } catch (e:any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load messages");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [channelId]);

  // on refreshKey bump (after sending), refetch page 1 and replace it
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await listMessages(channelId, 1, PAGE_SIZE);
        if (!alive) return;
        setPages((prev) => {
          const [, ...rest] = prev;
          return [res as any, ...rest];
        });
        setPage(1);
      } catch {}
    })();
    return () => { alive = false; };
  }, [refreshKey, channelId]);

  async function loadMore() {
    if (totalPages && page >= totalPages) return;
    const next = page + 1;
    try {
      const res = await listMessages(channelId, next, PAGE_SIZE);
      setPages((prev) => [...prev, res as any]);
      setPage(next);
    } catch (e:any) {
      setErr(e?.message || "Failed to load more");
    }
  }

  // flatten, dedupe, sort oldest → newest
  const items = useMemo(() => {
    const map = new Map<string, RawMessage>();
    for (const p of pages) {
      for (const m of p.messages) {
        const id = (m as any).id ?? (m as any)._id;
        if (!id) continue;
        map.set(id, m);
      }
    }
    // attach pending optimistic (those have no real id → use temp)
    const pendings = pendingMessages.map((m, i) => ({
      ...m,
      id: `pending-${i}`,
      pending: true,
    })) as any[];

    const arr = [...map.values(), ...pendings];
    arr.sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    return arr;
  }, [pages, pendingMessages]);

  return (
    <div className="h-[calc(100dvh-220px)] card p-0 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="text-sm text-zinc-400">Messages</div>
        {totalPages && page < totalPages ? (
          <button className="btn btn-ghost text-xs" onClick={loadMore}>
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
              <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}
        {err && <p className="text-sm text-red-400">{err}</p>}

        {!loading && items.length === 0 && (
          <div className="text-sm text-zinc-400 text-center py-10">No messages yet. Say hello 👋</div>
        )}

        {items.map((m:any) => (
          <MessageItem key={(m as any).id ?? (m as any)._id} m={m} />
        ))}
      </div>
    </div>
  );
}
