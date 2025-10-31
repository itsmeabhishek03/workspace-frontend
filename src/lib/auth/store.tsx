"use client";

import { ReactNode, useEffect } from "react";
import { create } from "zustand";
import { getAccessToken, setAccessToken } from "@/lib/api/client";
import { logout as apiLogout, acceptInvite } from "@/lib/api/endpoints";
import { useRouter } from "next/navigation";

type User = { id: string; email: string; name: string } | null;

type AuthState = {
  user: User;
  token: string | null;
  ready: boolean;
  setUser: (u: User) => void;
  setToken: (t: string | null) => void;
  setReady: (r: boolean) => void;
  clear: () => void;
};

// --- Zustand Store ---
export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  ready: false,

  setUser: (user) => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
    set({ user });
  },

  setToken: (token) => {
    setAccessToken(token);
    set({ token });
  },

  setReady: (ready) => set({ ready }),

  clear: () => {
    setAccessToken(null);
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },
}));

// --- Auto-accept invite (no changes) ---
async function acceptPendingInviteIfAny() {
  const pending = localStorage.getItem("pendingInviteToken");
  if (!pending) return;
  try {
    await acceptInvite(pending);
  } catch {}
  localStorage.removeItem("pendingInviteToken");
}

// --- Auth Provider ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuth((s) => s.setUser);
  const setToken = useAuth((s) => s.setToken);
  const setReady = useAuth((s) => s.setReady);
  const token = useAuth((s) => s.token);

  useEffect(() => {
    const existingToken = getAccessToken();
    const savedUser = localStorage.getItem("user");

    if (existingToken) setToken(existingToken);
    if (savedUser) setUser(JSON.parse(savedUser));

    setReady(true);
  }, [setToken, setUser, setReady]);

  useEffect(() => {
    if (token) void acceptPendingInviteIfAny();
  }, [token]);

  return <>{children}</>;
}

// --- Logout hook ---
export function useLogout() {
  const clear = useAuth((s) => s.clear);
  const router = useRouter();

  return async () => {
    try {
      await apiLogout();
    } catch {}
    clear();
    setTimeout(() => router.replace("/login"), 0);
  };
}
