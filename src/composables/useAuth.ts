
import { computed, ref } from "vue";
import type { Admin, AuthSession } from "@/services/auth";

const SESSION_KEY = "auth-session";

function readSession(): AuthSession | null {
  try {
    const value = sessionStorage.getItem(SESSION_KEY);

    if (!value) return null;

    const session: AuthSession = JSON.parse(value);

    if (
      typeof session.accessToken === "string" &&
      session.accessToken.length > 0 &&
      typeof session.admin?.username === "string"
    ) {
      return session;
    }

  } catch {
    // Ignore invalid saved session data.
  }

  return null;
}

const session = ref<AuthSession | null>(readSession());

const currentAdmin = computed<Admin | null>(
  () => session.value?.admin ?? null,
);

const accessToken = computed(
  () => session.value?.accessToken ?? null,
);

const isLoggedIn = computed(() => session.value !== null);

export function useAuth() {
  function startSession(authSession: AuthSession) {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify(authSession),
    );

    session.value = authSession;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    session.value = null;
  }

  return {
    currentAdmin,
    accessToken,
    isLoggedIn,
    startSession,
    logout,
  };
}
