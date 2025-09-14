// lib/apiBase.ts
export function getApiBase(): string {
  if (typeof window !== "undefined") {
    return (window as any).__API_BASE__ || "";
  }
  return ""; // fallback for SSR (not used for your API calls)
}