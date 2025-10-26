"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useLogout } from "@/lib/auth/store";
import { listMyWorkspaces, createWorkspace } from "@/lib/api/endpoints";

type WS = { id?: string; _id?: string; name: string; slug?: string };

export default function AppHome() {
  const router = useRouter();
  const { token, ready } = useAuth(s => ({ token: s.token, ready: s.ready }));
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<WS[]>([]);
  const [newName, setNewName] = useState("");
  const doLogout = useLogout();

  useEffect(() => {
    if (!ready) return;               // wait for auth bootstrap
    if (!token) { router.replace("/login"); return; }
    (async () => {
      try {
        const res = await listMyWorkspaces();
        // tolerate various shapes: {workspaces:[{id,name}]} or [{_id,name}]
        const arr: WS[] = (res as any)?.workspaces ?? (Array.isArray(res) ? res : []);
        setWorkspaces(arr);
      } catch (e:any) {
        setErr(e?.message || "Failed to load workspaces");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, ready, router]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await createWorkspace({ name: newName.trim() });
    // safest path: refetch (backend may return different shape)
    try {
      const fresh = await listMyWorkspaces();
      const arr: WS[] = (fresh as any)?.workspaces ?? (Array.isArray(fresh) ? fresh : []);
      setWorkspaces(arr);
    } catch {}
    setNewName("");
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
        <button className="btn btn-ghost" onClick={doLogout}>Logout</button>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({length: 6}).map((_,i)=>(
            <div key={i} className="card h-28 animate-pulse" />
          ))
        ) : err ? (
          <p className="text-red-400">{err}</p>
        ) : (
          <>
            {workspaces.map(ws => {
              const id = (ws as any).id ?? (ws as any)._id;
              return (
                <button
                  key={id ?? Math.random()}
                  className="card p-5 text-left hover:scale-[1.01] transition-transform"
                  onClick={()=> id && router.push(`/app/w/${id}`)}
                  disabled={!id}
                  title={!id ? "Invalid workspace id" : ""}
                >
                  <div className="text-lg font-medium">{ws.name}</div>
                  <div className="text-xs text-zinc-400 mt-1">{id ? "Open workspace" : "Invalid ID"}</div>
                </button>
              );
            })}
            <div className="card p-5">
              <form onSubmit={onCreate} className="space-y-3">
                <div className="text-lg font-medium">Create workspace</div>
                <input className="input" placeholder="My Team"
                  value={newName} onChange={e=>setNewName(e.target.value)} />
                <button className="btn btn-primary w-full">Create</button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
