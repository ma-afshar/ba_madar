const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const TOKEN_KEY = "madar_auth_token";

async function authRequest<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}/auth${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "REQUEST_FAILED");
  return data;
}

export function requestOtp(phone: string) {
  return authRequest<{ phone: string; expiresIn: number; debugCode?: string }>("/request-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export function verifyOtp(phone: string, code: string) {
  return authRequest<{ token: string; user: { id: number; phone: string } }>("/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
}

export function saveAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export async function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const result = await authRequest<{ user: { id: number; phone: string } }>("/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return result.user;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export async function logout() {
  const token = getAuthToken();
  if (token) await authRequest("/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  localStorage.removeItem(TOKEN_KEY);
}
