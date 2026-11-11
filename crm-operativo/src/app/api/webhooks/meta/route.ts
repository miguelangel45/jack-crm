import { enqueueWebhookEvent, getWebhookEventId, readWebhookBody, verifyMetaSignature } from "@/lib/webhook-ingest";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken || mode !== "subscribe" || token !== verifyToken || !challenge) {
    return new Response("Forbidden", { status: 403 });
  }

  return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
}

export async function POST(request: Request) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    return Response.json({ ok: false, error: "El webhook de Meta no está configurado." }, { status: 503 });
  }

  const body = await readWebhookBody(request);
  if (!body.ok) {
    return Response.json({ ok: false, error: body.error }, { status: body.status });
  }

  if (!verifyMetaSignature(body.rawBody, request.headers.get("x-hub-signature-256"), appSecret)) {
    return Response.json({ ok: false, error: "Firma de Meta no válida." }, { status: 401 });
  }

  try {
    await enqueueWebhookEvent("meta", getWebhookEventId("meta", body.payload, body.rawBody), body.payload);
    return Response.json({ ok: true, status: "queued" }, { status: 200 });
  } catch {
    return Response.json({ ok: false, error: "No se pudo encolar el evento." }, { status: 503 });
  }
}
