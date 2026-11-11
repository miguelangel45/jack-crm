export type AppRole = "admin" | "agent" | "supervisor" | "viewer";

export type AppSession = {
  id: string;
  username: string;
  email: string;
  role: AppRole;
  name: string;
  lastActivity?: number;
  expiresAt?: number;
};

export type DownloadScope = "none" | "personal" | "team" | "all";

export type AccessPolicy = {
  canReadDashboard: boolean;
  canReadInbox: boolean;
  canReadTickets: boolean;
  canReadIntegrations: boolean;
  canManageIntegrations: boolean;
  canDownloadFiles: boolean;
  downloadScope: DownloadScope;
};

export const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  agent: "Agente",
  viewer: "Visualizador",
};

export const roleAccess: Record<AppRole, AccessPolicy> = {
  admin: {
    canReadDashboard: true,
    canReadInbox: true,
    canReadTickets: true,
    canReadIntegrations: true,
    canManageIntegrations: true,
    canDownloadFiles: true,
    downloadScope: "all",
  },
  supervisor: {
    canReadDashboard: true,
    canReadInbox: true,
    canReadTickets: true,
    canReadIntegrations: true,
    canManageIntegrations: false,
    canDownloadFiles: true,
    downloadScope: "team",
  },
  agent: {
    canReadDashboard: true,
    canReadInbox: true,
    canReadTickets: true,
    canReadIntegrations: false,
    canManageIntegrations: false,
    canDownloadFiles: true,
    downloadScope: "personal",
  },
  viewer: {
    canReadDashboard: true,
    canReadInbox: true,
    canReadTickets: true,
    canReadIntegrations: true,
    canManageIntegrations: false,
    canDownloadFiles: false,
    downloadScope: "none",
  },
};

export const demoUsers = [
  {
    id: "admin-demo",
    username: "adminCRM01",
    email: "admin@crm.local",
    password: "AdminCRM01",
    role: "admin" as const,
    name: "Administrador del sistema",
  },
  {
    id: "supervisor-demo",
    username: "supervisorCRM1",
    email: "supervisor@crm.local",
    password: "Supervisor1",
    role: "supervisor" as const,
    name: "Supervisor de servicio",
  },
  {
    id: "agent-demo",
    username: "agentCRM01",
    email: "agent@crm.local",
    password: "AgentCRM01",
    role: "agent" as const,
    name: "Agente de atención",
  },
  {
    id: "viewer-demo",
    username: "viewerCRM01",
    email: "viewer@crm.local",
    password: "ViewerCRM01",
    role: "viewer" as const,
    name: "Visualizador de datos",
  },
];

export function getRoleAccessFor(role: AppRole): AccessPolicy {
  return roleAccess[role];
}

export function isSessionExpired(session: Partial<AppSession> | null | undefined) {
  if (!session) {
    return true;
  }

  const expiresAt = session.expiresAt ?? (session.lastActivity ? session.lastActivity + 5 * 60 * 1000 : 0);
  return Date.now() > expiresAt;
}

export async function signInWithEmail(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const demoAuthEnabled = process.env.NODE_ENV !== "production" && process.env.CRM_DEMO_MODE !== "false";
  const matchingUser = demoUsers.find(
    (user) => user.username.toLowerCase() === normalizedUsername && user.password === password,
  );

  if (demoAuthEnabled && matchingUser) {
    return {
      data: {
        user: {
          id: matchingUser.id,
          username: matchingUser.username,
          email: matchingUser.email,
          user_metadata: { name: matchingUser.name, role: matchingUser.role, username: matchingUser.username },
          role: matchingUser.role,
        },
      },
      error: null,
    };
  }

  return {
    data: null,
    error: { message: "Autenticación no disponible. El acceso demo solo funciona en desarrollo; configura un proveedor de identidad para producción." },
  };
}
