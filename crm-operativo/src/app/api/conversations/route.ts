import { listConversations } from "@/lib/crm-data";
import { requireRouteAccess } from "@/lib/api-authz";

export async function GET(request: Request) {
  const auth = await requireRouteAccess(request, "inbox");
  if (auth.response) {
    return auth.response;
  }

  const data = await listConversations();

  return Response.json({
    ok: true,
    data,
    count: data.length,
  });
}
