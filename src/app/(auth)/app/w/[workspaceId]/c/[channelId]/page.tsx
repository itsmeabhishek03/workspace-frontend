"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/store";
import { useState } from "react";
import { MessageList } from "@/components/MessageList";
import { MessageComposer } from "@/components/MessageComposer";

export default function ChannelMessagesPage() {
  const { workspaceId, channelId } = useParams<{ workspaceId: string; channelId: string }>();
  const { token, ready } = useAuth(s => ({ token: s.token, ready: s.ready }));
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState(0);
  const [pending, setPending] = useState<any[]>([]);

  if (!ready) {
    return <div className="min-h-dvh grid place-items-center p-6">
      <div className="card w-full max-w-md h-28 animate-pulse" />
    </div>;
  }
  if (!token) { router.replace("/login"); return null; }

  function onOptimisticAdd(m: any) {
    setPending((p) => [...p, m]);
  }

  function onSettled(ok: boolean) {
    // clear optimistic entries either way and refetch latest
    setPending([]);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-medium">Channel</div>
          <div className="text-sm text-zinc-500">Workspace: {workspaceId} • Channel: {channelId}</div>
        </div>
      </div>

      <MessageList
        channelId={String(channelId)}
        refreshKey={refreshKey}
        pendingMessages={pending}
      />

      <MessageComposer
        channelId={String(channelId)}
        onOptimisticAdd={onOptimisticAdd}
        onSettled={onSettled}
      />
    </div>
  );
}
