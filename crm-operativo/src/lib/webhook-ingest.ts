import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getServiceSupabaseClient, type DatabaseType } from "@/lib/db";

export type WebhookProvider = "meta" | "mercadolibre";
export const MAX_WEBHOOK_BODY_BYTES = 1024 * 1024;

export type ParsedWebhookBody =
  | { ok: true; rawBody: string; payload: Record<string, unknown> }
  | { ok: false; status: 400 | 413; error: string };

export async function readWebhookBody(request: Request): Promise<ParsedWebhookBody> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_WEBHOOK_BODY_BYTES) {
    return { ok: false, status: 413, error: "El webhook excede el tamaño permitido." };
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_WEBHOOK_BODY_BYTES) {
    return { ok: false, status: 413, error: "El webhook excede el tamaño permitido." };
  }

  try {
    const payload: unknown = JSON.parse(rawBody);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return { ok: false, status: 400, error: "El cuerpo debe ser un objeto JSON." };
    }

    return { ok: true, rawBody, payload: payload as Record<string, unknown> };
  } catch {
    return { ok: false, status: 400, error: "El cuerpo no contiene JSON válido." };
  }
}

export function verifyMetaSignature(rawBody: string, signature: string | null, appSecret: string) {
  if (!signature || !/^sha256=[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest();
  const received = Buffer.from(signature.slice("sha256=".length), "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export function getWebhookEventId(provider: WebhookProvider, payload: Record<string, unknown>, rawBody: string) {
  if (provider === "mercadolibre") {
    const externalId = payload.id ?? payload._id;
    if ((typeof externalId === "string" || typeof externalId === "number") && String(externalId).trim()) {
      return String(externalId);
    }
  }

  return createHash("sha256").update(rawBody, "utf8").digest("hex");
}

export async function enqueueWebhookEvent(
  provider: WebhookProvider,
  eventId: string,
  payload: Record<string, unknown>,
) {
  const client = await getServiceSupabaseClient();
  const { error } = await client.from("crm_webhook_events").upsert(
    {
      provider,
      event_id: eventId,
      payload: payload as DatabaseType["public"]["Tables"]["crm_webhook_events"]["Insert"]["payload"],
      status: "pending",
    },
    { onConflict: "provider,event_id", ignoreDuplicates: true },
  );

  if (error) {
    throw new Error("No se pudo guardar el evento del webhook.");
  }
}
