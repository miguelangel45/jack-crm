import { listTickets } from "@/lib/crm-data";
import { generateProcessId, generateUniqueTicketId } from "@/lib/ticket-id";
import { requireRouteAccess } from "@/lib/api-authz";

export async function GET(request: Request) {
  const auth = await requireRouteAccess(request, "tickets");
  if (auth.response) {
    return auth.response;
  }

  const data = await listTickets();

  return Response.json({
    ok: true,
    data,
    count: data.length,
  });
}

export async function POST(request: Request) {
  const auth = await requireRouteAccess(request, "tickets");
  if (auth.response) {
    return auth.response;
  }

  const payload = await request.json().catch(() => ({}));
  const ticketId = generateUniqueTicketId();
  const workflowId = generateProcessId(ticketId, payload.processName ?? "inicio");

  return Response.json(
    {
      ok: true,
      message: "Ticket creado",
      data: {
        ...payload,
        id: ticketId,
        workflowId,
        createdAt: new Date().toISOString(),
      },
    },
    { status: 201 },
  );
}
