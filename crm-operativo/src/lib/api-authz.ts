import "server-only";
import { getSessionFromServerRequest } from "@/lib/auth-session";
import { getRoutePermissionsForRole, type RoutePermission } from "@/lib/permissions";

type ProtectedRoute = keyof Pick<RoutePermission, "dashboard" | "inbox" | "tickets" | "integrations" | "manageIntegrations">;

export async function requireRouteAccess(request: Request, route: ProtectedRoute) {
  const session = await getSessionFromServerRequest(request);

  if (!session) {
    return {
      session: null,
      response: Response.json({ ok: false, error: "Sesión no válida o expirada." }, { status: 401 }),
    };
  }

  const permissions = getRoutePermissionsForRole(session.role);
  if (!permissions[route]) {
    return {
      session,
      response: Response.json({ ok: false, error: "No tienes permisos para acceder a este recurso." }, { status: 403 }),
    };
  }

  return { session, response: null };
}