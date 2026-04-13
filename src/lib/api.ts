import { getApiBase } from "./apiBase";

function getToken(): string | null {
  return localStorage.getItem("token");
}

function getHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function api<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<{ success: boolean; data?: T; message?: string } & Partial<T> & Record<string, unknown>> {
  const { skipAuth, ...fetchOptions } = options;
  const res = await fetch(`${getApiBase()}${path}`, {
    ...fetchOptions,
    credentials: "include",
    headers: {
      ...getHeaders(!skipAuth),
      ...(fetchOptions.headers as Record<string, string>),
    },
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return {
      success: false,
      message: typeof json.message === "string" ? json.message : "Request failed",
      ...json,
    } as { success: boolean; data?: T; message?: string } & Partial<T> & Record<string, unknown>;
  }
  return { success: true, ...json } as { success: boolean; data?: T; message?: string } & Partial<T> & Record<string, unknown>;
}

export const auth = {
  login: (email: string, password: string) =>
    api<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    }),
};

export const userApi = {
  me: () => api<{ user: User }>("/user/me"),
};

export const adminApi = {
  stats: () =>
    api<{
      stats: {
        pending_deposits: number;
        pending_withdrawals: number;
        pending_kyc: number;
        total_users: number;
      };
    }>("/admin/stats"),
  depositsPending: () => api<{ deposits: AdminDeposit[] }>("/admin/deposits/pending"),
  depositVerify: (id: string, admin_notes?: string) =>
    api(`/admin/deposits/${id}/verify`, { method: "PATCH", body: JSON.stringify({ admin_notes }) }),
  depositApprove: (id: string, amount_approved: number) =>
    api(`/admin/deposits/${id}/approve`, { method: "PATCH", body: JSON.stringify({ amount_approved }) }),
  depositReject: (id: string, admin_notes?: string) =>
    api(`/admin/deposits/${id}/reject`, { method: "PATCH", body: JSON.stringify({ admin_notes }) }),
  withdrawalsPending: () => api<{ withdrawals: AdminWithdrawal[] }>("/admin/withdrawals/pending"),
  withdrawalApprove: (id: string, admin_notes?: string) =>
    api(`/admin/withdrawals/${id}/approve`, { method: "PATCH", body: JSON.stringify({ admin_notes }) }),
  withdrawalReject: (id: string, admin_notes?: string) =>
    api(`/admin/withdrawals/${id}/reject`, { method: "PATCH", body: JSON.stringify({ admin_notes }) }),
  kycPending: () => api<{ submissions: AdminKyc[] }>("/admin/kyc/pending"),
  kycApprove: (id: string) => api(`/admin/kyc/${id}/approve`, { method: "PATCH" }),
  kycReject: (id: string, admin_notes?: string) =>
    api(`/admin/kyc/${id}/reject`, { method: "PATCH", body: JSON.stringify({ admin_notes }) }),
  users: () => api<{ users: User[] }>("/admin/users"),
};

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  balance?: number;
  kyc_status?: string;
}

export interface AdminWithdrawal {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  amount: number;
  currency: string;
  address?: string | null;
  status: string;
  user_balance?: number;
  created_at: string;
}

export interface AdminDeposit {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  amount_requested: number;
  amount_approved?: number;
  currency: string;
  payment_method: string;
  screenshot_path?: string;
  screenshot_url?: string;
  status: string;
  created_at: string;
}

export interface AdminKyc {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  document_type: string;
  id_front_path?: string;
  id_back_path?: string;
  selfie_path?: string;
  id_front_url?: string;
  id_back_url?: string;
  selfie_url?: string;
  status: string;
  created_at: string;
}
