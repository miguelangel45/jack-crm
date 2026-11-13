import type { Metadata } from "next";
import Script from "next/script";
import { isPagesDemo } from "@/lib/pages-demo";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM Operativo",
  description: "CRM para soportar Facebook, Instagram y Mercado Libre con métricas de servicio y reclamaciones.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try { if (localStorage.getItem("crm-theme") === "dark") document.documentElement.classList.add("dark"); } catch {}`}
        </Script>
      </head>
      <body className="antialiased">
        {isPagesDemo && (
          <div className="bg-[var(--accent)] px-4 py-2 text-center text-xs font-medium text-white">
            Vista pública de demostración · Datos de ejemplo · Las funciones de servidor no están disponibles aquí
            {process.env.NEXT_PUBLIC_SOURCE_SHA && (
              <a className="ml-2 underline" href={`https://github.com/miguelangel45/jack-crm/commit/${process.env.NEXT_PUBLIC_SOURCE_SHA}`}>
                Versión {process.env.NEXT_PUBLIC_SOURCE_SHA.slice(0, 7)}
              </a>
            )}
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
