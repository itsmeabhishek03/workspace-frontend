"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/store";
import { MessageList } from "@/components/MessageList";
import { MessageComposer } from "@/components/MessageComposer";
import { getSocket } from "@/lib/realtime/socket";

export default function ChannelMessagesPage() {
  const { workspaceId, channelId } = useParams<{
    workspaceId: string;
    channelId: string;
  }>();
  const { token, ready } = useAuth((s) => ({ token: s.token, ready: s.ready }));
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState(0);
  const [pending, setPending] = useState<any[]>([]);
  const [live, setLive] = useState<any[]>([]); // messages coming from socket

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      router.replace("/login");
      return;
    }

    const s = getSocket();

    // subscribe to this channel
    s.emit("subscribe:channel", { channelId: String(channelId) });

    const onCreated = (payload: any) => {
      const msg = payload?.message;
      if (!msg) return;
      if (String(msg.channelId) !== String(channelId)) return;
      setLive((prev) => [...prev, msg]);
    };
    const onEdited = (payload: any) => {
      const msg = payload?.message;
      if (!msg) return;
      if (String(msg.channelId) !== String(channelId)) return;
      // merge by id (MessageList merges live into base)
      setLive((prev) => {
        const id = String(msg._id ?? msg.id);
        const map = new Map<string, any>(
          prev.map((m) => [String(m._id ?? m.id), m])
        );
        map.set(id, { ...(map.get(id) || {}), ...msg });
        return [...map.values()];
      });
    };
    const onDeleted = (payload: any) => {
      const msg = payload?.message;
      if (!msg) return;
      if (String(msg.channelId) !== String(channelId)) return;
      setLive((prev) => {
        const id = String(msg._id ?? msg.id);
        const map = new Map<string, any>(
          prev.map((m) => [String(m._id ?? m.id), m])
        );
        map.set(id, { ...(map.get(id) || {}), ...msg }); // contains deletedAt
        return [...map.values()];
      });
    };

    s.on("message:created", onCreated);
    s.on("message:edited", onEdited);
    s.on("message:deleted", onDeleted);

    return () => {
      s.emit("unsubscribe:channel", { channelId: String(channelId) });
      s.off("message:created", onCreated);
      s.off("message:edited", onEdited);
      s.off("message:deleted", onDeleted);
      setLive([]); // clear live buffer when switching channels
    };
  }, [ready, token, channelId, router]);

  function onOptimisticAdd(m: any) {
    setPending((p) => [...p, m]);
  }
  function onSettled(_ok: boolean) {
    setPending([]);
    setRefreshKey((k) => k + 1);
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
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-medium">Channel</div>
          <div className="text-sm text-zinc-500">
            Workspace: {workspaceId} • Channel: {channelId}
          </div>
        </div>
      </div>

      <MessageList
        channelId={String(channelId)}
        refreshKey={refreshKey}
        pendingMessages={pending}
        liveMessages={live}
        token={token} // 👈 add this
      />

      <MessageComposer
        channelId={String(channelId)}
        onOptimisticAdd={onOptimisticAdd}
        onSettled={onSettled}
      />
    </div>
  );
}
