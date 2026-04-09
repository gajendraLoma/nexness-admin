/** User (main) app URL for links from admin. Override with VITE_USER_APP_URL on Railway. */
export function getUserAppUrl(): string {
  const fromEnv = import.meta.env.VITE_USER_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location.hostname.includes("up.railway.app")) {
    return "https://nexness-fe-production.up.railway.app";
  }
  return "http://localhost:8080";
}
