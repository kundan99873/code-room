import { apiFetch } from "./apiClient";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "user" | "admin";
  provider?: "local" | "google";
  avatar?: {
    publicId: string;
    url: string;
  };
}

export const fetchCurrentUser = async (): Promise<User> => {
  const res = await apiFetch("/api/auth/me");
  if (!res.ok) {
    throw new Error("Not authenticated");
  }
  const result = await res.json();
  const data = result.data;
  if (data && data._id) {
    data.id = data._id;
  }
  return data;
};

export const loginRequest = async (credentials: any) => {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to login");
  }
  return result;
};

export const registerRequest = async (userData: any) => {
  const res = await apiFetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to register");
  }
  return result;
};

export const logoutRequest = async () => {
  const res = await apiFetch("/api/auth/logout", {
    method: "POST",
  });
  if (!res.ok) {
    const result = await res.json();
    throw new Error(result.message || "Failed to logout");
  }
};

export const forgotPasswordRequest = async (email: string) => {
  const res = await apiFetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to send reset link");
  }
  return result;
};

export const resetPasswordRequest = async (token: string, password: string) => {
  const res = await apiFetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to reset password");
  }
  return result;
};

export const changePasswordRequest = async (credentials: any) => {
  const res = await apiFetch("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.message || "Failed to change password");
  }
  return result;
};
