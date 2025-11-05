"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useLogout } from "@/lib/auth/store";
import {
  listMyWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from "@/lib/api/endpoints";

type WS = { id?: string; _id?: string; name: string; slug?: string };

export default function AppHome() {
  const router = useRouter();
  const { token, ready } = useAuth((s) => ({ token: s.token, ready: s.ready }));
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<WS[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const doLogout = useLogout();

  const fetchWorkspaces = async () => {
    try {
      const res = await listMyWorkspaces();
      const arr: WS[] =
        (res as any)?.workspaces ?? (Array.isArray(res) ? res : []);
      setWorkspaces(arr);
    } catch (e: any) {
      setErr(e?.message || "Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready) fetchWorkspaces();
  }, [token, ready]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createWorkspace({ name: newName.trim() });
    setNewName("");
    await fetchWorkspaces();
  };

  const onEdit = async (id: string) => {
    if (!editName.trim()) return;
    await updateWorkspace(id, { name: editName.trim() });
    setEditingId(null);
    setEditName("");
    await fetchWorkspaces();
  };

  const onDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this workspace?")) {
      await deleteWorkspace(id);
      await fetchWorkspaces();
    }
  };

  if (!ready) {
    return (
      <div className="min-h-dvh grid place-items-center p-6">
        <div className="card w-full max-w-md h-28 animate-pulse" />
      </div>
    );
  }
  if (!token) return null;

  return (
    <div className="min-h-dvh p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          Your <span className="gradient-text">Workspaces</span>
        </h1>
        <button className="btn btn-ghost" onClick={doLogout}>
          Logout
        </button>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-28 animate-pulse" />
          ))
        ) : err ? (
          <p className="text-red-400">{err}</p>
        ) : (
          <>
            {workspaces.map((ws) => {
              const id = ws.id ?? ws._id;
              return (
                <div
                  key={id ?? Math.random()}
                  className="card p-5 text-left hover:scale-[1.01] transition-transform space-y-2"
                >
                  {editingId === id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (id) onEdit(id);
                      }}
                    >
                      <input
                        className="input w-full mb-2"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Edit name"
                      />
                      <div className="flex gap-2">
                        <button className="btn btn-primary w-full">Save</button>
                        <button
                          type="button"
                          className="btn btn-ghost w-full btn-ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="text-lg font-medium">{ws.name}</div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {id ? "Open workspace" : "Invalid ID"}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          className="btn btn-sm btn-outline btn-ghost"
                          onClick={() => {
                            setEditingId(id!);
                            setEditName(ws.name);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-error btn-ghost"
                          onClick={() => id && onDelete(id)}
                        >
                          Delete
                        </button>
                        <button
                          className="btn btn-sm btn-secondary btn-ghost"
                          onClick={() => id && router.push(`/app/w/${id}`)}
                        >
                          Open
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* Create new workspace card */}
            <div className="card p-5">
              <form onSubmit={onCreate} className="space-y-3">
                <div className="text-lg font-medium">Create workspace</div>
                <input
                  className="input"
                  placeholder="My Team"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button className="btn btn-primary w-full">Create</button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
