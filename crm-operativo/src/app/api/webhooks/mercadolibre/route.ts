import { enqueueWebhookEvent, getWebhookEventId, readWebhookBody } from "@/lib/webhook-ingest";

export async function POST(request: Request) {
  const applicationId = process.env.MERCADOLIBRE_APP_ID;
  if (!applicationId) {
    return Response.json({ ok: false, error: "El webhook de Mercado Libre no está configurado." }, { status: 503 });
  }

  const body = await readWebhookBody(request);
  if (!body.ok) {
    return Response.json({ ok: false, error: body.error }, { status: body.status });
  }

  const resource = body.payload.resource;
  const topic = body.payload.topic;
  if (
    String(body.payload.application_id ?? "") !== applicationId ||
    typeof resource !== "string" ||
    !resource.startsWith("/") ||
    resource.startsWith("//") ||
    resource.includes("..") ||
    typeof topic !== "string" ||
    !/^[a-z0-9_-]+$/i.test(topic)
  ) {
    return Response.json({ ok: false, error: "La notificación no corresponde a la aplicación o no es válida." }, { status: 400 });
  }

  try {
    await enqueueWebhookEvent("mercadolibre", getWebhookEventId("mercadolibre", body.payload, body.rawBody), body.payload);
    return Response.json({ ok: true, status: "queued" }, { status: 200 });
  } catch {
    return Response.json({ ok: false, error: "No se pudo encolar el evento." }, { status: 503 });
  }
}
