"use client";

const API = process.env.NEXT_PUBLIC_API_BASE_URL!;
type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
}
export function getAccessToken(): string | null {
  return accessToken ?? (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);
}

async function rawFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (getAccessToken()) headers.set("Authorization", `Bearer ${getAccessToken()}`);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  const res = await fetch(`${API}${input}`, {
    ...init,
    headers,
    credentials: "include" // send refresh cookie
  });
  return res;
}

async function refreshToken() {
  try {
    const res = await rawFetch(`/api/auth/refresh`, { method: "POST" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.accessToken) setAccessToken(data.accessToken);
    return data?.accessToken ?? null;
  } catch {
    return null;
  }
}

export async function api<T>(path: string, method: HttpMethod = "GET", body?: any): Promise<T> {
  const res = await rawFetch(path, { method, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 401) {
    const newToken = await refreshToken();
    if (newToken) {
      const retry = await rawFetch(path, { method, body: body ? JSON.stringify(body) : undefined });
      if (retry.ok) return retry.json();
      throw await toError(retry);
    }
    throw await toError(res);
  }
  if (!res.ok) throw await toError(res);
  return res.json() as Promise<T>;
}

async function toError(res: Response) {
  let detail: any = null;
  try { detail = await res.json(); } catch {}
  const msg = detail?.error?.message || res.statusText || "Request failed";
  const err = new Error(msg) as any;
  err.status = res.status;
  err.details = detail?.error?.details;
  return err;
}
