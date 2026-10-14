const encoder = new TextEncoder();
const SESSION_LIFETIME_SECONDS = 8 * 60 * 60;
const DEFAULT_ALLOWED_ORIGINS = [
  "https://jdip19.github.io",
  "https://jdip19.github.com",
  "http://localhost:3000",
  "http://localhost:5500",
];

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  origin: string | null,
  allowedOrigins: string[],
): Response {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  });
  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Headers", "authorization, content-type");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function createSession(secret: string): Promise<string> {
  const payload = encoder.encode(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS,
  }));
  const signature = await crypto.subtle.sign("HMAC", await getSigningKey(secret), payload);
  return `${encodeBase64Url(payload)}.${encodeBase64Url(new Uint8Array(signature))}`;
}

async function isValidSession(token: string, secret: string): Promise<boolean> {
  const [encodedPayload, encodedSignature, extra] = token.split(".");
  if (!encodedPayload || !encodedSignature || extra !== undefined) return false;

  try {
    const payload = decodeBase64Url(encodedPayload);
    const signature = decodeBase64Url(encodedSignature);
    const valid = await crypto.subtle.verify(
      "HMAC",
      await getSigningKey(secret),
      toArrayBuffer(signature),
      toArrayBuffer(payload),
    );
    if (!valid) return false;

    const claims: unknown = JSON.parse(new TextDecoder().decode(payload));
    return typeof claims === "object"
      && claims !== null
      && "exp" in claims
      && typeof claims.exp === "number"
      && claims.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function passwordMatches(supplied: unknown, expected: string): boolean {
  if (typeof supplied !== "string" || encoder.encode(supplied).length > 256) return false;
  const suppliedBytes = encoder.encode(supplied);
  const expectedBytes = encoder.encode(expected);
  let difference = suppliedBytes.length ^ expectedBytes.length;
  const length = Math.max(suppliedBytes.length, expectedBytes.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (suppliedBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0);
  }
  return difference === 0;
}

function generateLicenseKey(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const groups: string[] = [];
  const random = new Uint8Array(5);
  for (let group = 0; group < 3; group += 1) {
    let value = "";
    while (value.length < 5) {
      crypto.getRandomValues(random);
      for (const byte of random) {
        if (byte < 224 && value.length < 5) value += alphabet[byte % alphabet.length];
      }
    }
    groups.push(value);
  }
  return `QT-${groups.join("-")}`;
}

function isValidEmail(value: unknown): value is string {
  return typeof value === "string"
    && value.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

Deno.serve(async (request) => {
  const configuredOrigins = (Deno.env.get("ADMIN_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = configuredOrigins.length > 0
    ? configuredOrigins
    : DEFAULT_ALLOWED_ORIGINS;
  const origin = request.headers.get("Origin");

  if (origin && !allowedOrigins.includes(origin)) {
    return jsonResponse({ error: "Origin not allowed." }, 403, origin, allowedOrigins);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin ?? "",
        "Access-Control-Allow-Headers": "authorization, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Vary": "Origin",
      },
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405, origin, allowedOrigins);
  }

  const adminPassword = Deno.env.get("ADMIN_PASSWORD");
  const tokenSecret = Deno.env.get("ADMIN_TOKEN_SECRET");
  if (!adminPassword || !tokenSecret || tokenSecret.length < 32) {
    console.error("Admin function requires ADMIN_PASSWORD and a 32-character ADMIN_TOKEN_SECRET.");
    return jsonResponse({ error: "Admin service is not configured." }, 500, origin, allowedOrigins);
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return jsonResponse({ error: "Invalid request body." }, 400, origin, allowedOrigins);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: "Invalid JSON request body." }, 400, origin, allowedOrigins);
  }

  if (body.action === "login") {
    if (!passwordMatches(body.password, adminPassword)) {
      return jsonResponse({ error: "Incorrect password." }, 401, origin, allowedOrigins);
    }
    return jsonResponse({ token: await createSession(tokenSecret) }, 200, origin, allowedOrigins);
  }

  const bearer = request.headers.get("Authorization")?.match(/^Bearer (.+)$/i)?.[1] ?? "";
  if (!await isValidSession(bearer, tokenSecret)) {
    return jsonResponse({ error: "Session expired. Sign in again." }, 401, origin, allowedOrigins);
  }

  if (body.action === "session") {
    return jsonResponse({ authenticated: true }, 200, origin, allowedOrigins);
  }

  if (body.action !== "create-license") {
    return jsonResponse({ error: "Unknown action." }, 400, origin, allowedOrigins);
  }
  if (!isValidEmail(body.email)) {
    return jsonResponse({ error: "Enter a valid customer email address." }, 400, origin, allowedOrigins);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Admin function requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    return jsonResponse({ error: "License storage is not configured." }, 500, origin, allowedOrigins);
  }

  const licenseKey = generateLicenseKey();
  const license = {
    serial_key: licenseKey,
    email: body.email.trim(),
    plugin: "quictext",
    plan: "pro",
    license_type: "paid",
    unlimited: true,
    source: "admin",
    device_id: null,
  };

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/licenses`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(license),
    });
    if (!response.ok) {
      const details = await response.text();
      console.error("Supabase license insert failed:", response.status, details);
      return jsonResponse({ error: "Could not save the license. Check the licenses table schema and try again." }, 502, origin, allowedOrigins);
    }
  } catch (error) {
    console.error("Supabase license request failed:", error);
    return jsonResponse({ error: "Could not connect to license storage." }, 502, origin, allowedOrigins);
  }

  return jsonResponse({
    licenseKey,
    email: body.email.trim(),
  }, 201, origin, allowedOrigins);
});
