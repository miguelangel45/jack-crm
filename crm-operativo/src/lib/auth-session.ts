import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { isSessionExpired, type AppSession } from "@/lib/auth";

export const SESSION_COOKIE = "crm-session";
const developmentSessionSecret = process.env.NODE_ENV !== "production" ? randomBytes(32) : null;

function getSessionSecret() {
  const configuredSecret = process.env.CRM_SESSION_SECRET;
  if (configuredSecret && Buffer.byteLength(configuredSecret, "utf8") >= 32) {
    return Buffer.from(configuredSecret, "utf8");
  }

  return process.env.NODE_ENV !== "production" ? developmentSessionSecret : null;
}

export function canSignSessions() {
  return getSessionSecret() !== null;
}

function signSessionPayload(payload: string, secret: Buffer) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function getSessionFromCookieHeader(cookieHeader: string | null | undefined) {
  if (!cookieHeader) return null;

  const sessionCookie = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${SESSION_COOKIE}=`));
  if (!sessionCookie) return null;

  try {
    const rawValue = decodeURIComponent(sessionCookie.slice(SESSION_COOKIE.length + 1));
    const [payload, suppliedSignature, extra] = rawValue.split(".");
    const secret = getSessionSecret();
    if (!payload || !suppliedSignature || extra || !secret) return null;

    const expectedSignature = Buffer.from(signSessionPayload(payload, secret), "base64url");
    const receivedSignature = Buffer.from(suppliedSignature, "base64url");
    if (receivedSignature.length !== expectedSignature.length || !timingSafeEqual(receivedSignature, expectedSignature)) {
      return null;
    }

    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AppSession;
    if (
      !parsed.id ||
      !parsed.username ||
      !parsed.email ||
      !parsed.name ||
      !["admin", "supervisor", "agent", "viewer"].includes(parsed.role)
    ) {
      return null;
    }

    if (isSessionExpired(parsed)) return null;

    return {
      ...parsed,
      lastActivity: parsed.lastActivity ?? Date.now(),
      expiresAt: parsed.expiresAt ?? Date.now() + 5 * 60 * 1000,
    };
  } catch {
    return null;
  }
}

export async function getSessionFromServerRequest(request: Request): Promise<AppSession | null> {
  return getSessionFromCookieHeader(request.headers.get("cookie"));
}

export function createSessionCookie(session: AppSession) {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("Configura CRM_SESSION_SECRET con al menos 32 caracteres antes de habilitar sesiones de producción.");
  }

  const now = Date.now();
  const signedSession: AppSession = { ...session, lastActivity: now, expiresAt: now + 5 * 60 * 1000 };
  const payload = Buffer.from(JSON.stringify(signedSession), "utf8").toString("base64url");
  const signature = signSessionPayload(payload, secret);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return {
    session: signedSession,
    cookie: `${SESSION_COOKIE}=${encodeURIComponent(`${payload}.${signature}`)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=300${secure}`,
  };
}
