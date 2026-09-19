import { computed, ref } from "vue";
import type { Admin } from "@/services/auth";

const SESSION_KEY = "mock-admin";

function readSession(): Admin | null {
  try {
    const value = sessionStorage.getItem(SESSION_KEY);

    if (!value) return null;

    const admin = JSON.parse(value);

    if (
      typeof admin?.id === "string" &&
      typeof admin?.name === "string" &&
      typeof admin?.department === "string"
    ) {
      return {
        id: admin.id,
        name: admin.name,
        department: admin.department,
      };
    }
  } catch {
    // Ignore invalid saved mock data.
  }

  return null;
}

const currentAdmin = ref<Admin | null>(readSession());
const isLoggedIn = computed(() => currentAdmin.value !== null);

export function useAuth() {
  function startSession(admin: Admin) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(admin));
    currentAdmin.value = admin;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    currentAdmin.value = null;
  }

  return {
    currentAdmin,
    isLoggedIn,
    startSession,
    logout,
  };
}
