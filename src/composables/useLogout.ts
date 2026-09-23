import { useAuth } from "@/composables/useAuth";
import { logout } from "@/services/auth";

export async function logoutCurrentSession(): Promise<void> {
  const { accessToken, clearSession } = useAuth();
  const token = accessToken.value;

  // End the browser session immediately even if the network is unavailable.
  clearSession();

  if (token) {
    try {
      await logout(token);
    } catch {
      // Local logout still succeeds; server revocation may be unavailable.
    }
  }
}
