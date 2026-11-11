import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Provider } from "@/domain/integrations";

const channels: { provider: Provider; name: string; detail: string; icon: "facebook" | "instagram" | "mercadolibre" }[] = [
  { provider: "facebook", name: "Facebook", detail: "Mensajes y atención desde tus páginas", icon: "facebook" },
  { provider: "instagram", name: "Instagram", detail: "Conversaciones y consultas de clientes", icon: "instagram" },
  { provider: "mercadolibre", name: "Mercado Libre", detail: "Preguntas, ventas y seguimiento", icon: "mercadolibre" },
];

function ChannelIcon({ icon }: { icon: (typeof channels)[number]["icon"] }) {
  if (icon === "facebook") {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true" className="h-10 w-10">
        <rect width="40" height="40" rx="13" fill="#1877F2" />
        <path fill="white" d="M23.1 33V21.8h3.8l.6-4.4h-4.4v-2.8c0-1.3.4-2.2 2.2-2.2h2.4V8.5c-.4-.1-1.9-.2-3.6-.2-3.6 0-6.1 2.2-6.1 6.3v2.8h-4.1v4.4H18V33h5.1Z" />
      </svg>
    );
  }

  if (icon === "instagram") {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true" className="h-10 w-10">
        <defs><linearGradient id="instagram-gradient" x1="5" y1="36" x2="35" y2="4" gradientUnits="userSpaceOnUse"><stop stopColor="#FFB800" /><stop offset=".48" stopColor="#F03A8A" /><stop offset="1" stopColor="#7048E8" /></linearGradient></defs>
        <rect width="40" height="40" rx="13" fill="url(#instagram-gradient)" />
        <rect x="9" y="9" width="22" height="22" rx="7" fill="none" stroke="white" strokeWidth="2.2" />
        <circle cx="20" cy="20" r="5" fill="none" stroke="white" strokeWidth="2.2" />
        <circle cx="27" cy="13.5" r="1.5" fill="white" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="h-10 w-10">
      <rect width="40" height="40" rx="13" fill="#FFE600" />
      <path d="M7.5 18.4c0-5.3 5.6-9.6 12.5-9.6s12.5 4.3 12.5 9.6c0 5.3-5.6 9.6-12.5 9.6-1.5 0-3-.2-4.3-.6l-5.2 2.4 1.3-5c-2.7-1.7-4.3-3.9-4.3-6.4Z" fill="#fff" stroke="#2d3277" strokeWidth="1.4" />
      <path d="M13 18h14M14.5 22h11" stroke="#2d3277" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function WelcomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 rounded-xl" aria-label="Inicio CRM">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-white shadow-soft dark:bg-blue-500">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                <path d="M4 18V6l8 7 8-7v12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 18v-4m8 4v-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </span>
            <span>
              <span className="block text-sm font-bold tracking-[0.16em] text-slate-900 dark:text-slate-100">CRM</span>
              <span className="block text-xs text-slate-500">Atención unificada</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex">
              Iniciar sesión
            </Link>
          </div>
        </header>

        <section className="relative mt-10 grid items-center gap-12 rounded-[2rem] border border-slate-200/80 bg-white/75 px-6 py-10 shadow-soft backdrop-blur sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-16 dark:border-slate-700 dark:bg-slate-900/70">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/10" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-500/10" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Tu operación, en un solo lugar
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              Una mejor forma de atender a tus clientes.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
              Reúne conversaciones, reclamaciones y métricas de servicio en una experiencia clara para todo tu equipo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-blue-500 dark:hover:bg-blue-400">
                Acceder al CRM
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <a href="#integraciones" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800">
                Conocer los canales
              </a>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex -space-x-2" aria-hidden="true">
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-blue-100 text-xs font-bold text-blue-700 dark:border-slate-900 dark:bg-blue-900 dark:text-blue-200">F</span>
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-pink-100 text-xs font-bold text-pink-700 dark:border-slate-900 dark:bg-pink-900 dark:text-pink-200">I</span>
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-yellow-100 text-xs font-bold text-slate-800 dark:border-slate-900 dark:bg-yellow-800 dark:text-yellow-100">M</span>
              </div>
              <span>Canales actuales y más integraciones en camino</span>
            </div>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-100 via-white to-cyan-100 blur-xl dark:from-blue-950 dark:via-slate-900 dark:to-cyan-950" />
            <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)] sm:p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">VISTA GENERAL</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">Centro de atención</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Demo</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Conversaciones</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Inbox</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Atención centralizada</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/70">
                  <p className="text-xs text-blue-700 dark:text-blue-200">Seguimiento</p>
                  <p className="mt-2 text-2xl font-bold text-blue-950 dark:text-white">Tickets</p>
                  <p className="mt-1 text-xs text-blue-700 dark:text-blue-200">Casos organizados</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Canales conectables</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">3 actuales</span>
                </div>
                <div className="space-y-3">
                  {channels.map((channel) => (
                    <div key={channel.provider} className="flex items-center gap-3">
                      <ChannelIcon icon={channel.icon} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{channel.name}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{channel.detail}</p>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" aria-label="Incluido en el demo" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="integraciones" className="py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">Un espacio para crecer</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">Tus canales, más cerca de tu equipo.</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Comienza con las integraciones actuales y amplía la operación cuando lo necesites.</p>
          </div>
          <div className="mx-auto mt-9 grid max-w-5xl gap-4 md:grid-cols-3">
            {channels.map((channel) => (
              <article key={channel.provider} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-700 dark:bg-slate-900">
                <ChannelIcon icon={channel.icon} />
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{channel.name}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{channel.detail}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">La marca y el nombre definitivo del CRM se definirán más adelante.</p>
        </section>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 py-6 text-sm text-slate-500 sm:flex-row dark:border-slate-700 dark:text-slate-400">
          <span>CRM · Atención y servicio al cliente</span>
          <Link href="/login" className="font-semibold text-slate-700 hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-300">Entrar a mi espacio →</Link>
        </footer>
      </div>
    </main>
  );
}
