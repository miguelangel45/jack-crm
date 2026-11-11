"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo iniciar sesión.");
      }

      const now = Date.now();
      const session = {
        username: payload.user?.username ?? username,
        email: payload.user?.email ?? "",
        role: payload.user?.role ?? "admin",
        name: payload.user?.user_metadata?.name ?? "Usuario",
        lastActivity: now,
        expiresAt: now + 5 * 60 * 1000,
      };

      localStorage.setItem("crm-session", JSON.stringify(session));
      setFeedback("Sesión iniciada correctamente. Puedes navegar al dashboard.");
      window.location.href = "/dashboard";
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Error de autenticación");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="fixed right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">CRM</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Inicia sesión</h1>
            <p className="mt-2 text-sm text-slate-600">Accede con tu cuenta según el rol del administrador.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Usuario alfanumérico</span>
                <input
                  type="text"
                  pattern="[A-Za-z0-9]{8,}"
                  minLength={8}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-brand-500"
                  placeholder="adminCRM01"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Contraseña</span>
                <input
                  type="password"
                  pattern="[A-Za-z0-9]{8,}"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-brand-500"
                  placeholder="••••••••"
                />
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Iniciando sesión..." : "Entrar al CRM"}
              </button>
            </form>

            {feedback && (
              <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {feedback}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-brand-600">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2Zm10-11V7a4 4 0 0 0-8 0v4h8Z" />
              </svg>
            </div>
            <h2 className="mt-4 text-sm font-semibold text-slate-800">Acceso protegido</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Usa las credenciales asignadas por el administrador de tu organización. Si no tienes acceso, solicita una invitación.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
