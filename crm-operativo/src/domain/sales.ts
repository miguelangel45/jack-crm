export type QuoteStatus = "En seguimiento" | "Venta realizada" | "Venta rechazada";

export type SalesQuote = {
  id: string;
  seller: string;
  customer: string;
  date: string;
  status: QuoteStatus;
};

export const salesSellers = ["Vendedor 1", "Vendedor 2", "Vendedor 3"] as const;

export const demoSalesQuotes: SalesQuote[] = [
  { id: "COT-001", seller: "Vendedor 1", customer: "Comercial Andina", date: "2026-11-03", status: "En seguimiento" },
  { id: "COT-002", seller: "Vendedor 1", customer: "Soluciones del Norte", date: "2026-11-06", status: "En seguimiento" },
  { id: "COT-003", seller: "Vendedor 1", customer: "Grupo Horizonte", date: "2026-11-10", status: "Venta realizada" },
  { id: "COT-004", seller: "Vendedor 1", customer: "Distribuciones Luna", date: "2026-11-14", status: "Venta rechazada" },
  { id: "COT-005", seller: "Vendedor 2", customer: "Mercantil del Valle", date: "2026-10-28", status: "Venta realizada" },
  { id: "COT-006", seller: "Vendedor 2", customer: "Industrias Roble", date: "2026-11-02", status: "En seguimiento" },
  { id: "COT-007", seller: "Vendedor 2", customer: "Servicios Prisma", date: "2026-11-08", status: "En seguimiento" },
  { id: "COT-008", seller: "Vendedor 2", customer: "Almacenes Central", date: "2026-11-13", status: "Venta realizada" },
  { id: "COT-009", seller: "Vendedor 3", customer: "Tecnología del Sur", date: "2026-10-25", status: "Venta rechazada" },
  { id: "COT-010", seller: "Vendedor 3", customer: "Constructora Atlas", date: "2026-11-04", status: "En seguimiento" },
  { id: "COT-011", seller: "Vendedor 3", customer: "Logística Integral", date: "2026-11-09", status: "En seguimiento" },
  { id: "COT-012", seller: "Vendedor 3", customer: "Clínica del Parque", date: "2026-11-15", status: "Venta realizada" },
];
