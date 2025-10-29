"use client";

import { useParams } from "next/navigation";

export default function WorkspaceIndexPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  return (
    <div className="p-4">
      <div className="text-lg font-medium mb-2">Select a channel</div>
      <p className="text-sm text-zinc-400">
        Choose a channel on the left to start chatting in workspace{" "}
        {String(workspaceId)}.
      </p>
    </div>
  );
}
