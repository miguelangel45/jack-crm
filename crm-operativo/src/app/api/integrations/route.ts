import { listIntegrations } from "@/lib/crm-data";
import { requireRouteAccess } from "@/lib/api-authz";

export async function GET(request: Request) {
  const auth = await requireRouteAccess(request, "integrations");
  if (auth.response) {
    return auth.response;
  }

  const data = await listIntegrations();

  return Response.json({
    ok: true,
    data,
    count: data.length,
  });
}
