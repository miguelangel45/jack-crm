"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { CreatedSalesQuote, QuotedProduct } from "@/domain/sales";

type Props = {
  seller: string;
  quoteNumber: number;
  onClose: () => void;
  onCreate: (quote: CreatedSalesQuote) => boolean;
};

type InventoryProduct = Omit<QuotedProduct, "quantity"> & {
  description: string;
  available: number;
};

type CustomerDetails = {
  customerDocument: string;
  contactName: string;
  email: string;
  phone: string;
  observations: string;
};

const demoInventory: InventoryProduct[] = [
  { id: "INV-001", name: "Licencia CRM profesional", description: "Acceso por usuario, facturación mensual", unitPrice: 890000, available: 20 },
  { id: "INV-002", name: "Implementación inicial", description: "Configuración y puesta en marcha", unitPrice: 1250000, available: 8 },
  { id: "INV-003", name: "Capacitación comercial", description: "Sesión virtual para el equipo", unitPrice: 450000, available: 12 },
  { id: "INV-004", name: "Soporte premium", description: "Acompañamiento técnico por un mes", unitPrice: 320000, available: 15 },
];

const emptyCustomerDetails: CustomerDetails = {
  customerDocument: "",
  contactName: "",
  email: "",
  phone: "",
  observations: "",
};

