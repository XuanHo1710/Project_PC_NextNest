// Lightweight marker (non-httpOnly) telling the app this browser has
// logged in before. httpOnly auth cookies cannot be read from JS,
// so this flag lets us skip auth bootstrap for fresh guests and
// avoid false "session expired" toasts.
const SESSION_KEY = "pc_has_session";

export function markSession() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, "1");
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

export function hasSessionHint(): boolean {
  return (
    typeof window !== "undefined" &&
    window.localStorage.getItem(SESSION_KEY) === "1"
  );
}
