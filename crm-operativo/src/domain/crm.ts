export type Channel = "facebook" | "instagram" | "mercadolibre";

export type ConnectionStatus = "online" | "syncing" | "warning" | "offline";

export type Customer = {
  id: string;
  name: string;
  company: string;
  email: string;
  initials: string;
  tone: "mint" | "blue" | "peach" | "lavender";
};

export type Opportunity = {
  id: string;
  name: string;
  customer: string;
  value: string;
  stage: "Calificado" | "Propuesta" | "Negociación";
  probability: number;
};

export type Task = {
  id: string;
  title: string;
  customer: string;
  due: string;
  priority: "Alta" | "Media" | "Baja";
  completed: boolean;
};

export type MetricCard = {
  label: string;
  value: string;
  delta: string;
  tone: "up" | "down" | "neutral";
};

export type ServiceMetric = {
  name: string;
  value: string;
  target: string;
};

export type Claim = {
  id: string;
  customer: string;
  channel: string;
  priority: "alta" | "media" | "baja";
  status: string;
  createdAt: string;
};

export type IntegrationStatus = {
  name: string;
  channel: Channel;
  status: ConnectionStatus;
  messages: string;
  lastSync: string;
};

export const customers: Customer[] = [
  { id: "cus-1", name: "Marina Soler", company: "Nómada Studio", email: "marina@nomada.studio", initials: "MS", tone: "mint" },
  { id: "cus-2", name: "Álvaro Ríos", company: "Río Norte", email: "alvaro@rionorte.es", initials: "AR", tone: "blue" },
  { id: "cus-3", name: "Clara Vidal", company: "Lumen Labs", email: "clara@lumenlabs.co", initials: "CV", tone: "peach" },
  { id: "cus-4", name: "Pablo Costa", company: "Costa & Co.", email: "pablo@costaco.es", initials: "PC", tone: "lavender" },
];

export const opportunities: Opportunity[] = [
  { id: "opp-1", name: "Rediseño de plataforma", customer: "Nómada Studio", value: "€24.000", stage: "Negociación", probability: 80 },
  { id: "opp-2", name: "Operaciones Q4", customer: "Río Norte", value: "€18.500", stage: "Propuesta", probability: 55 },
  { id: "opp-3", name: "Implementación CRM", customer: "Lumen Labs", value: "€12.800", stage: "Calificado", probability: 35 },
];

export const tasks: Task[] = [
  { id: "task-1", title: "Enviar propuesta final", customer: "Nómada Studio", due: "Hoy, 16:30", priority: "Alta", completed: false },
  { id: "task-2", title: "Revisar briefing de Q4", customer: "Río Norte", due: "Mañana, 10:00", priority: "Media", completed: false },
  { id: "task-3", title: "Llamada de descubrimiento", customer: "Lumen Labs", due: "Jueves, 12:00", priority: "Baja", completed: false },
];

export function formatChannelLabel(channel: Channel): string {
  switch (channel) {
    case "facebook":
      return "Facebook";
    case "instagram":
      return "Instagram";
    case "mercadolibre":
      return "Mercado Libre";
    default:
      return "Canal";
  }
}
