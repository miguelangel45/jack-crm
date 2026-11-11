import { getRoleAccessFor, type AppRole, type AppSession } from "@/lib/auth";

export const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

export type RoutePermission = {
  dashboard: boolean;
  inbox: boolean;
  tickets: boolean;
  integrations: boolean;
  manageIntegrations: boolean;
};

export function getRoutePermissionsForRole(role: AppRole): RoutePermission {
  const access = getRoleAccessFor(role);

  return {
    dashboard: access.canReadDashboard,
    inbox: access.canReadInbox,
    tickets: access.canReadTickets,
    integrations: access.canReadIntegrations,
    manageIntegrations: access.canManageIntegrations,
  };
}

export function markSessionActive(session?: Partial<AppSession>): AppSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const existing = session ?? getSessionFromStorage();
  if (!existing || !existing.email || !existing.role || !existing.name) {
    return null;
  }

  const now = Date.now();
  const refreshedSession: AppSession = {
    id: existing.id ?? "demo-user",
    username: existing.username ?? existing.email ?? "adminCRM01",
    email: existing.email,
    role: existing.role,
    name: existing.name,
    lastActivity: now,
    expiresAt: now + INACTIVITY_TIMEOUT_MS,
  };

  localStorage.setItem("crm-session", JSON.stringify(refreshedSession));
  return refreshedSession;
}

export function clearExpiredSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("crm-session");
}

export function getSessionFromStorage(): AppSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem("crm-session");
    if (!raw) {
      return null;
    }

    const session = JSON.parse(raw) as AppSession;
    const now = Date.now();
    const lastActivity = session.lastActivity ?? now;
    const expiresAt = session.expiresAt ?? lastActivity + INACTIVITY_TIMEOUT_MS;

    if (now > expiresAt) {
      clearExpiredSession();
      return null;
    }

    return {
      ...session,
      lastActivity,
      expiresAt,
    };
  } catch {
    return null;
  }
}

export function triggerSessionActivity() {
  return markSessionActive();
}

export function canAccessRoute(route: keyof Pick<RoutePermission, "dashboard" | "inbox" | "tickets" | "integrations" | "manageIntegrations">, role: AppRole) {
  const permissions = getRoutePermissionsForRole(role);
  return permissions[route] ?? false;
}
