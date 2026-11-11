import { providerLabels, type Provider } from "@/domain/integrations";
import { listIntegrations } from "@/lib/crm-data";
import { requireRouteAccess } from "@/lib/api-authz";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { provider: string } },
) {
  const auth = await requireRouteAccess(request, "integrations");
  if (auth.response) {
    return auth.response;
  }

  const normalizedProvider = params.provider.toLowerCase() as Provider;
  const connections = await listIntegrations();
  const connection = connections.find((item) => item.provider === normalizedProvider);

  if (!connection) {
    return NextResponse.json(
      { ok: false, error: `Proveedor no encontrado: ${params.provider}` },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    provider: normalizedProvider,
    label: providerLabels[normalizedProvider],
    data: connection,
  });
}
