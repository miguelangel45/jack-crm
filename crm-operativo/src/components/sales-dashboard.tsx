"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { jsPDF } from "jspdf";
import { CrmIcon, type CrmIconName } from "@/components/crm-icons";
import { SiteNav } from "@/components/site-nav";
import type { AppRole } from "@/lib/auth";
import { DASHBOARD_VIEW_STORAGE_KEY, dashboardViewOptions, type DashboardView } from "@/lib/dashboard-view";
import { getSessionFromStorage } from "@/lib/permissions";
import { isPagesDemo } from "@/lib/pages-demo";
import {
  demoSalesQuotes,
  getSalesSellerForUser,
  salesSellers,
  type QuoteStatus,
  type SalesQuote,
} from "@/domain/sales";

const allSellers = "Todos los vendedores";

const statusStyles: Record<QuoteStatus, string> = {
  "En seguimiento": "sales-status-pill--follow-up",
  "Venta realizada": "sales-status-pill--won",
  "Venta rechazada": "sales-status-pill--rejected",
};

type DateRange = { start: string; end: string };
type DateShortcut = "Este mes" | "Mes pasado" | "Último trimestre";

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCurrency(value: number) {
  return `$ ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value)}`;
}

function getDaysSince(date: string, today: string) {
  const elapsed = Date.parse(`${today}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(elapsed) ? Math.floor(elapsed / 86_400_000) : 0;
}

function createQuotePdf(quote: SalesQuote, discountPercent = 0) {
  const document = new jsPDF();
  const discountAmount = Math.round(quote.amount * discountPercent / 100);
  const finalAmount = quote.amount - discountAmount;
  document.setProperties({
    title: `Cotización ${quote.id}${discountPercent > 0 ? ` con descuento del ${discountPercent}%` : ""}`,
  });
  document.setFont("helvetica", "bold");
  document.setFontSize(18);
  document.text("CRM Operativo", 20, 22);
  document.setFontSize(13);
  document.text("COTIZACIÓN", 20, 36);
  document.setFont("helvetica", "normal");
  document.setFontSize(10);
  document.text(`Número: ${quote.id}`, 20, 50);
  document.text(`Cliente: ${quote.customer}`, 20, 60);
  document.text(`Vendedor: ${quote.seller}`, 20, 70);
  document.text(`Fecha: ${formatDate(quote.date)}`, 20, 80);
  document.text(`Vigencia: ${formatDate(quote.validUntil)}`, 20, 90);
  document.text(`Estado: ${quote.status}`, 20, 100);
  document.setDrawColor(210, 216, 226);
  document.line(20, 108, 190, 108);
  document.setFont("helvetica", "bold");
  document.text("Concepto", 20, 120);
  document.setFont("helvetica", "normal");
  const conceptLines = document.splitTextToSize(quote.concept, 165);
  document.text(conceptLines, 20, 130);
  const amountY = 138 + conceptLines.length * 6;
  document.setFont("helvetica", "bold");
  if (discountPercent > 0) {
    document.text("Valor antes del descuento", 20, amountY);
    document.text(formatCurrency(quote.amount), 190, amountY, { align: "right" });
    document.setFont("helvetica", "normal");
    document.text(`Descuento (${discountPercent}%)`, 20, amountY + 8);
    document.text(`- ${formatCurrency(discountAmount)}`, 190, amountY + 8, { align: "right" });
    document.setFont("helvetica", "bold");
    document.text("Total con descuento", 20, amountY + 18);
    document.text(formatCurrency(finalAmount), 190, amountY + 18, { align: "right" });
  } else {
    document.text("Valor estimado", 20, amountY);
    document.text(formatCurrency(quote.amount), 190, amountY, { align: "right" });
  }
  document.setFont("helvetica", "normal");
  document.setFontSize(9);
  document.text(
    "Documento de demostración. Datos y valores ficticios.",
    20,
    amountY + (discountPercent > 0 ? 34 : 18),
  );
  return document;
}

function downloadQuotePdf(quote: SalesQuote, discountPercent = 0) {
  const suffix = discountPercent > 0 ? `-descuento-${discountPercent}pct` : "";
  createQuotePdf(quote, discountPercent).save(`cotizacion-${quote.id}${suffix}.pdf`);
}

function openQuotePdf(quote: SalesQuote, discountPercent = 0) {
  const pdfUrl = URL.createObjectURL(createQuotePdf(quote, discountPercent).output("blob"));
  const pdfWindow = window.open(pdfUrl, "_blank");
  if (!pdfWindow) {
    URL.revokeObjectURL(pdfUrl);
    throw new Error("El navegador bloqueó la ventana de vista previa.");
  }

  pdfWindow.opener = null;
  window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
}

function getShortcutRange(shortcut: DateShortcut): DateRange {
  const today = new Date();
  const end = formatInputDate(today);

  if (shortcut === "Este mes") {
    return { start: formatInputDate(new Date(today.getFullYear(), today.getMonth(), 1)), end };
  }

  if (shortcut === "Mes pasado") {
    return {
      start: formatInputDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      end: formatInputDate(new Date(today.getFullYear(), today.getMonth(), 0)),
    };
  }

  const startMonth = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  const lastDayOfStartMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() + 1, 0).getDate();
  startMonth.setDate(Math.min(today.getDate(), lastDayOfStartMonth));
  return { start: formatInputDate(startMonth), end };
}

export function SalesDashboard() {
  const [selectedSeller, setSelectedSeller] = useState<string>(allSellers);
  const [assignedSeller, setAssignedSeller] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"all" | QuoteStatus>("all");
  const [selectedQuote, setSelectedQuote] = useState<SalesQuote | null>(null);
  const quoteDialogRef = useRef<HTMLElement>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2026-11-30");
  const [reportRange, setReportRange] = useState({ start: "2026-10-01", end: "2026-11-30" });
  const [today, setToday] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountSuccess, setDiscountSuccess] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState("10");
  const [generatedDiscount, setGeneratedDiscount] = useState<number | null>(null);
  const [followUpAlertsEnabled, setFollowUpAlertsEnabled] = useState(true);

  useEffect(() => {
    setToday(formatInputDate(new Date()));
  }, []);

  useEffect(() => {
    if (isPagesDemo) return;
    const session = getSessionFromStorage();
    const activeRole = session?.role ?? "viewer";
    setRole(activeRole);
    if (activeRole === "admin" || activeRole === "supervisor") {
      setAssignedSeller(null);
      setSelectedSeller(allSellers);
    } else {
      const seller = session ? getSalesSellerForUser(session.username, session.name) : null;
      setAssignedSeller(seller);
      setSelectedSeller(seller ?? "");
    }
  }, []);

  useEffect(() => {
    if (!isPagesDemo) return;

    let selectedView: DashboardView = "gerente";
    try {
      const savedView = sessionStorage.getItem(DASHBOARD_VIEW_STORAGE_KEY);
      selectedView = dashboardViewOptions.find((option) => option.id === savedView)?.id ?? "gerente";
    } catch (error) {
      console.error("No se pudo leer el modo de vista guardado.", error);
    }

    if (selectedView === "asesor") {
      setRole("agent");
      setAssignedSeller(salesSellers[0]);
      setSelectedSeller(salesSellers[0]);
      return;
    }

    setRole(selectedView === "supervisor" ? "supervisor" : "admin");
    setAssignedSeller(null);
    setSelectedSeller(allSellers);
  }, []);

  useEffect(() => {
    if (!selectedQuote) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocusedElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedQuote(null);
    };

    document.body.style.overflow = "hidden";
    quoteDialogRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [selectedQuote]);

  const canViewAllSellers = role === "admin" || role === "supervisor";
  const reportQuotes = demoSalesQuotes
    .filter((quote) => (
      (canViewAllSellers
        ? selectedSeller === allSellers || quote.seller === selectedSeller
        : Boolean(assignedSeller && quote.seller === assignedSeller))
      && quote.date >= reportRange.start
      && quote.date <= reportRange.end
    ))
    .sort((first, second) => second.date.localeCompare(first.date));
  const filteredQuotes = reportQuotes.filter((quote) => selectedStatus === "all" || quote.status === selectedStatus);
  const followUpAlerts = today
    ? reportQuotes
      .filter((quote) => quote.status === "En seguimiento" && getDaysSince(quote.date, today) >= 2)
      .map((quote) => ({ quote, days: getDaysSince(quote.date, today) }))
    : [];

  const quoteCounts = {
    total: reportQuotes.length,
    followUp: reportQuotes.filter((quote) => quote.status === "En seguimiento").length,
    completed: reportQuotes.filter((quote) => quote.status === "Venta realizada").length,
    rejected: reportQuotes.filter((quote) => quote.status === "Venta rechazada").length,
  };
  const soldAmount = reportQuotes
    .filter((quote) => quote.status === "Venta realizada")
    .reduce((total, quote) => total + quote.amount, 0);
  const rejectedAmount = reportQuotes
    .filter((quote) => quote.status === "Venta rechazada")
    .reduce((total, quote) => total + quote.amount, 0);
  const closedQuotes = quoteCounts.completed + quoteCounts.rejected;
  const closeRate = closedQuotes === 0 ? 0 : Math.round((quoteCounts.completed / closedQuotes) * 100);
  const statusDistribution = [
    {
      label: "En seguimiento",
      count: quoteCounts.followUp,
      className: "sales-state-segment--follow-up",
    },
    {
      label: "Venta realizada",
      count: quoteCounts.completed,
      className: "sales-state-segment--won",
    },
    {
      label: "Venta rechazada",
      count: quoteCounts.rejected,
      className: "sales-state-segment--rejected",
    },
  ].map((status) => ({
    ...status,
    percentage: quoteCounts.total === 0 ? 0 : (status.count / quoteCounts.total) * 100,
  }));

  function generateReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (startDate > endDate) {
      setDateError("La fecha inicial debe ser anterior o igual a la fecha final.");
      return;
    }

    setDateError(null);
    setReportRange({ start: startDate, end: endDate });
    setSelectedStatus("all");
  }

  function applyDateShortcut(shortcut: DateShortcut) {
    const range = getShortcutRange(shortcut);
    setDateError(null);
    setStartDate(range.start);
    setEndDate(range.end);
    setReportRange(range);
    setSelectedStatus("all");
  }

  function showQuotePdf(quote: SalesQuote, discount = 0) {
    setPdfError(null);
    try {
      openQuotePdf(quote, discount);
    } catch (error) {
      console.error("No se pudo visualizar el PDF de la cotización", error);
      setPdfError("No se pudo abrir la vista previa del PDF. Permite las ventanas emergentes e inténtalo de nuevo.");
    }
  }

  function createDiscountedQuotePdf() {
    if (!selectedQuote) return;

    const discount = Number(discountPercent);
    if (!Number.isInteger(discount) || discount < 1 || discount > 100) {
      setDiscountError("Ingresa un descuento entero entre 1% y 100%.");
      setDiscountSuccess(null);
      setGeneratedDiscount(null);
      return;
    }

    setDiscountError(null);
    setPdfError(null);
    setDiscountSuccess(null);
    try {
      downloadQuotePdf(selectedQuote, discount);
      setGeneratedDiscount(discount);
      setDiscountSuccess(`Se generó y descargó la cotización con ${discount}% de descuento.`);
    } catch (error) {
      console.error("No se pudo generar el PDF con descuento", error);
      setPdfError("No se pudo generar el PDF con descuento. Inténtalo de nuevo.");
    }
  }

  if (role === null) {
    return (
      <main className="crm-main mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SiteNav />
        <p className="text-sm text-slate-600">Cargando informe de ventas...</p>
      </main>
    );
  }

  const tabId = selectedSeller.toLowerCase().replace(/ /g, "-");
  const sellersToShow = canViewAllSellers
    ? [allSellers, ...salesSellers]
    : assignedSeller ? [assignedSeller] : [];
  const metrics: {
    label: string;
    value: string;
    detail: string;
    icon: CrmIconName;
    tone: "neutral" | "follow-up" | "won" | "rejected";
    filter: "all" | QuoteStatus | null;
    comparison?: { sold: number; rejected: number };
  }[] = [
    { label: "Cotizaciones", value: String(quoteCounts.total), detail: "En el período seleccionado", icon: "i-tickets", tone: "neutral", filter: "all" },
    { label: "En seguimiento", value: String(quoteCounts.followUp), detail: "Pendientes de respuesta", icon: "i-alertas", tone: "follow-up", filter: "En seguimiento" },
    { label: "Ventas realizadas", value: String(quoteCounts.completed), detail: "Cotizaciones convertidas", icon: "i-panel", tone: "won", filter: "Venta realizada" },
    { label: "Ventas rechazadas", value: String(quoteCounts.rejected), detail: "Cotizaciones no concretadas", icon: "i-reclamaciones", tone: "rejected", filter: "Venta rechazada" },
    { label: "Tasa de cierre", value: `${closeRate}%`, detail: `${quoteCounts.completed} de ${closedQuotes} ventas decididas`, icon: "i-kpi", tone: "neutral", filter: null },
    {
      label: "Venta vs. rechazada",
      value: "",
      detail: "Valor de cotizaciones en el período",
      icon: "i-panel",
      tone: "neutral",
      filter: null,
      comparison: { sold: soldAmount, rejected: rejectedAmount },
    },
  ];

  return (
    <main className="crm-main mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SiteNav />
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.08em] text-brand-600">Operación comercial</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Panel de ventas</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {canViewAllSellers
              ? "Consulta los resultados generales o filtra las cotizaciones por vendedor."
              : "Consulta tus cotizaciones y resultados en el período que elijas."}
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--champagne)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <span className="h-2 w-2 rounded-full bg-[var(--champagne)]" />
          Datos de demostración
        </span>
      </header>

      <section className="panel mb-6" aria-labelledby="sales-report-title">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 id="sales-report-title" className="text-lg font-semibold text-slate-900">Generar informe por fechas</h2>
            <p className="mt-1 text-sm text-slate-600">
              {canViewAllSellers ? "Elige un vendedor o consulta el consolidado del equipo." : "El informe incluye únicamente tus cotizaciones."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Atajos de fecha">
            {(["Este mes", "Mes pasado", "Último trimestre"] as const).map((shortcut) => (
              <button
                key={shortcut}
                type="button"
                className="sales-date-shortcut"
                onClick={() => applyDateShortcut(shortcut)}
              >
                {shortcut}
              </button>
            ))}
          </div>
        </div>
        <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={generateReport}>
          <div className="flex-1">
            <label htmlFor="sales-start-date" className="mb-1.5 block text-sm font-medium text-slate-700">Desde</label>
            <input
              id="sales-start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="sales-end-date" className="mb-1.5 block text-sm font-medium text-slate-700">Hasta</label>
            <input
              id="sales-end-date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
            />
          </div>
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
            Generar informe
          </button>
        </form>
        {dateError && <p role="alert" className="mt-3 text-sm text-rose-700">{dateError}</p>}
      </section>

      {!canViewAllSellers && !assignedSeller ? (
        <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-900">
          Este usuario no tiene un vendedor asignado. Solicita al administrador que configure tu cuenta.
        </p>
      ) : (
      <section aria-label="Informes por vendedor">
        <div role="tablist" aria-label="Vendedores" className="mb-5 flex flex-wrap gap-2">
          {sellersToShow.map((seller) => {
            const sellerTabId = seller.toLowerCase().replace(/ /g, "-");
            const sellerQuoteCount = demoSalesQuotes.filter((quote) => (
              (seller === allSellers || quote.seller === seller)
              && quote.date >= reportRange.start
              && quote.date <= reportRange.end
            )).length;
            const isSelected = selectedSeller === seller;

            return (
              <button
                key={seller}
                id={`sales-tab-${sellerTabId}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`sales-panel-${sellerTabId}`}
                onClick={() => setSelectedSeller(seller)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  isSelected
                    ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {seller}
                <span className={`rounded-full px-2 py-0.5 text-xs ${isSelected ? "bg-white/15" : "bg-slate-100"}`}>
                  {sellerQuoteCount}
                </span>
              </button>
            );
          })}
        </div>

        <div
          id={`sales-panel-${tabId}`}
          role="tabpanel"
          aria-labelledby={`sales-tab-${tabId}`}
          tabIndex={0}
        >
          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const filter = metric.filter;
              const content = (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-medium text-slate-600">{metric.label}</h2>
                    <span className={`sales-metric-icon sales-metric-icon--${metric.tone}`}>
                      <CrmIcon name={metric.icon} className="h-5 w-5" />
                    </span>
                  </div>
                  {metric.comparison ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-lg font-bold text-emerald-700">{formatCurrency(metric.comparison.sold)}</p>
                        <p className="text-xs text-slate-500">Venta realizada</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-rose-700">{formatCurrency(metric.comparison.rejected)}</p>
                        <p className="text-xs text-slate-500">Venta rechazada</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
                  )}
                  <p className="text-xs text-slate-500">{metric.detail}</p>
                </>
              );

              if (filter === null) {
                return <article key={metric.label} className="metric-card">{content}</article>;
              }

              return (
                <button
                  key={metric.label}
                  type="button"
                  className={`metric-card sales-filter-card${selectedStatus === filter ? " is-selected" : ""}`}
                  aria-pressed={selectedStatus === filter}
                  onClick={() => setSelectedStatus(filter)}
                >
                  {content}
                </button>
              );
            })}
          </div>

          {role === "agent" && today && followUpAlerts.length > 0 && (
            followUpAlertsEnabled ? (
              <aside
                role="alert"
                aria-labelledby="sales-follow-up-title"
                className="fixed right-4 top-4 z-50 w-96 max-w-[90vw] overflow-hidden rounded-2xl border border-amber-300 bg-[var(--surface)] text-[var(--text-primary)] shadow-2xl"
              >
                <header className="flex items-start justify-between gap-3 border-b border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="sales-metric-icon sales-metric-icon--follow-up">
                      <CrmIcon name="i-alertas" className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 id="sales-follow-up-title" className="font-semibold text-amber-950">
                        Seguimientos pendientes
                      </h2>
                      <p className="mt-1 text-sm text-amber-900">
                        {followUpAlerts.length} cotizaciones requieren atención
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-200 px-2.5 py-1 text-xs font-bold text-amber-950">
                    {followUpAlerts.length}
                  </span>
                </header>
                <ul className="max-h-60 divide-y divide-slate-200 overflow-y-auto">
                  {followUpAlerts.map(({ quote, days }) => (
                    <li key={quote.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{quote.id} · {quote.customer}</p>
                        <p className="mt-0.5 text-xs text-slate-600">Pendiente hace {days} días</p>
                      </div>
                      <button
                        type="button"
                        className="sales-view-quote shrink-0"
                        onClick={() => {
                          setPdfError(null);
                          setDiscountError(null);
                          setDiscountSuccess(null);
                          setGeneratedDiscount(null);
                          setSelectedQuote(quote);
                        }}
                      >
                        Abrir
                      </button>
                    </li>
                  ))}
                </ul>
                <label className="flex cursor-pointer items-center gap-2 border-t border-slate-200 px-4 py-3 text-xs font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={followUpAlertsEnabled}
                    onChange={(event) => setFollowUpAlertsEnabled(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Mostrar alerta flotante
                </label>
              </aside>
            ) : (
              <button
                type="button"
                aria-label={`Mostrar ${followUpAlerts.length} seguimientos pendientes`}
                onClick={() => setFollowUpAlertsEnabled(true)}
                className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 shadow-xl"
              >
                <CrmIcon name="i-alertas" className="h-5 w-5" />
                Ver pendientes · {followUpAlerts.length}
              </button>
            )
          )}

          <section className="panel">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {selectedStatus === "all"
                    ? selectedSeller === allSellers ? "Todas las cotizaciones" : `Cotizaciones de ${selectedSeller}`
                    : `Cotizaciones · ${selectedStatus}`}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDate(reportRange.start)} – {formatDate(reportRange.end)}
                </p>
              </div>
              <p className="text-sm text-slate-500">{filteredQuotes.length} registros</p>
            </div>

            {filteredQuotes.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Cotización</th>
                      {selectedSeller === allSellers && <th scope="col" className="px-4 py-3 font-medium">Vendedor</th>}
                      <th scope="col" className="px-4 py-3 font-medium">Cliente</th>
                      <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                      <th scope="col" className="px-4 py-3 font-medium">Valor</th>
                      <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredQuotes.map((quote) => (
                      <tr key={quote.id}>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{quote.id}</td>
                        {selectedSeller === allSellers && <td className="whitespace-nowrap px-4 py-3 text-slate-700">{quote.seller}</td>}
                        <td className="px-4 py-3 text-slate-700">{quote.customer}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          <time dateTime={quote.date}>{formatDate(quote.date)}</time>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatCurrency(quote.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`sales-status-pill ${statusStyles[quote.status]}`}>
                            {quote.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              className="sales-view-quote"
                              onClick={() => {
                                setPdfError(null);
                                setDiscountError(null);
                                setDiscountSuccess(null);
                                setGeneratedDiscount(null);
                                setSelectedQuote(quote);
                              }}
                            >
                              Detalle
                            </button>
                            <button type="button" className="sales-view-quote" onClick={() => showQuotePdf(quote)}>
                              Ver PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-600">
                No hay cotizaciones{selectedStatus === "all" ? "" : ` con estado «${selectedStatus}»`} en el período seleccionado.
              </p>
            )}
          </section>

          {pdfError && !selectedQuote && <p role="alert" className="mt-3 text-sm text-rose-700">{pdfError}</p>}

          <section className="panel mt-6" aria-labelledby="sales-comparison-title">
            <div className="mb-5">
              <h2 id="sales-comparison-title" className="text-xl font-semibold text-slate-900">Distribución de estados</h2>
              <p className="mt-1 text-sm text-slate-600">
                Proporción de los tres estados en las {quoteCounts.total} cotizaciones del período.
              </p>
            </div>
            <div
              role="img"
              aria-label={statusDistribution.map((status) => `${status.label}: ${Math.round(status.percentage)}%`).join(", ")}
              className="sales-state-bar"
            >
              {statusDistribution.map((status) => (
                <span
                  key={status.label}
                  className={status.className}
                  style={{ width: `${status.percentage}%` }}
                />
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {statusDistribution.map((status) => (
                <div key={status.label} className="flex items-center gap-2 text-sm">
                  <span className={`sales-state-dot ${status.className}`} aria-hidden="true" />
                  <span className="text-slate-700">{status.label}</span>
                  <span className="ml-auto font-semibold text-slate-900">{status.count} · {Math.round(status.percentage)}%</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
      )}

      <p className="mt-5 text-xs text-slate-500">
        Información ficticia para demostración; no está conectada a una base de datos.
      </p>

      {selectedQuote && (
        <div
          className="sales-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedQuote(null);
          }}
        >
          <section
            ref={quoteDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sales-quote-modal-title"
            className="sales-quote-modal"
            tabIndex={-1}
          >
            <header className="sales-quote-modal-header">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-600">CRM Operativo · Demo</p>
                <h2 id="sales-quote-modal-title" className="mt-1 text-2xl font-semibold text-slate-900">
                  Cotización {selectedQuote.id}
                </h2>
              </div>
              <button
                type="button"
                className="sales-date-shortcut"
                aria-label="Cerrar cotización"
                onClick={() => setSelectedQuote(null)}
              >
                Cerrar
              </button>
            </header>

            <div className="p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Cliente</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{selectedQuote.customer}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Vendedor</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{selectedQuote.seller}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Fecha de emisión</dt>
                  <dd className="mt-1 text-slate-700">{formatDate(selectedQuote.date)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Válida hasta</dt>
                  <dd className="mt-1 text-slate-700">{formatDate(selectedQuote.validUntil)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Estado</dt>
                  <dd className="mt-2">
                    <span className={`sales-status-pill ${statusStyles[selectedQuote.status]}`}>{selectedQuote.status}</span>
                  </dd>
                </div>
              </dl>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Detalle de la cotización</h3>
                <p className="mt-2 text-sm text-slate-700">{selectedQuote.concept}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="font-semibold text-slate-700">Valor estimado</span>
                  <span className="text-lg font-bold text-slate-900">{formatCurrency(selectedQuote.amount)}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">Cotización de demostración; los datos y valores son ficticios.</p>
              {pdfError && <p role="alert" className="mt-3 text-sm text-rose-700">{pdfError}</p>}
              <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                <label htmlFor="quote-discount" className="block text-sm font-semibold text-slate-800">
                  Generar descuento
                </label>
                <p className="mt-1 text-xs text-slate-500">El descuento se aplicará solo al nuevo PDF y no cambiará la cotización original.</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <div className="relative sm:w-36">
                    <input
                      id="quote-discount"
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      value={discountPercent}
                      onChange={(event) => {
                        setDiscountPercent(event.target.value);
                        setDiscountError(null);
                        setDiscountSuccess(null);
                        setGeneratedDiscount(null);
                      }}
                      aria-describedby={discountError ? "quote-discount-error" : undefined}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-sm text-slate-800"
                    />
                    <span className="pointer-events-none absolute right-3 top-2.5 text-sm text-slate-500">%</span>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                    onClick={createDiscountedQuotePdf}
                  >
                    Generar descuento
                  </button>
                </div>
                {discountError && <p id="quote-discount-error" role="alert" className="mt-2 text-sm text-rose-700">{discountError}</p>}
                {discountSuccess && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <p role="status" className="text-sm text-emerald-700">{discountSuccess}</p>
                    {generatedDiscount !== null && (
                      <button
                        type="button"
                        className="sales-view-quote"
                        onClick={() => showQuotePdf(selectedQuote, generatedDiscount)}
                      >
                        Visualizar PDF con descuento
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  className="sales-date-shortcut"
                  onClick={() => showQuotePdf(selectedQuote)}
                >
                  Visualizar PDF
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                  onClick={() => {
                    try {
                      downloadQuotePdf(selectedQuote);
                    } catch (error) {
                      console.error("No se pudo descargar el PDF de la cotización", error);
                      setPdfError("No se pudo generar el PDF. Inténtalo de nuevo.");
                    }
                  }}
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
