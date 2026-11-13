import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Provider } from "@/domain/integrations";
import { isPagesDemo } from "@/lib/pages-demo";

const channels: { provider: Provider; name: string; detail: string; icon: "facebook" | "instagram" | "mercadolibre" }[] = [
  { provider: "facebook", name: "Facebook", detail: "Mensajes y atención desde tus páginas", icon: "facebook" },
  { provider: "instagram", name: "Instagram", detail: "Conversaciones y consultas de clientes", icon: "instagram" },
  { provider: "mercadolibre", name: "Mercado Libre", detail: "Preguntas, ventas y seguimiento", icon: "mercadolibre" },
];

function ChannelIcon({ icon, className = "h-10 w-10" }: { icon: (typeof channels)[number]["icon"]; className?: string }) {
  if (icon === "facebook") {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
        <rect width="40" height="40" rx="13" fill="#1877F2" />
        <path fill="white" d="M23.1 33V21.8h3.8l.6-4.4h-4.4v-2.8c0-1.3.4-2.2 2.2-2.2h2.4V8.5c-.4-.1-1.9-.2-3.6-.2-3.6 0-6.1 2.2-6.1 6.3v2.8h-4.1v4.4H18V33h5.1Z" />
      </svg>
    );
  }

  if (icon === "instagram") {
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
        <defs><linearGradient id="instagram-gradient" x1="5" y1="36" x2="35" y2="4" gradientUnits="userSpaceOnUse"><stop stopColor="#FFB800" /><stop offset=".48" stopColor="#F03A8A" /><stop offset="1" stopColor="#7048E8" /></linearGradient></defs>
        <rect width="40" height="40" rx="13" fill="url(#instagram-gradient)" />
        <rect x="9" y="9" width="22" height="22" rx="7" fill="none" stroke="white" strokeWidth="2.2" />
        <circle cx="20" cy="20" r="5" fill="none" stroke="white" strokeWidth="2.2" />
        <circle cx="27" cy="13.5" r="1.5" fill="white" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <rect width="40" height="40" rx="13" fill="#FFE600" />
      <path d="M7.5 18.4c0-5.3 5.6-9.6 12.5-9.6s12.5 4.3 12.5 9.6c0 5.3-5.6 9.6-12.5 9.6-1.5 0-3-.2-4.3-.6l-5.2 2.4 1.3-5c-2.7-1.7-4.3-3.9-4.3-6.4Z" fill="#fff" stroke="#2d3277" strokeWidth="1.4" />
      <path d="M13 18h14M14.5 22h11" stroke="#2d3277" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function WelcomePage() {
  return (
    <main className="welcome-page min-h-screen overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 rounded-xl" aria-label="Inicio CRM">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--welcome-logo-background)] text-white shadow-soft">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                <path d="M4 18V6l8 7 8-7v12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 18v-4m8 4v-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </span>
            <span>
              <span className="block text-sm font-bold tracking-[0.16em] text-[var(--welcome-text)]">CRM</span>
              <span className="block text-xs text-[var(--welcome-secondary)]">Atención unificada</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <nav aria-label="Navegación principal">
              <div className="group relative">
                <Link
                  href="#integraciones"
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--welcome-secondary)] transition hover:bg-[var(--welcome-muted)] hover:text-[var(--welcome-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--welcome-accent)]"
                >
                  Integraciones
                  <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180">
                    <path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                  </svg>
                </Link>
                <div className="invisible absolute right-0 top-full z-30 w-72 translate-y-2 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <ul className="overflow-hidden rounded-2xl border border-[var(--welcome-border)] bg-[var(--welcome-card)] p-2 shadow-xl shadow-[var(--welcome-shadow)]">
                    {channels.map((channel) => (
                      <li key={channel.provider}>
                        <a
                          href={`#integracion-${channel.provider}`}
                          className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-[var(--welcome-muted)] focus-visible:bg-[var(--welcome-muted)] focus-visible:outline-none"
                        >
                          <ChannelIcon icon={channel.icon} className="h-8 w-8 shrink-0" />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-[var(--welcome-text)]">{channel.name}</span>
                            <span className="block truncate text-xs text-[var(--welcome-secondary)]">{channel.detail}</span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </nav>
            <ThemeToggle />
            <Link href={isPagesDemo ? "/dashboard" : "/login"} className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--welcome-secondary)] transition hover:bg-[var(--welcome-muted)] sm:inline-flex">
              {isPagesDemo ? "Explorar demo" : "Iniciar sesión"}
            </Link>
          </div>
        </header>

        <section className="relative mt-10 grid items-center gap-12 rounded-[2rem] border border-[var(--welcome-border)] bg-[var(--welcome-card)] px-6 py-10 shadow-soft backdrop-blur sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-16">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[var(--welcome-glow)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[var(--welcome-glow)] blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--welcome-border)] bg-[var(--welcome-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--welcome-secondary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--welcome-champagne)]" />
              Tu operación, en un solo lugar
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-[var(--welcome-text)] sm:text-5xl lg:text-6xl">
              Una mejor forma de atender a tus clientes.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--welcome-secondary)] sm:text-lg">
              Reúne conversaciones, reclamaciones y métricas de servicio en una experiencia clara para todo tu equipo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={isPagesDemo ? "/dashboard" : "/login"} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--welcome-accent)] px-5 py-3 text-sm font-semibold text-[var(--welcome-accent-foreground)] shadow-lg shadow-[var(--welcome-shadow)] transition hover:-translate-y-0.5 hover:brightness-95">
                {isPagesDemo ? "Explorar demo" : "Acceder al CRM"}
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
              <a href="#integraciones" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--welcome-border)] bg-[var(--welcome-card)] px-5 py-3 text-sm font-semibold text-[var(--welcome-secondary)] transition hover:bg-[var(--welcome-muted)]">
                Conocer los canales
              </a>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-[var(--welcome-secondary)]">
              <div className="flex -space-x-2" aria-hidden="true">
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[var(--welcome-card)] bg-[var(--welcome-muted)] text-xs font-bold text-[var(--welcome-text)]">F</span>
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[var(--welcome-card)] bg-[var(--welcome-muted)] text-xs font-bold text-[var(--welcome-text)]">I</span>
                <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[var(--welcome-card)] bg-[var(--welcome-muted)] text-xs font-bold text-[var(--welcome-text)]">M</span>
              </div>
              <span>Canales actuales y más integraciones en camino</span>
            </div>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] bg-[var(--welcome-glow)] blur-xl" />
            <div className="relative rounded-3xl border border-[var(--welcome-border)] bg-[var(--welcome-card)] p-5 shadow-[var(--welcome-shadow)] sm:p-6">
              <div className="flex items-center justify-between border-b border-[var(--welcome-border)] pb-4">
                <div>
                  <p className="text-xs font-medium tracking-[0.12em] text-[var(--welcome-secondary)]">VISTA GENERAL</p>
                  <h2 className="mt-1 text-lg font-bold text-[var(--welcome-text)]">Centro de atención</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Demo</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[var(--welcome-muted)] p-3">
                  <p className="text-[11px] text-[var(--welcome-secondary)]">Conversaciones</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--welcome-accent)]">Inbox</p>
                  <p className="mt-1 text-xs leading-4 text-[var(--welcome-secondary)]">Atención centralizada</p>
                </div>
                <div className="rounded-2xl border border-[var(--welcome-border)] bg-[var(--welcome-card)] p-3">
                  <p className="text-[11px] text-[var(--welcome-secondary)]">Seguimiento</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--welcome-accent)]">Tickets</p>
                  <p className="mt-1 text-xs leading-4 text-[var(--welcome-secondary)]">Casos organizados</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="integraciones" className="py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--welcome-accent)]">Un espacio para crecer</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--welcome-text)] sm:text-4xl">Tus canales, más cerca de tu equipo.</h2>
            <p className="mt-4 text-[var(--welcome-secondary)]">Comienza con las integraciones actuales y amplía la operación cuando lo necesites.</p>
          </div>
          <div className="mx-auto mt-9 grid max-w-5xl gap-4 md:grid-cols-3">
            {channels.map((channel) => (
              <article id={`integracion-${channel.provider}`} key={channel.provider} className="scroll-mt-6 rounded-2xl border border-[var(--welcome-border)] bg-[var(--welcome-card)] p-5 transition hover:-translate-y-1 hover:shadow-soft">
                <ChannelIcon icon={channel.icon} />
                <h3 className="mt-4 text-base font-bold text-[var(--welcome-text)]">{channel.name}</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--welcome-secondary)]">{channel.detail}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-[var(--welcome-secondary)]">La marca y el nombre definitivo del CRM se definirán más adelante.</p>
        </section>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-[var(--welcome-border)] py-6 text-sm text-[var(--welcome-secondary)] sm:flex-row">
          <span>CRM · Atención y servicio al cliente</span>
          <Link href={isPagesDemo ? "/dashboard" : "/login"} className="font-semibold text-[var(--welcome-text)] hover:text-[var(--welcome-accent)]">{isPagesDemo ? "Explorar demo →" : "Entrar a mi espacio →"}</Link>
        </footer>
      </div>
    </main>
  );
}
