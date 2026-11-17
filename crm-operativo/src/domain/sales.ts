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
  saleDate?: string;
};

export type SalesQuoteStatusUpdate = {
  status: QuoteStatus;
  changedAt: string;
};

export type QuotedProduct = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type CreatedSalesQuote = SalesQuote & {
  customerDocument: string;
  contactName: string;
  email: string;
  phone: string;
  observations: string;
  products: QuotedProduct[];
};

export const CREATED_SALES_QUOTES_STORAGE_KEY = "crm-created-sales-quotes";
export const SALES_QUOTE_STATUS_STORAGE_KEY = "crm-sales-quote-statuses";
export const MONTHLY_SALES_BUDGET_PER_SELLER = 15_000_000;

export const salesSellers = ["Vendedor 1", "Vendedor 2", "Vendedor 3"] as const;

const salesSellerByUsername: Record<string, (typeof salesSellers)[number]> = {
  agentcrm01: salesSellers[0],
  agentcrm02: salesSellers[1],
  agentcrm03: salesSellers[2],
};

export function getSalesSellerForUser(username: string, name: string) {
  return salesSellerByUsername[username.trim().toLowerCase()]
    ?? salesSellers.find((seller) => seller.toLowerCase() === name.trim().toLowerCase())
    ?? null;
}

function isQuoteStatus(value: unknown): value is QuoteStatus {
  return value === "En seguimiento" || value === "Venta realizada" || value === "Venta rechazada";
}

function isCreatedSalesQuote(value: unknown): value is CreatedSalesQuote {
  if (!value || typeof value !== "object") return false;

  const quote = value as Record<string, unknown>;
  const products = quote.products;
  return typeof quote.id === "string"
    && typeof quote.seller === "string"
    && typeof quote.customer === "string"
    && typeof quote.date === "string"
    && typeof quote.validUntil === "string"
    && isQuoteStatus(quote.status)
    && typeof quote.concept === "string"
    && typeof quote.amount === "number"
    && typeof quote.customerDocument === "string"
    && typeof quote.contactName === "string"
    && typeof quote.email === "string"
    && typeof quote.phone === "string"
    && typeof quote.observations === "string"
    && Array.isArray(products)
    && products.every((product: unknown) => {
      if (!product || typeof product !== "object") return false;
      const item = product as Record<string, unknown>;
      return typeof item.id === "string"
        && typeof item.name === "string"
        && typeof item.quantity === "number"
        && typeof item.unitPrice === "number";
    });
}

export function readCreatedSalesQuotes(): CreatedSalesQuote[] {
  if (typeof window === "undefined") return [];

  try {
    const storedQuotes = window.sessionStorage.getItem(CREATED_SALES_QUOTES_STORAGE_KEY);
    if (!storedQuotes) return [];

    const parsed: unknown = JSON.parse(storedQuotes);
    if (!Array.isArray(parsed) || !parsed.every(isCreatedSalesQuote)) {
      throw new Error("El formato de las cotizaciones guardadas no es válido.");
    }

    return parsed;
  } catch (error) {
    console.error("No se pudieron leer las cotizaciones creadas en esta sesión.", error);
    return [];
  }
}

export function addCreatedSalesQuote(quote: CreatedSalesQuote): boolean {
  if (typeof window === "undefined") {
    console.error("No se puede guardar una cotización fuera del navegador.");
    return false;
  }

  try {
    window.sessionStorage.setItem(
      CREATED_SALES_QUOTES_STORAGE_KEY,
      JSON.stringify([...readCreatedSalesQuotes(), quote]),
    );
    return true;
  } catch (error) {
    console.error("No se pudo guardar la cotización en esta sesión.", error);
    return false;
  }
}

export function readSalesQuoteStatusUpdates(): Record<string, SalesQuoteStatusUpdate> {
  if (typeof window === "undefined") return {};

  try {
    const storedUpdates = window.sessionStorage.getItem(SALES_QUOTE_STATUS_STORAGE_KEY);
    if (!storedUpdates) return {};

    const parsed: unknown = JSON.parse(storedUpdates);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("El formato de estados de cotización guardados no es válido.");
    }

    const updates: Record<string, SalesQuoteStatusUpdate> = {};
    for (const [quoteId, value] of Object.entries(parsed)) {
      if (!quoteId || !value || typeof value !== "object") {
        throw new Error("El formato de estados de cotización guardados no es válido.");
      }
      const update = value as Record<string, unknown>;
      if (!isQuoteStatus(update.status) || typeof update.changedAt !== "string") {
        throw new Error("El formato de estados de cotización guardados no es válido.");
      }
      updates[quoteId] = { status: update.status, changedAt: update.changedAt };
    }
    return updates;
  } catch (error) {
    console.error("No se pudieron leer los estados de las cotizaciones.", error);
    return {};
  }
}

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function updateSalesQuoteStatus(quoteId: string, status: QuoteStatus, changedAt = formatLocalDate(new Date())): boolean {
  if (typeof window === "undefined") {
    console.error("No se puede actualizar una cotización fuera del navegador.");
    return false;
  }

  try {
    window.sessionStorage.setItem(
      SALES_QUOTE_STATUS_STORAGE_KEY,
      JSON.stringify({ ...readSalesQuoteStatusUpdates(), [quoteId]: { status, changedAt } }),
    );
    return true;
  } catch (error) {
    console.error("No se pudo guardar el estado de la cotización.", error);
    return false;
  }
}

export function applySalesQuoteStatusUpdates(
  quotes: SalesQuote[],
  updates: Record<string, SalesQuoteStatusUpdate>,
): SalesQuote[] {
  return quotes.map((quote) => {
    const update = updates[quote.id];
    if (!update) return quote;
    return {
      ...quote,
      status: update.status,
      saleDate: update.status === "Venta realizada" ? update.changedAt : undefined,
    };
  });
}

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
