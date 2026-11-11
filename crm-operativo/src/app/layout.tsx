import type { Metadata } from "next";
import Script from "next/script";
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
