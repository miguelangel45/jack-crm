"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { roleLabels, type AppRole } from "@/lib/auth";
import { clearExpiredSession, getRoutePermissionsForRole, INACTIVITY_TIMEOUT_MS, triggerSessionActivity } from "@/lib/permissions";
import { ThemeToggle } from "@/components/theme-toggle";
import { isPagesDemo } from "@/lib/pages-demo";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inbox", label: "Inbox" },
  { href: "/tickets", label: "Tickets" },
  { href: "/integrations", label: "Integraciones" },
];

export function SiteNav() {
  const [session, setSession] = useState<{ email: string; role: AppRole; name: string } | null>(null);

  useEffect(() => {
    if (isPagesDemo) {
      setSession({ email: "demo@crm.local", role: "admin", name: "Vista demo" });
      return;
    }

    let lastServerRefreshAt = 0;

    const syncSession = () => {
      const rawSession = localStorage.getItem("crm-session");

      if (!rawSession) {
        clearExpiredSession();
        window.location.href = "/login";
        return;
      }

      try {
        const parsed = JSON.parse(rawSession) as { email: string; role: AppRole; name: string; lastActivity?: number; expiresAt?: number };
        const now = Date.now();
        const lastActivity = parsed.lastActivity ?? now;

        if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
          clearExpiredSession();
          window.location.href = "/login";
          return;
        }

        const refreshedSession = { ...parsed, lastActivity: now, expiresAt: now + INACTIVITY_TIMEOUT_MS };
        localStorage.setItem("crm-session", JSON.stringify(refreshedSession));
        setSession({ email: refreshedSession.email, role: refreshedSession.role, name: refreshedSession.name });
      } catch {
        clearExpiredSession();
        window.location.href = "/login";
      }
    };

    syncSession();

    const activityEvents = ["click", "keydown", "mousemove", "touchstart", "scroll"] as const;
    const handleActivity = () => {
      const currentSession = triggerSessionActivity();
      if (currentSession) {
        setSession({ email: currentSession.email, role: currentSession.role, name: currentSession.name });

        const now = Date.now();
        if (now - lastServerRefreshAt >= 60000) {
          lastServerRefreshAt = now;
          void fetch("/api/auth/session", { cache: "no-store" }).catch(() => undefined);
        }
      }
    };

    const inactivityTimer = window.setInterval(() => {
      const currentSession = localStorage.getItem("crm-session");
      if (!currentSession) {
        window.location.href = "/login";
        return;
      }

      const parsed = JSON.parse(currentSession) as { lastActivity?: number; expiresAt?: number };
      if (Date.now() > (parsed.expiresAt ?? Number.MAX_SAFE_INTEGER)) {
        clearExpiredSession();
        window.location.href = "/login";
      }
    }, 30000);

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    return () => {
      window.clearInterval(inactivityTimer);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
  }, []);

  return (
    <nav className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-soft md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {navItems.map((item) => {
          const permissions = session ? getRoutePermissionsForRole(session.role) : null;
          const isVisible =
            (item.href === "/dashboard" && !!session) ||
            (item.href === "/inbox" && !!permissions?.inbox) ||
            (item.href === "/tickets" && !!permissions?.tickets) ||
            (item.href === "/integrations" && !!permissions?.integrations);

          if (!isVisible) {
            return null;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 px-2 py-1">
        <ThemeToggle />
        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{isPagesDemo ? "Demo" : session ? roleLabels[session.role] : "Sesión"}</span>
        {isPagesDemo ? (
          <Link href="/" className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700">
            Volver al inicio
          </Link>
        ) : (
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
              localStorage.removeItem("crm-session");
              window.location.href = "/login";
            }}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
}
