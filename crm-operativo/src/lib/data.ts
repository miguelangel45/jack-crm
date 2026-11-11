import type { Claim, IntegrationStatus, MetricCard, ServiceMetric } from "@/domain/crm";

export const metrics: MetricCard[] = [
  { label: "Tiempo de primera respuesta", value: "2h 18m", delta: "+12% vs semana pasada", tone: "up" },
  { label: "Tiempo medio de resolución", value: "18h 42m", delta: "-8% vs semana pasada", tone: "down" },
  { label: "Satisfacción del cliente", value: "94.6%", delta: "+2.1 pts", tone: "up" },
  { label: "Reclamos abiertos", value: "16", delta: "5 críticos", tone: "neutral" },
];

export const serviceMetrics: ServiceMetric[] = [
  { name: "SLA cumplido", value: "91%", target: "95%" },
  { name: "Tickets reabiertos", value: "6.4%", target: "<5%" },
  { name: "Inbox activo", value: "2.4k", target: "2.8k" },
  { name: "Conversaciones sin respuesta", value: "7.2%", target: "<5%" },
];

export const integrations: IntegrationStatus[] = [
  { name: "Facebook", channel: "facebook", status: "online", messages: "1.330 mensajes", lastSync: "Hace 2 minutos" },
  { name: "Instagram", channel: "instagram", status: "syncing", messages: "842 mensajes", lastSync: "Sincronizando" },
  { name: "Mercado Libre", channel: "mercadolibre", status: "warning", messages: "368 mensajes", lastSync: "Hace 18 minutos" },
];

export const claims: Claim[] = [
  { id: "CL-1042", customer: "Marta Gálvez", channel: "Facebook", priority: "alta", status: "Pendiente de resolución", createdAt: "Hace 5h" },
  { id: "CL-1039", customer: "Helena Rivas", channel: "Instagram", priority: "media", status: "Revisión de reembolso", createdAt: "Hace 9h" },
  { id: "CL-1028", customer: "Javier León", channel: "Mercado Libre", priority: "alta", status: "Esperando proveedor", createdAt: "Hace 12h" },
  { id: "CL-1017", customer: "Lucía Torres", channel: "Facebook", priority: "baja", status: "Cerrado", createdAt: "Hace 1 día" },
];
