import { api } from "./client";

/* AUTH */
export function login(data: { email: string; password: string; }) {
  return api<{ accessToken: string; user: any; }>("/api/auth/login", "POST", data);
}
export function registerUser(data: { email: string; name: string; password: string; }) {
  return api<{ accessToken: string; user: any; }>("/api/auth/register", "POST", data);
}
export function logout() {
  return api<void>("/api/auth/logout", "POST");
}

/* WORKSPACES */
export function listMyWorkspaces() {
  return api<{ workspaces: Array<{ id: string; name: string; slug?: string }> }>("/api/workspaces", "GET");
}
export function createWorkspace(data: { name: string }) {
  return api<{ id: string; name: string; slug: string; }>(
    "/api/workspaces", "POST", data
  );
}

/* CHANNELS */
export function listChannels(workspaceId: string) {
  return api<{ channels: Array<{ id: string; name: string }> }>(`/api/${workspaceId}/channels`, "GET");
}
export function createChannel(workspaceId: string, name: string) {
  return api<{ id: string; name: string }>(`/api/${workspaceId}/channels`, "POST", { name });
}

/* MESSAGES */
export function listMessages(channelId: string, page = 1, limit = 30) {
  return api<{ messages: Array<any>; page: number; totalPages: number }>(
    `/api/channels/${channelId}/messages?page=${page}&limit=${limit}`, "GET"
  );
}
export function postMessage(channelId: string, body: string) {
  return api<{ id: string }>(`/api/channels/${channelId}/messages`, "POST", { body });
}

/* INVITES */
export function sendInvite(workspaceId: string, data: { email: string; role: "member"|"admin" }) {
  return api<{ invite: any }>(`/api/${workspaceId}/invites`, "POST", data);
}
export function acceptInvite(token: string) {
  return api<{ membership: any; invite: any }>(`/api/invites/accept`, "POST", { token });
}

/* MEMBERS */
export function listMembers(opts: {
  workspaceId: string; page?: number; limit?: number; search?: string; role?: string; sort?: "name"|"createdAt";
}) {
  const { workspaceId, page=1, limit=20, search="", role="", sort="name" } = opts;
  const q = new URLSearchParams({ page:String(page), limit:String(limit), search, role, sort });
  return api<{ members: any[]; page: number; totalPages: number; total: number }>(
    `/api/${workspaceId}/members?${q.toString()}`, "GET"
  );
}
export function changeRole(workspaceId: string, userId: string, role: "member"|"admin"|"owner") {
  return api<{ membership: any }>(`/api/${workspaceId}/members/${userId}`, "PATCH", { role });
}
export function removeMember(workspaceId: string, userId: string) {
  return api<void>(`/api/${workspaceId}/members/${userId}`, "DELETE");
}
