/** Persist which contract order IDs the admin has already been notified about (session). */
export const ADMIN_SEEN_CONTRACT_IDS_KEY = "nexness_admin_seen_contract_ids";

export const ADMIN_CONTRACT_ACTIVITY_KEY = "nexness_admin_contract_control_log";

export function clearAdminContractSeenIds() {
  try {
    sessionStorage.removeItem(ADMIN_SEEN_CONTRACT_IDS_KEY);
  } catch {
    /* ignore */
  }
}

/** Call on logout so the next admin session starts clean. */
export function clearAdminSessionCaches() {
  clearAdminContractSeenIds();
  try {
    sessionStorage.removeItem(ADMIN_CONTRACT_ACTIVITY_KEY);
  } catch {
    /* ignore */
  }
}

function loadSeen(): Set<string> {
  try {
    const raw = sessionStorage.getItem(ADMIN_SEEN_CONTRACT_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<string>) {
  try {
    sessionStorage.setItem(ADMIN_SEEN_CONTRACT_IDS_KEY, JSON.stringify([...seen]));
  } catch {
    /* ignore */
  }
}

/**
 * First time (empty seen): seed all current IDs, no callback.
 * Later: if any ID is new, merge into seen and call onNew once.
 */
export function notifyIfNewContractOrders(orderIds: string[], onNew: () => void) {
  const seen = loadSeen();
  if (seen.size === 0) {
    orderIds.forEach((id) => seen.add(id));
    saveSeen(seen);
    return;
  }
  const hasNew = orderIds.some((id) => !seen.has(id));
  if (!hasNew) return;
  orderIds.forEach((id) => seen.add(id));
  saveSeen(seen);
  onNew();
}
