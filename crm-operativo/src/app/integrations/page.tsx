"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { SiteNav } from "@/components/site-nav";
import { integrationConnections as fallbackConnections, providerLabels } from "@/domain/integrations";
import { isPagesDemo } from "@/lib/pages-demo";

type Connection = {
  id: string;
  provider: "facebook" | "instagram" | "mercadolibre";
  name: string;
  status: "online" | "syncing" | "warning" | "error";
  lastSync: string;
  accountName: string;
  enabled: boolean;
};

export default function IntegrationsPage() {
  const [connections, setConnections] = useState<Connection[]>(fallbackConnections);

  useEffect(() => {
    if (isPagesDemo) return;
    async function loadConnections() {
      try {
        const response = await fetch("/api/integrations");
        if (!response.ok) return;
        const payload = await response.json();
        setConnections(payload.data ?? fallbackConnections);
      } catch (error) {
        console.error("No se pudo cargar las integraciones", error);
      }
    }

    loadConnections();
  }, []);

  return (
    <AuthGate route="integrations">
      <main className="crm-main mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <SiteNav />
        <header className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-600">Integraciones</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Canales conectados</h1>
        </header>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {connections.map((connection) => (
            <article key={connection.id} className="panel flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{connection.provider}</div>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">{connection.name}</h2>
                </div>
                <span className={`inline-flex h-3 w-3 rounded-full ${
                  connection.status === "online"
                    ? "bg-emerald-500"
                    : connection.status === "syncing"
                      ? "bg-amber-500"
                      : connection.status === "warning"
                        ? "bg-orange-500"
                        : "bg-slate-300"
                }`} />
              </div>
              <div className="text-sm text-slate-600">Cuenta: {connection.accountName}</div>
              <div className="text-sm text-slate-600">Última sincronización: {connection.lastSync}</div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-slate-700">{providerLabels[connection.provider]}</span>
                <span className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600">
                  {connection.enabled ? "Activa" : "Inactiva"}
                </span>
              </div>
            </article>
          ))}
        </section>
      </main>
    </AuthGate>
  );
}
