"use client";

import { useState } from "react";
import { postMessage } from "@/lib/api/endpoints";

type OptimisticMsg = {
  body: string;
  createdAt: string;
  user?: { name?: string; email?: string };
  pending?: boolean;
  failed?: boolean;
};

export function MessageComposer({
  channelId,
  onOptimisticAdd,
  onSettled, 
}: {
  channelId: string;
  onOptimisticAdd: (m: OptimisticMsg) => void;
  onSettled: (ok: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    const body = value.trim();
    if (!body || sending) return;

    const optimistic: OptimisticMsg = {
      body,
      createdAt: new Date().toISOString(),
      user: { name: "You" },
      pending: true,
    };
    onOptimisticAdd(optimistic);
    setValue("");
    setSending(true);

    try {
      await postMessage(channelId, body);
      onSettled(true);  
    } catch {
      onSettled(false);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div className="card p-3">
      <div className="flex gap-2">
        <textarea
          className="input min-h-[44px] h-[44px] resize-y"
          placeholder="Write a message…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button className="btn btn-primary shrink-0" onClick={send} disabled={sending || !value.trim()}>
          Send
        </button>
      </div>
      <div className="mt-2 text-[11px] text-zinc-500">Press Enter to send • Shift+Enter for newline</div>
    </div>
  );
}
