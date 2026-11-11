import { createSessionCookie, getSessionFromServerRequest } from "@/lib/auth-session";

export async function GET(request: Request) {
  const session = await getSessionFromServerRequest(request);
  const headers = new Headers({ "Cache-Control": "no-store" });

  if (session) {
    headers.set("Set-Cookie", createSessionCookie(session).cookie);
  }

  return Response.json({
    ok: true,
    user: session,
  }, { headers });
}
