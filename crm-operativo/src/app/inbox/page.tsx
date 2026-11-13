"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { SiteNav } from "@/components/site-nav";
import { conversations as fallbackConversations, providerLabels } from "@/domain/integrations";
import { isPagesDemo } from "@/lib/pages-demo";

type Conversation = {
  id: string;
  customer: string;
  channel: "facebook" | "instagram" | "mercadolibre";
  status: "new" | "assigned" | "pending" | "resolved";
  lastMessage: string;
  unread: number;
  updatedAt: string;
};

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>(fallbackConversations);

  useEffect(() => {
    if (isPagesDemo) return;
    async function loadConversations() {
      try {
        const response = await fetch("/api/conversations");
        if (!response.ok) return;
        const payload = await response.json();
        setConversations(payload.data ?? fallbackConversations);
      } catch (error) {
        console.error("No se pudo cargar el inbox", error);
      }
    }

    loadConversations();
  }, []);

  return (
    <AuthGate route="inbox">
      <main className="crm-main mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <SiteNav />
        <header className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-600">Inbox</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Conversaciones activas</h1>
        </header>
        <section className="space-y-4">
          {conversations.map((conversation) => (
            <article key={conversation.id} className="panel flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{conversation.id}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{providerLabels[conversation.channel]}</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-900">{conversation.customer}</h2>
                <p className="mt-1 text-sm text-slate-600">{conversation.lastMessage}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-500">{conversation.updatedAt}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{conversation.status}</p>
                </div>
                <div className="rounded-full bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
                  {conversation.unread} sin leer
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </AuthGate>
  );
}
