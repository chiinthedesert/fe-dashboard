import { onMounted, onUnmounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import { logoutCurrentSession } from "@/composables/useLogout";

export const IDLE_MINUTES_KEY = "pythonmaster-idle-logout-minutes";
export const IDLE_PREFERENCE_EVENT = "pythonmaster-idle-preference-changed";

export function readIdleMinutes(): number {
  try {
    const value = Number(localStorage.getItem(IDLE_MINUTES_KEY) ?? "0");
    return [0, 15, 30, 60].includes(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function writeIdleMinutes(minutes: number): void {
  if (![0, 15, 30, 60].includes(minutes)) return;
  localStorage.setItem(IDLE_MINUTES_KEY, String(minutes));
  window.dispatchEvent(new Event(IDLE_PREFERENCE_EVENT));
}

export function useIdleLogout(): void {
  const { isLoggedIn } = useAuth();
  let lastActivity = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastRecorded = 0;

  function clearTimer() {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  }

  function checkInactivity() {
    clearTimer();
    const minutes = readIdleMinutes();
    if (!isLoggedIn.value || minutes === 0) return;

    const remaining = minutes * 60_000 - (Date.now() - lastActivity);
    if (remaining <= 0) {
      void logoutCurrentSession();
      return;
    }
    timer = setTimeout(checkInactivity, remaining);
  }

  function activity() {
    if (document.visibilityState === "hidden") return;
    const now = Date.now();
    if (now - lastRecorded < 1000) return;
    lastRecorded = now;
    lastActivity = now;
    checkInactivity();
  }

  function visibilityChanged() {
    // Check the previous inactivity interval BEFORE recording fresh activity.
    checkInactivity();
    if (isLoggedIn.value && document.visibilityState === "visible") activity();
  }

  function preferenceChanged() {
    lastActivity = Date.now();
    checkInactivity();
  }

  onMounted(() => {
    lastActivity = Date.now();
    for (const event of ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"] as const) {
      window.addEventListener(event, activity, { passive: true });
    }
    document.addEventListener("visibilitychange", visibilityChanged);
    window.addEventListener(IDLE_PREFERENCE_EVENT, preferenceChanged);
    window.addEventListener("storage", preferenceChanged);
    checkInactivity();
  });

  onUnmounted(() => {
    clearTimer();
    for (const event of ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"] as const) {
      window.removeEventListener(event, activity);
    }
    document.removeEventListener("visibilitychange", visibilityChanged);
    window.removeEventListener(IDLE_PREFERENCE_EVENT, preferenceChanged);
    window.removeEventListener("storage", preferenceChanged);
  });
}
