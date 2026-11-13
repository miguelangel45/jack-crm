"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { roleLabels, type AppRole } from "@/lib/auth";
import { clearExpiredSession, getRoutePermissionsForRole, INACTIVITY_TIMEOUT_MS, triggerSessionActivity } from "@/lib/permissions";
import { ThemeToggle } from "@/components/theme-toggle";
import { isPagesDemo } from "@/lib/pages-demo";

const navItems = [
  { href: "/dashboard", label: "Panel general", group: "Operación", icon: "dashboard" },
  { href: "/kpi", label: "KPI", group: "Operación", icon: "kpi" },
  { href: "/inbox", label: "Conversaciones", group: "Operación", icon: "inbox" },
  { href: "/tickets", label: "Reclamaciones", group: "Operación", icon: "tickets" },
  { href: "/integrations", label: "Integraciones", group: "Administración", icon: "integrations" },
] as const;

function NavigationIcon({ name }: { name: "dashboard" | "kpi" | "inbox" | "tickets" | "integrations" | "collapse" | "expand" | "menu" | "close" | "logout" }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
    kpi: <><path d="M4 19V5M4 19h16" /><path d="m7 15 4-4 3 2 5-6" /><path d="M16 7h3v3" /></>,
    inbox: <><path d="M4 5h16v14H4z" /><path d="M4 13h4l2 3h4l2-3h4" /><path d="M8 9h8" /></>,
    tickets: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    integrations: <><path d="M9 15 7 17a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0" transform="translate(2 0)" /><path d="m15 9 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(-2 0)" /><path d="m9 15 6-6" /></>,
    collapse: <><path d="m14 7-5 5 5 5" /><path d="M4 4v16" /></>,
    expand: <><path d="m10 7 5 5-5 5" /><path d="M20 4v16" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const [session, setSession] = useState<{ email: string; role: AppRole; name: string } | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const savedPreference = localStorage.getItem("crm-sidebar-collapsed");
      setIsCollapsed(savedPreference === "true");
    } catch {
      setIsCollapsed(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--crm-sidebar-width", isCollapsed ? "76px" : "264px");
  }, [isCollapsed]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeMobileMenuOnDesktop = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", closeMobileMenuOnDesktop);
    return () => window.removeEventListener("resize", closeMobileMenuOnDesktop);
  }, []);

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

  const permissions = session ? getRoutePermissionsForRole(session.role) : null;
  const visibleItems = navItems.filter((item) => {
    if (item.href === "/dashboard") return !!session;
    if (item.href === "/kpi") return !!permissions?.kpi;
    if (item.href === "/inbox") return !!permissions?.inbox;
    if (item.href === "/tickets") return !!permissions?.tickets;
    return !!permissions?.integrations;
  });

  function toggleCollapsed() {
    setIsCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem("crm-sidebar-collapsed", String(next));
      } catch {
        // El menú sigue funcionando durante esta sesión aunque el almacenamiento esté deshabilitado.
      }
      return next;
    });
  }

  return (
    <>
      <button
        type="button"
        className="crm-mobile-trigger"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Abrir menú de navegación"
        aria-expanded={isMobileOpen}
      >
        <NavigationIcon name="menu" />
      </button>
      {isMobileOpen && <button type="button" className="crm-sidebar-backdrop" onClick={() => setIsMobileOpen(false)} aria-label="Cerrar menú" />}
      <aside className={`crm-sidebar${isCollapsed ? " is-collapsed" : ""}${isMobileOpen ? " is-mobile-open" : ""}`} aria-label="Navegación principal">
        <div className="crm-sidebar-brand">
          <Link href="/dashboard" className="crm-brand-mark" aria-label="CRM, ir al panel general">C</Link>
          {!isCollapsed && (
            <div className="crm-brand-copy">
              <span className="crm-brand-title">CRM Operativo</span>
              <span className="crm-brand-subtitle">Portal de procesos</span>
            </div>
          )}
          <button
            type="button"
            className="crm-sidebar-toggle"
            onClick={() => (isMobileOpen ? setIsMobileOpen(false) : toggleCollapsed())}
            aria-label={isMobileOpen ? "Cerrar menú" : isCollapsed ? "Expandir menú" : "Contraer menú"}
            title={isMobileOpen ? "Cerrar menú" : isCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            <span className="crm-desktop-toggle"><NavigationIcon name={isCollapsed ? "expand" : "collapse"} /></span>
            <span className="crm-mobile-close"><NavigationIcon name="close" /></span>
          </button>
        </div>

        <div className="crm-sidebar-context">
          <span className="crm-context-dot" />
          {!isCollapsed && <span>Espacio de trabajo</span>}
        </div>

        <nav className="crm-sidebar-nav">
          {(["Operación", "Administración"] as const).map((group) => {
            const groupItems = visibleItems.filter((item) => item.group === group);
            if (groupItems.length === 0) return null;

            return (
              <div className="crm-nav-group" key={group}>
                {!isCollapsed && <p className="crm-nav-heading">{group}</p>}
                {groupItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`crm-nav-link${isActive ? " is-active" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <NavigationIcon name={item.icon} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="crm-sidebar-footer">
          <div className="crm-sidebar-theme"><ThemeToggle /></div>
          {session && (
            <div className="crm-account">
              <div className="crm-account-avatar">{session.name.trim().charAt(0).toUpperCase() || "U"}</div>
              {!isCollapsed && (
                <div className="crm-account-copy">
                  <span className="crm-account-name">{session.name}</span>
                  <span className="crm-account-role">{isPagesDemo ? "Demo" : roleLabels[session.role]}</span>
                </div>
              )}
            </div>
          )}
          {isPagesDemo ? (
            <Link href="/" className="crm-logout" title={isCollapsed ? "Volver al inicio" : undefined}>
              <NavigationIcon name="logout" />
              {!isCollapsed && <span>Volver al inicio</span>}
            </Link>
          ) : (
            <button
              type="button"
              className="crm-logout"
              title={isCollapsed ? "Cerrar sesión" : undefined}
              onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
              localStorage.removeItem("crm-session");
              window.location.href = "/login";
              }}
            >
              <NavigationIcon name="logout" />
              {!isCollapsed && <span>Cerrar sesión</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
