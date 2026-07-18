const networkApiUrl = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.hostname}:3000`
  : "http://localhost:3000";

export const API_URL = import.meta.env.VITE_API_URL || networkApiUrl;
