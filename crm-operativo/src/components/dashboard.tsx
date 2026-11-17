"use client";

import { useEffect, useState } from "react";
import { CrmIcon } from "@/components/crm-icons";
import { CreateQuoteDialog } from "@/components/create-quote-dialog";
import { SiteNav } from "@/components/site-nav";
import { formatChannelLabel, type Claim } from "@/domain/crm";
import {
  addCreatedSalesQuote,
  applySalesQuoteStatusUpdates,
  demoSalesQuotes,
  getSalesSellerForUser,
  MONTHLY_SALES_BUDGET_PER_SELLER,
  readCreatedSalesQuotes,
  readSalesQuoteStatusUpdates,
  salesSellers,
  type CreatedSalesQuote,
  type SalesQuoteStatusUpdate,
  type SalesQuote,
} from "@/domain/sales";
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

function formatCurrency(value: number) {
  return `$ ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value)}`;
}

function getGreeting(date: Date) {
  if (date.getHours() < 12) return "Buenos días";
  if (date.getHours() < 19) return "Buenas tardes";
  return "Buenas noches";
}

function WorkspaceCalendar({ quotes, today }: { quotes: SalesQuote[]; today: string }) {
  const [year, month] = today.slice(0, 7).split("-").map(Number);
  const firstDayOffset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthLabel = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" })
    .format(new Date(year, month - 1, 1));
  const monthQuotes = quotes.filter((quote) => quote.date.startsWith(today.slice(0, 7)));
  const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <section className="mt-8 panel" aria-labelledby="workspace-calendar-title">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="workspace-calendar-title" className="text-xl font-semibold text-slate-900">Calendario comercial</h2>
          <p className="mt-1 text-sm capitalize text-slate-600">{monthLabel}</p>
        </div>
        <p className="text-xs text-slate-500">Tus cotizaciones del mes</p>
      </header>
      <div className="overflow-x-auto">
        <div className="grid min-w-[560px] grid-cols-7 gap-2">
          {weekdays.map((weekday) => (
            <div key={weekday} className="px-2 py-1 text-center text-xs font-semibold text-slate-500">{weekday}</div>
          ))}
          {Array.from({ length: firstDayOffset }, (_, index) => (
            <div key={`empty-${index}`} aria-hidden="true" />
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const date = `${today.slice(0, 7)}-${String(day).padStart(2, "0")}`;
            const dayQuotes = monthQuotes.filter((quote) => quote.date === date);

            return (
              <div
                key={date}
                aria-label={`${day} de ${monthLabel}${dayQuotes.length ? `, ${dayQuotes.length} cotizaciones` : ""}`}
                className={`min-h-20 rounded-xl border p-2 ${
                  date === today ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-slate-200 bg-slate-50"
                }`}
              >
                <span className={`text-xs font-semibold ${date === today ? "text-brand-700" : "text-slate-700"}`}>
                  {day}{date === today ? " · Hoy" : ""}
                </span>
                <div className="mt-1 space-y-1">
                  {dayQuotes.slice(0, 2).map((quote) => (
                    <span
                      key={quote.id}
                      title={`${quote.id} · ${quote.customer}`}
                      className={`block truncate rounded px-1 py-0.5 text-[10px] font-medium ${
                        quote.status === "Venta realizada"
                          ? "bg-emerald-100 text-emerald-800"
                          : quote.status === "Venta rechazada"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {quote.id}
                    </span>
                  ))}
                  {dayQuotes.length > 2 && <span className="text-[10px] text-slate-500">+{dayQuotes.length - 2} más</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600" aria-label="Estados de cotización">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />En seguimiento</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Venta realizada</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" />Venta rechazada</span>
      </div>
    </section>
  );
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
  const [session, setSession] = useState<{ role: AppRole; username: string; name: string } | null>(
    isPagesDemo ? { role: "admin", username: "adminCRM01", name: "Vista demo" } : null,
  );
  const [viewMode, setViewMode] = useState<DashboardView>(isPagesDemo ? "gerente" : "asesor");
  const [today, setToday] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [createdQuotes, setCreatedQuotes] = useState<CreatedSalesQuote[]>([]);
  const [quoteStatusUpdates, setQuoteStatusUpdates] = useState<Record<string, SalesQuoteStatusUpdate>>({});
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteCreationMessage, setQuoteCreationMessage] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setToday(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
    setGreeting(getGreeting(now));
    setCreatedQuotes(readCreatedSalesQuotes());
    setQuoteStatusUpdates(readSalesQuoteStatusUpdates());

    if (!isPagesDemo) {
      const activeSession = getSessionFromStorage();
      if (activeSession) {
        setSession({ role: activeSession.role, username: activeSession.username, name: activeSession.name });
        setViewMode(
          activeSession.role === "admin"
            ? "gerente"
            : activeSession.role === "supervisor"
              ? "supervisor"
              : "asesor",
        );
      }
      return;
    }

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
  const demoAdvisorMode = isPagesDemo && viewMode === "asesor";
  const canViewTeamSales = (session?.role === "admin" || session?.role === "supervisor") && !demoAdvisorMode;
  const assignedSeller = session?.role === "agent"
    ? getSalesSellerForUser(session.username, session.name)
    : demoAdvisorMode ? salesSellers[0] : null;
  const allWorkspaceSalesQuotes = applySalesQuoteStatusUpdates(
    [...createdQuotes, ...demoSalesQuotes],
    quoteStatusUpdates,
  );
  const workspaceSalesQuotes = canViewTeamSales
    ? allWorkspaceSalesQuotes
    : assignedSeller
      ? allWorkspaceSalesQuotes.filter((quote) => quote.seller === assignedSeller)
      : [];
  const monthKey = today?.slice(0, 7);
  const monthlySales = monthKey
    ? workspaceSalesQuotes
      .filter((quote) => (quote.saleDate ?? quote.date).startsWith(monthKey) && quote.status === "Venta realizada")
      .reduce((total, quote) => total + quote.amount, 0)
    : 0;
  const monthlyBudget = assignedSeller
    ? MONTHLY_SALES_BUDGET_PER_SELLER
    : canViewTeamSales
      ? MONTHLY_SALES_BUDGET_PER_SELLER * salesSellers.length
      : 0;
  const monthlyBudgetProgress = monthlyBudget > 0
    ? Math.min(Math.round((monthlySales / monthlyBudget) * 100), 100)
    : 0;

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

  const handleCreateQuote = (quote: CreatedSalesQuote) => {
    if (!addCreatedSalesQuote(quote)) return false;
    setCreatedQuotes((current) => [quote, ...current]);
    setQuoteCreationMessage(quote.id);
    return true;
  };

  return (
    <main className="crm-main mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SiteNav />
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.08em] text-brand-600">CRM operativo</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            {viewMode === "asesor" && (session?.role === "agent" || demoAdvisorMode)
              ? `${greeting ?? "Hola"}, ${assignedSeller ?? session?.name ?? "asesor"}`
              : viewMode === "gerente"
                ? "Panel de atención y servicio"
                : viewMode === "supervisor"
                  ? "Supervisión de servicio"
                  : "Espacio del asesor"}
          </h1>
          {viewMode === "asesor" && session?.role === "agent" && (
            <p className="mt-2 text-sm text-slate-600">Este es tu espacio de trabajo comercial.</p>
          )}
        </div>
        {viewMode === "asesor" ? (
          <section className="panel w-full max-w-sm" aria-label="Meta de presupuesto mensual">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Meta mensual</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {monthlyBudget > 0 ? formatCurrency(monthlyBudget) : "Sin meta asignada"}
                </p>
              </div>
              <span className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-800">
                {monthlyBudgetProgress}%
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {monthlyBudget > 0 ? `${formatCurrency(monthlySales)} en ventas este mes` : "Solicita al administrador que asigne tu vendedor."}
            </p>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-label="Avance de la meta mensual"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={monthlyBudgetProgress}
            >
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${monthlyBudgetProgress}%` }} />
            </div>
          </section>
        ) : (
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
        )}
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
              { label: "Cotizaciones", value: workspaceSalesQuotes.length },
              { label: "En seguimiento", value: workspaceSalesQuotes.filter((quote) => quote.status === "En seguimiento").length },
              { label: "Ventas realizadas", value: workspaceSalesQuotes.filter((quote) => quote.status === "Venta realizada").length },
              { label: "Ventas rechazadas", value: workspaceSalesQuotes.filter((quote) => quote.status === "Venta rechazada").length },
            ].map((item) => (
              <article key={item.label} className="metric-card">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
              </article>
            ))}
          </section>

          {assignedSeller && (
            <section className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">¿Nueva oportunidad?</h2>
                <p className="mt-1 text-sm text-slate-600">Registra los datos del cliente y arma una cotización con productos del inventario.</p>
                {quoteCreationMessage && (
                  <p role="status" className="mt-2 text-sm font-medium text-emerald-700">
                    Cotización {quoteCreationMessage} creada correctamente.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuoteCreationMessage(null);
                  setIsQuoteDialogOpen(true);
                }}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <span aria-hidden="true">+</span>
                Crear cotización
              </button>
            </section>
          )}

          <section className="mt-8 panel">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">Cotizaciones recientes</h2>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Datos de demostración</span>
            </div>
            {!canViewTeamSales && !assignedSeller ? (
              <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-900">
                Tu usuario todavía no tiene un vendedor asignado.
              </p>
            ) : workspaceSalesQuotes.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-600">
                No hay cotizaciones para mostrar.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Cotización</th>
                      {canViewTeamSales && <th className="px-4 py-3 font-medium">Vendedor</th>}
                      <th className="px-4 py-3 font-medium">Cliente</th>
                      <th className="px-4 py-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {workspaceSalesQuotes.slice(0, 6).map((quote) => (
                      <tr key={quote.id}>
                        <td className="px-4 py-3 font-medium text-slate-800">{quote.id}</td>
                        {canViewTeamSales && <td className="px-4 py-3">{quote.seller}</td>}
                        <td className="px-4 py-3">{quote.customer}</td>
                        <td className="px-4 py-3">{quote.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          {today && <WorkspaceCalendar quotes={workspaceSalesQuotes} today={today} />}
          <p className="mt-4 text-xs text-slate-500">Las cotizaciones son datos de demostración.</p>
        </>
      )}
      {isQuoteDialogOpen && assignedSeller && (
        <CreateQuoteDialog
          seller={assignedSeller}
          quoteNumber={demoSalesQuotes.length + createdQuotes.length + 1}
          onClose={() => setIsQuoteDialogOpen(false)}
          onCreate={handleCreateQuote}
        />
      )}
    </main>
  );
}
