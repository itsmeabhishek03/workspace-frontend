import { ReactNode, useEffect } from "react";
import { create } from "zustand";
import { getAccessToken, setAccessToken } from "@/lib/api/client";
import { logout as apiLogout, acceptInvite } from "@/lib/api/endpoints";
import { useRouter } from "next/navigation";

type User = { id: string; email: string; name: string } | null;

type AuthState = {
  user: User;
  token: string | null;
  ready: boolean;                 // <-- NEW
  setUser: (u: User) => void;
  setToken: (t: string | null) => void;
  setReady: (r: boolean) => void; // <-- NEW
  clear: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  ready: false,
  setUser: (user) => set({ user }),
  setToken: (token) => { setAccessToken(token); set({ token }); },
  setReady: (ready) => set({ ready }),
  clear: () => { setAccessToken(null); set({ user: null, token: null }); }
}));

async function acceptPendingInviteIfAny() {
  const pending = localStorage.getItem("pendingInviteToken");
  if (!pending) return;
  try { await acceptInvite(pending); } catch {}
  localStorage.removeItem("pendingInviteToken");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const setToken = useAuth(s => s.setToken);
  const setReady = useAuth(s => s.setReady);
  const token    = useAuth(s => s.token);

  // bootstrap from localStorage
  useEffect(() => {
    const existing = getAccessToken();
    if (existing) setToken(existing);
    setReady(true);
  }, [setToken, setReady]);

  // if we have a token (login/register), auto-accept pending invite
  useEffect(() => {
    if (token) void acceptPendingInviteIfAny();
  }, [token]);

  return <>{children}</>;
}

export function useLogout() {
  const clear = useAuth(s => s.clear);
  const router = useRouter();

  return async () => {
    try { await apiLogout(); } catch {}
    clear();
    // schedule navigation safely after current render cycle
    setTimeout(() => router.replace("/login"), 0);
  };
}

