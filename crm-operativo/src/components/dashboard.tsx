"use client";

import { useEffect, useState } from "react";
import { CrmIcon } from "@/components/crm-icons";
import { SiteNav } from "@/components/site-nav";
import { formatChannelLabel, type Claim } from "@/domain/crm";
import { demoSalesQuotes } from "@/domain/sales";
import { getRoleAccessFor, type AppRole } from "@/lib/auth";
import { DASHBOARD_VIEW_STORAGE_KEY, dashboardViewOptions, type DashboardView } from "@/lib/dashboard-view";
import { getSessionFromStorage } from "@/lib/permissions";
import { claims as fallbackClaims, integrations as fallbackIntegrations, metrics, serviceMetrics } from "@/lib/data";
import { isPagesDemo } from "@/lib/pages-demo";

type ApiIntegration = {
  name: string;
  provider: "facebook" | "instagram" | "mercadolibre";
  status: "online" | "syncing" | "warning" | "offline";
  messages: string;
  lastSync: string;
};

type ApiTicket = {
  id: string;
  customer: string;
  channel: "facebook" | "instagram" | "mercadolibre";
  priority: "alta" | "media" | "baja";
  status: string;
  createdAt: string;
  claimType: string;
};

function mapTicketToClaim(ticket: ApiTicket): Claim {
  return {
    id: ticket.id,
    customer: ticket.customer,
    channel: formatChannelLabel(ticket.channel),
    priority: ticket.priority,
    status: ticket.status,
    createdAt: ticket.createdAt,
  };
}

function getMetricProgress(value: string, target: string) {
  const actualValue = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(actualValue)) return 0;
  if (value.includes("%")) return Math.min(actualValue, 100);

  const targetValue = Number.parseFloat(target.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(targetValue) || targetValue <= 0) return 0;

  return Math.min((actualValue / targetValue) * 100, 100);
}

