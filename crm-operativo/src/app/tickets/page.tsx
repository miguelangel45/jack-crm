"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { SiteNav } from "@/components/site-nav";
import { tickets as fallbackTickets } from "@/domain/integrations";
import { getRoleAccessFor, type AppRole } from "@/lib/auth";
import { getSessionFromStorage } from "@/lib/permissions";
import { isPagesDemo } from "@/lib/pages-demo";

type Ticket = {
  id: string;
  customer: string;
  channel: "facebook" | "instagram" | "mercadolibre";
  priority: "alta" | "media" | "baja";
  status: string;
  createdAt: string;
  claimType: string;
};

function downloadTicketCsv(filename: string, rows: string[][]) {
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

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(fallbackTickets);
  const [session, setSession] = useState<{ role: AppRole } | null>(isPagesDemo ? { role: "admin" } : null);

  useEffect(() => {
    if (isPagesDemo) return;
    const activeSession = getSessionFromStorage();
    if (activeSession) {
      setSession({ role: activeSession.role });
    }

    async function loadTickets() {
      try {
        const response = await fetch("/api/tickets");
        if (!response.ok) return;
        const payload = await response.json();
        setTickets(payload.data ?? fallbackTickets);
      } catch (error) {
        console.error("No se pudo cargar los tickets", error);
      }
    }

    loadTickets();
  }, []);

  const canDownloadFiles = Boolean(session && getRoleAccessFor(session.role).canDownloadFiles);

  const handleDownloadTickets = () => {
    if (!canDownloadFiles) {
      return;
    }

    const rows = [
      ["ID", "Cliente", "Canal", "Prioridad", "Estado", "Tipo de reclamo", "Creada"],
      ...tickets.map((ticket) => [ticket.id, ticket.customer, ticket.channel, ticket.priority, ticket.status, ticket.claimType, ticket.createdAt]),
    ];

    downloadTicketCsv("tickets-crm.csv", rows);
  };

  return (
    <AuthGate route="tickets">
      <main className="crm-main mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <SiteNav />
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-600">Tickets</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Gestión de reclamaciones</h1>
          </div>
          <button
            type="button"
            onClick={handleDownloadTickets}
            disabled={!canDownloadFiles}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canDownloadFiles ? "Descargar CSV" : "Sin permiso de descarga"}
          </button>
        </header>
        <section className="space-y-4">
          {tickets.map((ticket) => (
            <article key={ticket.id} className="panel flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{ticket.id}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{ticket.claimType}</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-900">{ticket.customer}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  ticket.priority === "alta"
                    ? "bg-rose-100 text-rose-700"
                    : ticket.priority === "media"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                }`}>
                  {ticket.priority}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{ticket.status}</span>
                <span className="text-sm text-slate-500">{ticket.createdAt}</span>
              </div>
            </article>
          ))}
        </section>
      </main>
    </AuthGate>
  );
}
