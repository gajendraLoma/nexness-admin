/**
 * API base URL for fetch calls. Priority:
 * 1) VITE_API_URL (set in Railway — must end with /api)
 * 2) Railway host (*.up.railway.app) → production backend
 * 3) Local dev
 */
export function getApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") {
      return "http://localhost:4000/api";
    }
    if (h.includes("up.railway.app")) {
      return "https://nexness-be-production.up.railway.app/api";
    }
  
  }

  return "http://localhost:4000/api";
}
