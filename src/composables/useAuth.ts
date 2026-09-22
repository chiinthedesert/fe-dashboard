import { computed, ref } from "vue";
import type { Admin, AuthSession } from "@/types/auth";

const SESSION_KEY = "auth-session";

function readSession(): AuthSession | null {
  try {
    const value = sessionStorage.getItem(SESSION_KEY);

    if (!value) return null;

    const savedSession: AuthSession = JSON.parse(value);

    if (
      typeof savedSession.accessToken === "string" &&
      savedSession.accessToken.length > 0 &&
      typeof savedSession.admin?.username === "string" &&
      typeof savedSession.expiresAt === "number" &&
      Number.isFinite(savedSession.expiresAt) &&
      Date.now() < savedSession.expiresAt
    ) {
      return savedSession;
    }
  } catch {
    // Ignore invalid session data.
  }

  sessionStorage.removeItem(SESSION_KEY);
  return null;
}

const session = ref<AuthSession | null>(readSession());

const currentAdmin = computed<Admin | null>(
  () => session.value?.admin ?? null,
);

const accessToken = computed(
  () => session.value?.accessToken ?? null,
);

const isLoggedIn = computed(
  () => session.value !== null,
);

let expirationTimer: ReturnType<typeof setTimeout> | undefined;

function clearSession() {
  if (expirationTimer !== undefined) {
    clearTimeout(expirationTimer);
    expirationTimer = undefined;
  }

  sessionStorage.removeItem(SESSION_KEY);
  session.value = null;
}

function scheduleExpiration() {
  if (expirationTimer !== undefined) {
    clearTimeout(expirationTimer);
    expirationTimer = undefined;
  }

  if (!session.value) return;

  const remainingTime =
    session.value.expiresAt - Date.now();

  if (remainingTime <= 0) {
    clearSession();
    return;
  }

  expirationTimer = setTimeout(
    () => {
      if (!session.value) return;

      if (Date.now() >= session.value.expiresAt) {
        clearSession();
      } else {
        scheduleExpiration();
      }
    },
    Math.min(remainingTime, 2_147_483_647),
  );
}

// Restore the expiration timer after a page refresh.
scheduleExpiration();

export function useAuth() {
  function startSession(authSession: AuthSession) {
    clearSession();

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify(authSession),
    );

    session.value = authSession;

    scheduleExpiration();
  }

  function ensureSession(): boolean {
    if (!session.value) return false;

    if (Date.now() >= session.value.expiresAt) {
      clearSession();
      return false;
    }

    return true;
  }

  return {
    currentAdmin,
    accessToken,
    isLoggedIn,
    startSession,
    clearSession,
    ensureSession,
  };
}