function formatCurrency(value: number) {
  return `$ ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function CreateQuoteDialog({ seller, quoteNumber, onClose, onCreate }: Props) {
  const [step, setStep] = useState<"customer" | "inventory" | "created">("customer");
  const [customer, setCustomer] = useState(emptyCustomerDetails);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<QuotedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createdQuoteId, setCreatedQuoteId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  function continueToInventory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (Object.values(customer).some((value) => !value.trim())) {
      setError("Completa todos los campos obligatorios antes de continuar.");
      return;
    }
    setError(null);
    setStep("inventory");
  }

  function addProduct(product: InventoryProduct) {
    const quantity = Number(quantities[product.id] ?? "1");
    const existingQuantity = products.find((item) => item.id === product.id)?.quantity ?? 0;
    if (!Number.isInteger(quantity) || quantity < 1 || existingQuantity + quantity > product.available) {
      setError(`La cantidad debe estar entre 1 y ${product.available - existingQuantity} para este producto.`);
      return;
    }

    setProducts((current) => {
      const existingProduct = current.find((item) => item.id === product.id);
      if (existingProduct) {
        return current.map((item) => (
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        ));
      }
      return [...current, { id: product.id, name: product.name, quantity, unitPrice: product.unitPrice }];
    });
    setError(null);
  }

  function createQuote() {
    if (products.length === 0) {
      setError("Agrega al menos un producto del inventario.");
      return;
    }

    const date = new Date();
    const validUntil = new Date(date);
    validUntil.setDate(validUntil.getDate() + 15);
    const quoteId = `COT-${String(quoteNumber).padStart(3, "0")}`;
    const quote: CreatedSalesQuote = {
      id: quoteId,
      seller,
      customer: customer.contactName.trim(),
      date: formatLocalDate(date),
      validUntil: formatLocalDate(validUntil),
      status: "En seguimiento",
      concept: products.map((product) => product.name).join(", "),
      amount: products.reduce((total, product) => total + product.unitPrice * product.quantity, 0),
      customerDocument: customer.customerDocument.trim(),
      contactName: customer.contactName.trim(),
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      observations: customer.observations.trim(),
      products,
    };

    if (!onCreate(quote)) {
      setError("No se pudo guardar la cotización. Revisa el almacenamiento del navegador e inténtalo de nuevo.");
      return;
    }

    setCreatedQuoteId(quoteId);
    setError(null);
    setStep("created");
  }

  const total = products.reduce((sum, product) => sum + product.unitPrice * product.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-quote-title"
        tabIndex={-1}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl outline-none"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-600">CRM Operativo · Demo</p>
            <h2 id="create-quote-title" className="mt-1 text-2xl font-semibold text-slate-900">
              {step === "created" ? "Cotización creada" : "Crear cotización"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {step === "customer" && "Paso 1 de 2 · Datos del cliente"}
              {step === "inventory" && "Paso 2 de 2 · Selecciona productos del inventario"}
              {step === "created" && "La cotización quedó guardada en esta sesión de demostración."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cerrar
          </button>
        </header>

        {step === "customer" && (
          <form onSubmit={continueToInventory} className="space-y-5 px-5 py-6 sm:px-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                NIT / CC <span className="text-rose-600" aria-hidden="true">*</span>
                <input
                  required
                  value={customer.customerDocument}
                  onChange={(event) => setCustomer({ ...customer, customerDocument: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  autoComplete="off"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Nombre de contacto <span className="text-rose-600" aria-hidden="true">*</span>
                <input
                  required
                  value={customer.contactName}
                  onChange={(event) => setCustomer({ ...customer, contactName: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  autoComplete="name"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Correo <span className="text-rose-600" aria-hidden="true">*</span>
                <input
                  required
                  type="email"
                  value={customer.email}
                  onChange={(event) => setCustomer({ ...customer, email: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  autoComplete="email"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Teléfono <span className="text-rose-600" aria-hidden="true">*</span>
                <input
                  required
                  type="tel"
                  value={customer.phone}
                  onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  autoComplete="tel"
                />
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Observaciones <span className="text-rose-600" aria-hidden="true">*</span>
              <textarea
                required
                rows={4}
                value={customer.observations}
                onChange={(event) => setCustomer({ ...customer, observations: event.target.value })}
                className="mt-1.5 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Incluye necesidades, condiciones o notas relevantes para la cotización."
              />
            </label>
            {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
            <footer className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row">
              <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancelar
              </button>
              <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                Continuar al inventario
              </button>
            </footer>
          </form>
        )}

        {step === "inventory" && (
          <div className="space-y-6 px-5 py-6 sm:px-7">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold">{customer.contactName}</p>
              <p className="mt-1">{customer.customerDocument} · {customer.email} · {customer.phone}</p>
              <p className="mt-2 text-slate-600">{customer.observations}</p>
            </div>
            <section aria-labelledby="demo-inventory-title">
              <div className="mb-3">
                <h3 id="demo-inventory-title" className="font-semibold text-slate-900">Inventario disponible</h3>
                <p className="mt-1 text-xs text-slate-500">Productos y existencias ficticios para esta demostración.</p>
              </div>
              <div className="space-y-3">
                {demoInventory.map((product) => {
                  const inCart = products.find((item) => item.id === product.id)?.quantity ?? 0;
                  return (
                    <article key={product.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-slate-900">{product.name}</h4>
                        <p className="mt-1 text-sm text-slate-600">{product.description}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-800">{formatCurrency(product.unitPrice)} <span className="font-normal text-slate-500">· {product.available - inCart} disponibles</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="sr-only" htmlFor={`inventory-quantity-${product.id}`}>Cantidad de {product.name}</label>
                        <input
                          id={`inventory-quantity-${product.id}`}
                          type="number"
                          min="1"
                          max={product.available - inCart}
                          step="1"
                          value={quantities[product.id] ?? "1"}
                          onChange={(event) => setQuantities({ ...quantities, [product.id]: event.target.value })}
                          className="w-20 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                        />
                        <button
                          type="button"
                          disabled={inCart >= product.available}
                          onClick={() => addProduct(product)}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Agregar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-4" aria-labelledby="quote-cart-title">
              <h3 id="quote-cart-title" className="font-semibold text-slate-900">Productos de la cotización</h3>
              {products.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">Aún no has agregado productos.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {products.map((product) => (
                    <li key={product.id} className="flex items-center gap-3 py-2 text-sm">
                      <span className="min-w-0 flex-1">{product.name} × {product.quantity}</span>
                      <span className="font-medium">{formatCurrency(product.unitPrice * product.quantity)}</span>
                      <button
                        type="button"
                        onClick={() => setProducts((current) => current.filter((item) => item.id !== product.id))}
                        className="text-rose-700 hover:underline"
                        aria-label={`Quitar ${product.name}`}
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-semibold text-slate-900">
                <span>Total estimado</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </section>
            {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
            <footer className="flex flex-col-reverse justify-between gap-2 border-t border-slate-100 pt-4 sm:flex-row">
              <button type="button" onClick={() => { setError(null); setStep("customer"); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Volver a los datos
              </button>
              <button type="button" onClick={createQuote} disabled={products.length === 0} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                Crear cotización
              </button>
            </footer>
          </div>
        )}

        {step === "created" && (
          <div className="px-5 py-8 text-center sm:px-7">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700" aria-hidden="true">✓</div>
            <p className="mt-4 text-lg font-semibold text-slate-900">{createdQuoteId}</p>
            <p className="mt-2 text-sm text-slate-600">
              Se creó para {customer.contactName} por {formatCurrency(total)}. La cotización ya está disponible en tus cotizaciones recientes.
            </p>
            <button type="button" onClick={onClose} className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              Volver al espacio de trabajo
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
