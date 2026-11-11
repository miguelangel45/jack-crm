import {
  conversations as fallbackConversations,
  integrationConnections as fallbackIntegrations,
  tickets as fallbackTickets,
  type Conversation,
  type IntegrationConnection,
  type Ticket,
} from "@/domain/integrations";
import { getServiceSupabaseClient, isServiceSupabaseConfigured } from "@/lib/db";

function toOptionalString(value: unknown) {
  return value == null ? "" : String(value);
}

export async function listIntegrations(): Promise<IntegrationConnection[]> {
  if (!isServiceSupabaseConfigured()) {
    return fallbackIntegrations;
  }

  const client = await getServiceSupabaseClient();
  const { data, error } = await client.from("crm_integrations").select("*").order("created_at", { ascending: false });

  if (error || !data) {
    return fallbackIntegrations;
  }

  return (data as Array<Record<string, unknown>>).map((row) => ({
    id: toOptionalString(row.id),
    provider: String(row.provider ?? "facebook") as IntegrationConnection["provider"],
    channel: String(row.provider ?? "facebook") as IntegrationConnection["provider"],
    name: toOptionalString(row.name),
    status: String(row.status ?? "online") as IntegrationConnection["status"],
    messages: toOptionalString(row.messages),
    lastSync: toOptionalString(row.last_sync),
    accountName: toOptionalString(row.account_name),
    enabled: row.enabled === true,
  }));
}

export async function listConversations(): Promise<Conversation[]> {
  if (!isServiceSupabaseConfigured()) {
    return fallbackConversations;
  }

  const client = await getServiceSupabaseClient();
  const { data, error } = await client.from("crm_conversations").select("*").order("created_at", { ascending: false });

  if (error || !data) {
    return fallbackConversations;
  }

  return (data as Array<Record<string, unknown>>).map((row) => ({
    id: toOptionalString(row.id),
    customer: toOptionalString(row.customer),
    channel: String(row.channel ?? "facebook") as Conversation["channel"],
    status: (String(row.status ?? "new") as Conversation["status"]),
    lastMessage: toOptionalString(row.last_message),
    unread: Number(row.unread ?? 0),
    updatedAt: toOptionalString(row.updated_at),
  }));
}

export async function listTickets(): Promise<Ticket[]> {
  if (!isServiceSupabaseConfigured()) {
    return fallbackTickets;
  }

  const client = await getServiceSupabaseClient();
  const { data, error } = await client.from("crm_tickets").select("*").order("created_at_ts", { ascending: false });

  if (error || !data) {
    return fallbackTickets;
  }

  return (data as Array<Record<string, unknown>>).map((row) => ({
    id: toOptionalString(row.id),
    customer: toOptionalString(row.customer),
    channel: String(row.channel ?? "facebook") as Ticket["channel"],
    priority: String(row.priority ?? "media") as Ticket["priority"],
    status: toOptionalString(row.status) as Ticket["status"],
    createdAt: toOptionalString(row.created_at),
    claimType: toOptionalString(row.claim_type) as Ticket["claimType"],
  }));
}