function downloadCsv(filename: string, rows: string[][]) {
  const csvContent = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function DashboardMetricCards() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article key={metric.label} className="metric-card">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{metric.label}</span>
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                metric.tone === "up"
                  ? "bg-emerald-100 text-emerald-700"
                  : metric.tone === "down"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-200 text-slate-600"
              }`}
            >
              {metric.tone === "up" ? "+" : metric.tone === "down" ? "-" : "•"}
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{metric.value}</div>
          <div className="text-sm text-slate-500">{metric.delta}</div>
        </article>
      ))}
    </section>
  );
}

function ServiceMetricsPanel() {
  return (
    <div className="panel">
      <h2 className="mb-5 text-xl font-semibold text-slate-900">Métricas de servicio</h2>
      <div className="space-y-4">
        {serviceMetrics.map((metric) => {
          const progress = getMetricProgress(metric.value, metric.target);

          return (
            <div key={metric.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">{metric.name}</span>
                <span className="font-semibold text-slate-800">{metric.value}</span>
              </div>
              <div className="metric-progress-track h-2 overflow-hidden rounded-full">
                <div className="metric-progress-fill h-full rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 text-xs text-slate-500">Objetivo: {metric.target}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClaimsSection({ claims, title }: { claims: Claim[]; title: string }) {
  return (
    <section className="mt-8 panel">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">Ver todas</button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Canal</th>
              <th className="px-4 py-3 font-medium">Prioridad</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Creada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {claims.map((claim) => (
              <tr key={claim.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{claim.id}</td>
                <td className="px-4 py-3">{claim.customer}</td>
                <td className="px-4 py-3">{claim.channel}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    claim.priority === "alta"
                      ? "bg-rose-100 text-rose-700"
                      : claim.priority === "media"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {claim.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{claim.status}</td>
                <td className="px-4 py-3 text-slate-500">{claim.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function Dashboard() {
  const [integrations, setIntegrations] = useState(fallbackIntegrations);
  const [claims, setClaims] = useState<Claim[]>(fallbackClaims);
  const [session, setSession] = useState<{ role: AppRole } | null>(isPagesDemo ? { role: "admin" } : null);
  const [viewMode, setViewMode] = useState<DashboardView>("gerente");

  useEffect(() => {
    try {
      const savedView = sessionStorage.getItem(DASHBOARD_VIEW_STORAGE_KEY);
      const selectedView = dashboardViewOptions.find((option) => option.id === savedView);
      if (selectedView) setViewMode(selectedView.id);
    } catch (error) {
      console.error("No se pudo leer el modo de vista guardado.", error);
    }
  }, []);

  useEffect(() => {
    if (isPagesDemo) return;
    const activeSession = getSessionFromStorage();
    if (activeSession) {
      setSession({ role: activeSession.role });
    }

    async function loadDashboardData() {
      try {
        const [integrationsRes, ticketsRes] = await Promise.all([
          fetch("/api/integrations"),
          fetch("/api/tickets"),
        ]);

        if (integrationsRes.ok) {
          const integrationsPayload = await integrationsRes.json();
          const integrationsData = integrationsPayload.data ?? fallbackIntegrations;
          setIntegrations(integrationsData);
        }

        if (ticketsRes.ok) {
          const ticketsPayload = await ticketsRes.json();
          const claimsData = (ticketsPayload.data ?? fallbackClaims).map((ticket: ApiTicket) => mapTicketToClaim(ticket));
          setClaims(claimsData);
        }
      } catch (error) {
        console.error("No se pudo cargar el dashboard desde la API", error);
      }
    }

    loadDashboardData();
  }, []);

  const canDownloadFiles = Boolean(session && getRoleAccessFor(session.role).canDownloadFiles);
  const openClaims = claims.filter((claim) => !/cerrad|resuelt/i.test(claim.status)).length;
  const highPriorityClaims = claims.filter((claim) => claim.priority === "alta").length;

  const handleDownloadClaims = () => {
    if (!canDownloadFiles) {
      return;
    }

    const rows = [
      ["ID", "Cliente", "Canal", "Prioridad", "Estado", "Creada"],
      ...claims.map((claim) => [claim.id, claim.customer, claim.channel, claim.priority, claim.status, claim.createdAt]),
    ];

    downloadCsv("reclamaciones-crm.csv", rows);
  };

  return (
    <main className="crm-main mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SiteNav />
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.08em] text-brand-600">CRM operativo</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            {viewMode === "gerente"
              ? "Panel de atención y servicio"
              : viewMode === "supervisor"
                ? "Supervisión de servicio"
                : "Vendedor / asesor de servicio"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            {integrations.length} integraciones activas
          </div>
          <button
            type="button"
            onClick={handleDownloadClaims}
            disabled={!canDownloadFiles}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canDownloadFiles ? "Descargar CSV" : "Sin permiso de descarga"}
          </button>
        </div>
      </header>

      {viewMode === "gerente" && (
        <>
          <DashboardMetricCards />
          <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="panel">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Integraciones</h2>
                <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white">
                  <CrmIcon name="i-ajustes" className="h-4 w-4" />
                  Configurar
                </button>
              </div>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-3 w-3 rounded-full ${
                          integration.status === "online"
                            ? "bg-emerald-500"
                            : integration.status === "syncing"
                              ? "bg-amber-500"
                              : integration.status === "warning"
                                ? "bg-orange-500"
                                : "bg-slate-300"
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-slate-800">{integration.name}</p>
                        <p className="text-sm text-slate-500">{integration.messages}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">{integration.lastSync}</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{formatChannelLabel(integration.channel)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <ServiceMetricsPanel />
          </section>
          <ClaimsSection claims={claims} title="Reclamaciones" />
        </>
      )}

      {viewMode === "supervisor" && (
        <>
          <DashboardMetricCards />
          <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
            <ServiceMetricsPanel />
            <div className="panel">
              <h2 className="mb-5 text-xl font-semibold text-slate-900">Prioridades del equipo</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Casos abiertos</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{openClaims}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Prioridad alta</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{highPriorityClaims}</p>
                </div>
              </div>
            </div>
          </section>
          <ClaimsSection claims={claims} title="Seguimiento del equipo" />
        </>
      )}

      {viewMode === "asesor" && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Cotizaciones", value: demoSalesQuotes.length },
              { label: "En seguimiento", value: demoSalesQuotes.filter((quote) => quote.status === "En seguimiento").length },
              { label: "Casos abiertos", value: openClaims },
              { label: "Prioridad alta", value: highPriorityClaims },
            ].map((item) => (
              <article key={item.label} className="metric-card">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
              </article>
            ))}
          </section>

          <section className="mt-8 panel">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Cotizaciones recientes</h2>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Datos de demostración</span>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Cotización</th>
                    <th className="px-4 py-3 font-medium">Vendedor</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {demoSalesQuotes.slice(0, 6).map((quote) => (
                    <tr key={quote.id}>
                      <td className="px-4 py-3 font-medium text-slate-800">{quote.id}</td>
                      <td className="px-4 py-3">{quote.seller}</td>
                      <td className="px-4 py-3">{quote.customer}</td>
                      <td className="px-4 py-3">{quote.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <ClaimsSection claims={claims} title="Casos para seguimiento" />
          <p className="mt-4 text-xs text-slate-500">
            Las cotizaciones son datos de demostración; los casos no están asignados individualmente a un asesor.
          </p>
        </>
      )}
    </main>
  );
}
