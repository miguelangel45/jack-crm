export async function GET() {
  return Response.json({
    ok: true,
    service: "crm-operativo",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}
