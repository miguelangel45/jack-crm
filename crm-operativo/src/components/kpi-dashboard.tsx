import { SiteNav } from "@/components/site-nav";

const indicators = [
  {
    category: "Financiero",
    title: "Ingresos del mes",
    value: "$48,600",
    change: "+8.2%",
    target: "Meta mensual: $60,000",
    progress: 81,
    details: [
      { label: "Ticket promedio", value: "$380" },
      { label: "Ingresos vs. mes anterior", value: "+$3,680" },
    ],
  },
  {
    category: "Calidad",
    title: "Satisfacción del cliente",
    value: "92%",
    change: "+3 pts",
    target: "Meta: 90%",
    progress: 92,
    details: [
      { label: "Encuestas respondidas", value: "284" },
      { label: "Resolución en primer contacto", value: "78%" },
    ],
  },
  {
    category: "Servicio",
    title: "Primera respuesta",
    value: "4 min",
    change: "-12%",
    target: "Objetivo: menos de 5 min",
    progress: 88,
    details: [
      { label: "Conversaciones atendidas", value: "1,248" },
      { label: "Cumplimiento de SLA", value: "94%" },
    ],
  },
  {
    category: "PQRS",
    title: "Casos resueltos",
    value: "86%",
    change: "+5 pts",
    target: "Meta: 90%",
    progress: 86,
    details: [
      { label: "Casos recibidos", value: "142" },
      { label: "Tiempo promedio de resolución", value: "2.4 días" },
    ],
  },
  {
    category: "Ventas",
    title: "Ventas cerradas",
    value: "128",
    change: "+11%",
    target: "Meta mensual: 150",
    progress: 85,
    details: [
      { label: "Oportunidades atendidas", value: "386" },
      { label: "Conversión", value: "33%" },
    ],
  },
] as const;

export function KpiDashboard() {
  return (
    <main className="crm-main mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SiteNav />
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.08em] text-brand-600">Indicadores de gestión</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">KPI</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Vista de referencia para dar seguimiento al desempeño de la operación.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--champagne)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <span className="h-2 w-2 rounded-full bg-[var(--champagne)]" />
          Simulación de indicadores
        </span>
      </header>

      <section aria-label="Indicadores simulados por categoría" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {indicators.map((indicator) => (
          <article key={indicator.category} className="panel flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-600">{indicator.category}</p>
                <h2 className="mt-2 text-base font-semibold text-slate-900">{indicator.title}</h2>
              </div>
              <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                {indicator.change}
              </span>
            </div>

            <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">{indicator.value}</p>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-600">
                <span>Avance de referencia</span>
                <span>{indicator.progress}%</span>
              </div>
              <div
                role="progressbar"
                aria-label={`Avance de ${indicator.category}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={indicator.progress}
                className="metric-progress-track h-2 overflow-hidden rounded-full"
              >
                <div className="metric-progress-fill h-full rounded-full" style={{ width: `${indicator.progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{indicator.target}</p>
            </div>

            <dl className="mt-5 space-y-3 border-t border-slate-200 pt-4">
              {indicator.details.map((detail) => (
                <div key={detail.label} className="flex items-center justify-between gap-3 text-sm">
                  <dt className="text-slate-600">{detail.label}</dt>
                  <dd className="font-semibold text-slate-800">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </section>
      <p className="mt-5 text-xs text-slate-500">
        Valores ficticios para demostración; no representan datos reales ni se actualizan desde las integraciones.
      </p>
    </main>
  );
}
