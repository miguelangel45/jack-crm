export type QuoteStatus = "En seguimiento" | "Venta realizada" | "Venta rechazada";

export type SalesQuote = {
  id: string;
  seller: string;
  customer: string;
  date: string;
  validUntil: string;
  status: QuoteStatus;
  concept: string;
  amount: number;
};

export const MONTHLY_SALES_BUDGET_PER_SELLER = 15_000_000;

export const salesSellers = ["Vendedor 1", "Vendedor 2", "Vendedor 3"] as const;

export const demoSalesQuotes: SalesQuote[] = [
  { id: "COT-001", seller: "Vendedor 1", customer: "Comercial Andina", date: "2026-11-03", validUntil: "2026-11-18", status: "En seguimiento", concept: "Licencias CRM para 10 usuarios", amount: 2450000 },
  { id: "COT-002", seller: "Vendedor 1", customer: "Soluciones del Norte", date: "2026-11-06", validUntil: "2026-11-21", status: "En seguimiento", concept: "Implementación de bandeja unificada", amount: 3180000 },
  { id: "COT-003", seller: "Vendedor 1", customer: "Grupo Horizonte", date: "2026-11-10", validUntil: "2026-11-25", status: "Venta realizada", concept: "Configuración de reportes comerciales", amount: 1850000 },
  { id: "COT-004", seller: "Vendedor 1", customer: "Distribuciones Luna", date: "2026-11-14", validUntil: "2026-11-29", status: "Venta rechazada", concept: "Capacitación para equipo de ventas", amount: 980000 },
  { id: "COT-005", seller: "Vendedor 2", customer: "Mercantil del Valle", date: "2026-10-28", validUntil: "2026-11-12", status: "Venta realizada", concept: "Automatización de flujo de ventas", amount: 4200000 },
  { id: "COT-006", seller: "Vendedor 2", customer: "Industrias Roble", date: "2026-11-02", validUntil: "2026-11-17", status: "En seguimiento", concept: "Integración con canal digital", amount: 2750000 },
  { id: "COT-007", seller: "Vendedor 2", customer: "Servicios Prisma", date: "2026-11-08", validUntil: "2026-11-23", status: "En seguimiento", concept: "Licencias CRM para 15 usuarios", amount: 3650000 },
  { id: "COT-008", seller: "Vendedor 2", customer: "Almacenes Central", date: "2026-11-13", validUntil: "2026-11-28", status: "Venta realizada", concept: "Implementación y acompañamiento", amount: 5100000 },
  { id: "COT-009", seller: "Vendedor 3", customer: "Tecnología del Sur", date: "2026-10-25", validUntil: "2026-11-09", status: "Venta rechazada", concept: "Paquete de soporte mensual", amount: 1450000 },
  { id: "COT-010", seller: "Vendedor 3", customer: "Constructora Atlas", date: "2026-11-04", validUntil: "2026-11-19", status: "En seguimiento", concept: "Configuración de catálogo y pipeline", amount: 2250000 },
  { id: "COT-011", seller: "Vendedor 3", customer: "Logística Integral", date: "2026-11-09", validUntil: "2026-11-24", status: "En seguimiento", concept: "Integración con sistema de inventario", amount: 3950000 },
  { id: "COT-012", seller: "Vendedor 3", customer: "Clínica del Parque", date: "2026-11-15", validUntil: "2026-11-30", status: "Venta realizada", concept: "Licencias y onboarding empresarial", amount: 5800000 },
];
