// lib/apiBase.ts
declare global {
  interface Window {
    __API_BASE__?: string;
  }
}

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    return window.__API_BASE__ || "";
  }
  return ""; // fallback for SSR
}