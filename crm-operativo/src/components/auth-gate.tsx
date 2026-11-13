"use client";

import { useEffect, useState } from "react";
import { type AppRole } from "@/lib/auth";
import { clearExpiredSession, getSessionFromStorage, getRoutePermissionsForRole } from "@/lib/permissions";
import { isPagesDemo } from "@/lib/pages-demo";

export function AuthGate({
  route,
  children,
  fallback,
}: {
  route: "dashboard" | "kpi" | "inbox" | "tickets" | "integrations" | "manageIntegrations";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState<boolean | null>(isPagesDemo ? true : null);

  useEffect(() => {
    if (isPagesDemo) {
      setAuthorized(true);
      return;
    }
    const session = getSessionFromStorage();

    if (!session) {
      clearExpiredSession();
      setAuthorized(false);
      return;
    }

    const permissions = getRoutePermissionsForRole(session.role as AppRole);
    const hasAccess = permissions[route] ?? false;
    setAuthorized(hasAccess);
  }, [route]);

  if (authorized === null) {
    return <div className="p-6 text-sm text-slate-500">Comprobando permisos...</div>;
  }

  if (!authorized) {
    return (
      fallback ?? (
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            No tienes permisos para acceder a esta sección del CRM.
          </div>
        </main>
      )
    );
  }

  return <>{children}</>;
}
