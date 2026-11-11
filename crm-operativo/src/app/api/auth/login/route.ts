import { signInWithEmail } from "@/lib/auth";
import { canSignSessions, createSessionCookie } from "@/lib/auth-session";

const loginAttempts = new Map<string, { count: number; windowStartedAt: number }>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 10;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if ((origin && origin !== new URL(request.url).origin) || fetchSite === "cross-site") {
    return Response.json({ ok: false, error: "Solicitud no permitida." }, { status: 403 });
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return Response.json({ ok: false, error: "Se requiere contenido JSON." }, { status: 415 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 4096) {
    return Response.json({ ok: false, error: "Solicitud demasiado grande." }, { status: 413 });
  }

  if (!canSignSessions()) {
    return Response.json({ ok: false, error: "La autenticación no está configurada de forma segura." }, { status: 503 });
  }

  const ip = request.headers.get("x-real-ip") ?? request.headers.get("cf-connecting-ip") ?? "unknown";
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  if (attempts && now - attempts.windowStartedAt < LOGIN_WINDOW_MS && attempts.count >= MAX_LOGIN_ATTEMPTS) {
    return Response.json({ ok: false, error: "Demasiados intentos. Intenta de nuevo más tarde." }, { status: 429 });
  }

  if (!attempts || now - attempts.windowStartedAt >= LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, windowStartedAt: now });
  } else {
    attempts.count += 1;
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > 4096) {
    return Response.json({ ok: false, error: "Solicitud demasiado grande." }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = {};
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return Response.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  const credentials = payload as Record<string, unknown>;
  const username = String(credentials.username ?? "");
  const password = String(credentials.password ?? "");

  if (!username || !password || !/^[a-zA-Z0-9]{8,}$/.test(username) || !/^[a-zA-Z0-9]{8,}$/.test(password)) {
    return Response.json(
      { ok: false, error: "Usuario y contraseña deben ser alfanuméricos y tener al menos 8 caracteres." },
      { status: 400 },
    );
  }

  try {
    const result = await signInWithEmail(username, password);

    if (result.error) {
      return Response.json(
        { ok: false, error: result.error.message ?? "Error de autenticación." },
        { status: 401 },
      );
    }

    const user = result.data?.user;
    const session = {
      id: String(user?.id ?? "demo-user"),
      username: String(user?.username ?? username),
      email: String(user?.email ?? ""),
      role: (user?.role ?? "admin") as "admin" | "agent" | "supervisor" | "viewer",
      name: String(user?.user_metadata?.name ?? "Usuario"),
    };

    const { session: refreshedSession, cookie } = createSessionCookie(session);

    const response = Response.json({
      ok: true,
      user: {
        username: refreshedSession.username,
        email: refreshedSession.email,
        role: refreshedSession.role,
        name: refreshedSession.name,
      },
      message: "Sesión iniciada correctamente",
    }, { headers: { "Set-Cookie": cookie, "Cache-Control": "no-store" } });

    loginAttempts.delete(ip);
    return response;
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "No se pudo iniciar sesión.",
      },
      { status: 500 },
    );
  }
}
