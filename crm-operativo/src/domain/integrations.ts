export type Provider = "facebook" | "instagram" | "mercadolibre";
export type ConnectionStatus = "online" | "syncing" | "warning" | "error";
export type ClaimPriority = "alta" | "media" | "baja";
export type ClaimStatus = "Nuevo" | "En revisión" | "Reembolso" | "Resuelto";

export interface IntegrationConnection {
  id: string;
  provider: Provider;
  channel?: Provider;
  name: string;
  status: ConnectionStatus;
  messages?: string;
  lastSync: string;
  accountName: string;
  enabled: boolean;
}

export interface Conversation {
  id: string;
  customer: string;
  channel: Provider;
  status: "new" | "assigned" | "pending" | "resolved";
  lastMessage: string;
  unread: number;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  customer: string;
  channel: Provider;
  priority: ClaimPriority;
  status: ClaimStatus;
  createdAt: string;
  claimType: "reembolso" | "pedido" | "consulta" | "incidencia";
}

export const providerLabels: Record<Provider, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  mercadolibre: "Mercado Libre",
};

export const integrationConnections: IntegrationConnection[] = [
  {
    id: "int-meta-pages",
    provider: "facebook",
    channel: "facebook",
    name: "Meta Pages",
    status: "online",
    messages: "1.330 mensajes",
    lastSync: "Hace 2 minutos",
    accountName: "Tienda Central",
    enabled: true,
  },
  {
    id: "int-meta-instagram",
    provider: "instagram",
    channel: "instagram",
    name: "Instagram DM",
    status: "syncing",
    messages: "842 mensajes",
    lastSync: "Sincronizando",
    accountName: "@tienda.central",
    enabled: true,
  },
  {
    id: "int-ml-orders",
    provider: "mercadolibre",
    channel: "mercadolibre",
    name: "Mercado Libre Orders",
    status: "warning",
    messages: "368 mensajes",
    lastSync: "Hace 18 minutos",
    accountName: "Cuenta ML - 2026",
    enabled: true,
  },
];

export const conversations: Conversation[] = [
  {
    id: "CNV-20260001",
    customer: "Marta Gálvez",
    channel: "facebook",
    status: "pending",
    lastMessage: "Solicito información sobre el reembolso del pedido 2310",
    unread: 3,
    updatedAt: "Hace 6 min",
  },
  {
    id: "CNV-20260002",
    customer: "Helena Rivas",
    channel: "instagram",
    status: "assigned",
    lastMessage: "El paquete llegó tarde y el estado no coincide con el tracking",
    unread: 1,
    updatedAt: "Hace 18 min",
  },
  {
    id: "CNV-20260003",
    customer: "Javier León",
    channel: "mercadolibre",
    status: "new",
    lastMessage: "Pregunta por la entrega del pedido #ML-8902",
    unread: 5,
    updatedAt: "Hace 23 min",
  },
];

export const tickets: Ticket[] = [
  {
    id: "20260001",
    customer: "Marta Gálvez",
    channel: "facebook",
    priority: "alta",
    status: "Reembolso",
    createdAt: "Hace 5h",
    claimType: "reembolso",
  },
  {
    id: "20260002",
    customer: "Helena Rivas",
    channel: "instagram",
    priority: "media",
    status: "En revisión",
    createdAt: "Hace 9h",
    claimType: "incidencia",
  },
  {
    id: "20260003",
    customer: "Javier León",
    channel: "mercadolibre",
    priority: "alta",
    status: "Nuevo",
    createdAt: "Hace 12h",
    claimType: "pedido",
  },
];
