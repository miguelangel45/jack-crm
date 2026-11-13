"use client";

import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { formatChannelLabel, type Claim } from "@/domain/crm";
import { getRoleAccessFor, type AppRole } from "@/lib/auth";
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

export function Dashboard() {
  const [integrations, setIntegrations] = useState(fallbackIntegrations);
  const [claims, setClaims] = useState<Claim[]>(fallbackClaims);
  const [session, setSession] = useState<{ role: AppRole } | null>(isPagesDemo ? { role: "admin" } : null);

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
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Panel de atención y servicio</h1>
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

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Integraciones</h2>
            <button className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white">Configurar</button>
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
      </section>

      <section className="mt-8 panel">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Reclamaciones</h2>
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
    </main>
  );
}
