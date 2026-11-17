"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DASHBOARD_VIEW_STORAGE_KEY, dashboardViewOptions, type DashboardView } from "@/lib/dashboard-view";

export function DashboardViewMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  function selectView(view: DashboardView) {
    try {
      sessionStorage.setItem(DASHBOARD_VIEW_STORAGE_KEY, view);
    } catch (error) {
      console.error("No se pudo guardar el modo de vista seleccionado.", error);
      setStorageError("No se pudo guardar la vista seleccionada. Inténtalo de nuevo.");
      return;
    }

    setStorageError(null);
    setIsOpen(false);
    router.push("/dashboard");
  }

  return (
    <div
      className="group relative"
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="dashboard-view-options"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--welcome-secondary)] transition hover:bg-[var(--welcome-muted)] hover:text-[var(--welcome-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--welcome-accent)]"
      >
        Modos de vista
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        </svg>
      </button>
      {isOpen && (
        <div
          id="dashboard-view-options"
          role="group"
          aria-label="Modos de vista"
          className="absolute right-0 top-full z-30 w-72 translate-y-2 rounded-2xl border border-[var(--welcome-border)] bg-[var(--welcome-card)] p-2 shadow-xl shadow-[var(--welcome-shadow)]"
        >
          {dashboardViewOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => selectView(option.id)}
              className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[var(--welcome-text)] transition hover:bg-[var(--welcome-muted)] focus-visible:bg-[var(--welcome-muted)] focus-visible:outline-none"
            >
              {option.label}
            </button>
          ))}
          {storageError && <p role="alert" className="px-3 py-2 text-xs text-rose-700">{storageError}</p>}
        </div>
      )}
    </div>
  );
}
