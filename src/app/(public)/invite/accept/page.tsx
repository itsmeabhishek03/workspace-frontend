"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { acceptInvite } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/store";

export default function AcceptInvitePage() {
  const sp = useSearchParams();
  const token = sp.get("token") || "";
  const router = useRouter();
  const authToken = useAuth(s => s.token);
  const [msg, setMsg] = useState("Accepting invite...");

  useEffect(() => {
    if (!token) { setMsg("Missing token"); return; }

    // if not authenticated yet, stash token and go to login
    if (!authToken) {
      localStorage.setItem("pendingInviteToken", token);
      setMsg("You need to sign in to accept. Redirecting to login…");
      setTimeout(()=>router.replace("/login"), 500);
      return;
    }

    // already authenticated → accept now
    (async () => {
      try {
        await acceptInvite(token);
        setMsg("Invite accepted! Redirecting…");
        setTimeout(()=>router.replace("/app"), 800);
      } catch (e:any) {
        setMsg(e?.message || "Failed to accept invite");
      }
    })();
  }, [token, authToken, router]);

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="card w-full max-w-md p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Invitation</h1>
        <p className="text-zinc-300">{msg}</p>
      </div>
    </main>
  );
}
