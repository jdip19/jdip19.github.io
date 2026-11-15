const encoder = new TextEncoder();
const SESSION_LIFETIME_SECONDS = 8 * 60 * 60;
const DEFAULT_ALLOWED_ORIGINS = [
  "https://jdip19.github.io",
  "https://jdip19.github.com",
  "https://quiclab.tech",
  "https://www.quiclab.tech",
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

function resourceErrorMessage(
  operation: string,
  title: string,
  status: number,
  responseBody: string,
): string {
  let databaseError = "";
  try {
    const parsed: unknown = JSON.parse(responseBody);
    if (typeof parsed === "object" && parsed !== null) {
      const error = parsed as Record<string, unknown>;
      const code = typeof error.code === "string" ? error.code : "";
      const message = typeof error.message === "string"
        ? error.message.replace(/\s+/g, " ").slice(0, 240)
        : "";
      databaseError = [code, message].filter(Boolean).join(": ");
    }
  } catch {
    // Non-JSON gateway responses are represented by their HTTP status only.
  }

  const reason = databaseError ? `: ${databaseError}` : ".";
  return `Could not ${operation} ${title} (database HTTP ${status})${reason}`;
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

type ResourceField = {
  key: string;
  label: string;
  type: "text" | "email" | "number" | "boolean" | "datetime";
  editable?: boolean;
  create?: boolean;
  required?: boolean;
  defaultValue?: string | number | boolean;
};

type ManagedResource = {
  id: string;
  tool: string;
  title: string;
  description: string;
  project: "quicktext" | "i2snatcher";
  table: string;
  primaryKey: string;
  filters?: Record<string, string>;
  permissions: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  fields: ResourceField[];
};

const RESOURCE_REGISTRY: ManagedResource[] = [
  {
    id: "quicktext-licenses",
    tool: "QuickText",
    title: "License keys",
    description: "Customer Pro licenses. Keys are read-only; edit customer details or revoke a key.",
    project: "quicktext",
    table: "licenses",
    primaryKey: "id",
    filters: { plugin: "eq.quictext" },
    permissions: { view: true, create: false, edit: true, delete: true },
    fields: [
      { key: "id", label: "ID", type: "number" },
      { key: "serial_key", label: "License key", type: "text" },
      { key: "email", label: "Customer email", type: "email", editable: true, required: true },
      { key: "plan", label: "Plan", type: "text", editable: true, required: true },
      { key: "license_type", label: "License type", type: "text", editable: true, required: true },
      { key: "unlimited", label: "Unlimited", type: "boolean", editable: true },
      { key: "source", label: "Source", type: "text" },
    ],
  },
  {
    id: "i2snatcher-users",
    tool: "i2Snatcher",
    title: "Extension users",
    description: "Manage client access and profile names. Deleting a client may be prevented while usage history references it.",
    project: "i2snatcher",
    table: "i2snatcher_users",
    primaryKey: "client_id",
    permissions: { view: true, create: true, edit: true, delete: true },
    fields: [
      { key: "client_id", label: "Client ID", type: "text", create: true, required: true },
      { key: "display_name", label: "Name", type: "text", editable: true, create: true, required: true },
      { key: "approved", label: "Approved", type: "number", editable: true, create: true, required: true, defaultValue: 0 },
      { key: "created_at", label: "Created", type: "datetime" },
      { key: "last_seen", label: "Last seen", type: "datetime" },
    ],
  },
  {
    id: "i2snatcher-stats",
    tool: "i2Snatcher",
    title: "Usage counters",
    description: "Current aggregate totals. Edit only when correcting a verified count; event history is unchanged.",
    project: "i2snatcher",
    table: "i2snatcher_stats",
    primaryKey: "singleton",
    filters: { singleton: "eq.true" },
    permissions: { view: true, create: false, edit: true, delete: false },
    fields: [
      { key: "singleton", label: "Stats row", type: "boolean" },
      { key: "copied", label: "Icons copied", type: "number", editable: true, required: true },
      { key: "downloaded", label: "Icons downloaded", type: "number", editable: true, required: true },
    ],
  },
  {
    id: "i2snatcher-events",
    tool: "i2Snatcher",
    title: "Usage events",
    description: "Append-only event history. Read-only to preserve counter and audit integrity.",
    project: "i2snatcher",
    table: "i2snatcher_usage_events",
    primaryKey: "event_id",
    permissions: { view: true, create: false, edit: false, delete: false },
    fields: [
      { key: "event_id", label: "Event ID", type: "text" },
      { key: "client_id", label: "Client ID", type: "text" },
      { key: "action", label: "Action", type: "text" },
      { key: "created_at", label: "Created", type: "datetime" },
    ],
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getResource(resourceId: unknown): ManagedResource | undefined {
  return typeof resourceId === "string"
    ? RESOURCE_REGISTRY.find((resource) => resource.id === resourceId)
    : undefined;
}

function validateResourceValue(field: ResourceField, value: unknown): boolean {
  if (value === null) return !field.required;
  switch (field.type) {
    case "text":
      if (typeof value !== "string" || value.length > 512) return false;
      if (field.key === "client_id") return /^[a-zA-Z0-9_-]{1,128}$/.test(value);
      return !field.required || value.trim().length > 0;
    case "email":
      return isValidEmail(value);
    case "number":
      return typeof value === "number"
        && Number.isSafeInteger(value)
        && value >= 0
        && (field.key !== "approved" || value === 0 || value === 1);
    case "boolean":
      return typeof value === "boolean";
    case "datetime":
      return false;
  }
}

function getResourceValues(
  resource: ManagedResource,
  values: unknown,
  operation: "create" | "edit",
): Record<string, unknown> | null {
  if (!isRecord(values)) return null;
  const allowedFields = resource.fields.filter((field) =>
    operation === "create" ? field.create : field.editable
  );
  const entries = Object.entries(values);
  if (entries.length === 0 || entries.some(([key]) =>
    !allowedFields.some((field) => field.key === key)
  )) return null;

  const result: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(values, field.key)) {
      const value = values[field.key];
      if (!validateResourceValue(field, value)) return null;
      result[field.key] = typeof value === "string" ? value.trim() : value;
    } else if (operation === "create" && field.defaultValue !== undefined) {
      result[field.key] = field.defaultValue;
    } else if (operation === "create" && field.required) {
      return null;
    }
  }
  return result;
}

function isValidResourceKey(resource: ManagedResource, value: unknown): value is string | number | boolean {
  if (resource.primaryKey === "id") {
    return (typeof value === "number" && Number.isSafeInteger(value) && value > 0)
      || (typeof value === "string" && (/^\d{1,18}$/.test(value)
        || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)));
  }
  if (resource.primaryKey === "client_id") {
    return typeof value === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(value);
  }
  if (resource.primaryKey === "event_id") {
    return typeof value === "string"
      && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }
  return resource.primaryKey === "singleton" && value === true;
}

Deno.serve(async (request) => {
  const configuredOrigins = (Deno.env.get("ADMIN_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins])];
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

  if (body.action === "get-admin-registry") {
    return jsonResponse({
      resources: RESOURCE_REGISTRY.map((resource) => ({
        id: resource.id,
        tool: resource.tool,
        title: resource.title,
        description: resource.description,
        projectUrl: resource.project === "quicktext"
          ? "https://kmkjuuytbgpozrigspgw.supabase.co"
          : "https://jfxwmldeikfmiwhjnsgg.supabase.co",
        projectConfigured: resource.project === "quicktext"
          ? Boolean(Deno.env.get("SUPABASE_URL") && Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))
          : Boolean(Deno.env.get("I2SNATCHER_SUPABASE_URL") && Deno.env.get("I2SNATCHER_SERVICE_ROLE_KEY")),
        primaryKey: resource.primaryKey,
        permissions: resource.permissions,
        fields: resource.fields,
      })),
    }, 200, origin, allowedOrigins);
  }

  const allowedActions = [
    "create-license",
    "list-licenses",
    "delete-license",
    "list-i2snatcher-users",
    "update-i2snatcher-approval",
    "get-i2snatcher-stats",
    "list-resource",
    "create-resource",
    "update-resource",
    "delete-resource",
  ];
  if (!allowedActions.includes(String(body.action))) {
    return jsonResponse({ error: "Unknown action." }, 400, origin, allowedOrigins);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Admin function requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    return jsonResponse({ error: "License storage is not configured." }, 500, origin, allowedOrigins);
  }

  const restUrl = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/licenses`;
  const supabaseHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  };

  if (String(body.action).endsWith("-resource")) {
    const resource = getResource(body.resourceId);
    if (!resource) {
      return jsonResponse({ error: "Unknown managed resource." }, 404, origin, allowedOrigins);
    }

    const operation = String(body.action).slice(0, -"-resource".length);
    const allowed = operation === "list"
      ? resource.permissions.view
      : operation === "create"
        ? resource.permissions.create
        : operation === "update"
          ? resource.permissions.edit
          : operation === "delete"
            ? resource.permissions.delete
            : false;
    if (!allowed) {
      return jsonResponse({ error: `This resource does not allow ${operation}.` }, 403, origin, allowedOrigins);
    }

    let resourceUrl = supabaseUrl.replace(/\/+$/, "");
    let resourceKey = serviceRoleKey;
    if (resource.project === "i2snatcher") {
      const configuredUrl = Deno.env.get("I2SNATCHER_SUPABASE_URL");
      const configuredKey = Deno.env.get("I2SNATCHER_SERVICE_ROLE_KEY");
      if (!configuredUrl || !configuredKey) {
        console.error("Admin function requires I2SNATCHER_SUPABASE_URL and I2SNATCHER_SERVICE_ROLE_KEY.");
        return jsonResponse({ error: "i2Snatcher storage is not configured." }, 500, origin, allowedOrigins);
      }
      resourceUrl = configuredUrl.replace(/\/+$/, "");
      resourceKey = configuredKey;
    }

    const resourceHeaders = {
      apikey: resourceKey,
      Authorization: `Bearer ${resourceKey}`,
    };
    const tableUrl = `${resourceUrl}/rest/v1/${encodeURIComponent(resource.table)}`;
    const query = new URLSearchParams({
      select: resource.fields.map((field) => field.key).join(","),
    });
    for (const [key, value] of Object.entries(resource.filters ?? {})) query.set(key, value);

    try {
      if (operation === "list") {
        query.set("order", `${resource.primaryKey}.desc`);
        const offset = body.offset === undefined ? 0 : body.offset;
        if (typeof offset !== "number" || !Number.isSafeInteger(offset) || offset < 0 || offset > 10_000_000) {
          return jsonResponse({ error: "Invalid resource page offset." }, 400, origin, allowedOrigins);
        }
        const pageSize = 100;
        const response = await fetch(`${tableUrl}?${query}`, {
          headers: {
            ...resourceHeaders,
            Prefer: "count=exact",
            Range: `${offset}-${offset + pageSize}`,
          },
        });
        if (!response.ok) {
          const details = await response.text();
          const error = resourceErrorMessage("load", resource.title, response.status, details);
          console.error(`Managed resource list failed (${resource.id}):`, error, details);
          return jsonResponse({ error }, 502, origin, allowedOrigins);
        }
        const page: unknown = await response.json();
        if (!Array.isArray(page)) {
          return jsonResponse({ error: "The database returned an invalid resource list." }, 502, origin, allowedOrigins);
        }
        return jsonResponse({
          rows: page.slice(0, pageSize),
          hasMore: page.length > pageSize,
          total: Number(response.headers.get("Content-Range")?.split("/")[1]) || page.length,
        }, 200, origin, allowedOrigins);
      }

      if (operation === "create") {
        const values = getResourceValues(resource, body.values, "create");
        if (!values) {
          return jsonResponse({ error: "One or more create fields are invalid or not permitted." }, 400, origin, allowedOrigins);
        }
        const response = await fetch(tableUrl, {
          method: "POST",
          headers: {
            ...resourceHeaders,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(values),
        });
        if (!response.ok) {
          const details = await response.text();
          console.error(`Managed resource create failed (${resource.id}):`, response.status, details);
          return jsonResponse({ error: `Could not create ${resource.title}.` }, 502, origin, allowedOrigins);
        }
        return jsonResponse({ row: (await response.json())[0] }, 201, origin, allowedOrigins);
      }

      if (!isValidResourceKey(resource, body.key)) {
        return jsonResponse({ error: "Invalid resource record key." }, 400, origin, allowedOrigins);
      }
      query.set(resource.primaryKey, `eq.${String(body.key)}`);

      if (operation === "update") {
        const values = getResourceValues(resource, body.values, "edit");
        if (!values) {
          return jsonResponse({ error: "One or more edit fields are invalid or not permitted." }, 400, origin, allowedOrigins);
        }
        const response = await fetch(`${tableUrl}?${query}`, {
          method: "PATCH",
          headers: {
            ...resourceHeaders,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(values),
        });
        if (!response.ok) {
          const details = await response.text();
          console.error(`Managed resource update failed (${resource.id}):`, response.status, details);
          return jsonResponse({ error: `Could not update ${resource.title}.` }, 502, origin, allowedOrigins);
        }
        const rows: unknown = await response.json();
        if (!Array.isArray(rows) || rows.length === 0) {
          return jsonResponse({ error: "The resource record was not found." }, 404, origin, allowedOrigins);
        }
        return jsonResponse({ row: rows[0] }, 200, origin, allowedOrigins);
      }

      const response = await fetch(`${tableUrl}?${query}`, {
        method: "DELETE",
        headers: { ...resourceHeaders, Prefer: "return=representation" },
      });
      if (!response.ok) {
        const details = await response.text();
        console.error(`Managed resource delete failed (${resource.id}):`, response.status, details);
        return jsonResponse({ error: `Could not delete ${resource.title}. The record may be referenced by other data.` }, 502, origin, allowedOrigins);
      }
      const rows: unknown = await response.json();
      if (!Array.isArray(rows) || rows.length === 0) {
        return jsonResponse({ error: "The resource record was not found." }, 404, origin, allowedOrigins);
      }
      return jsonResponse({ deleted: true }, 200, origin, allowedOrigins);
    } catch (error) {
      console.error(`Managed resource request failed (${resource.id}):`, error);
      const detail = error instanceof Error ? `: ${error.message.slice(0, 240)}` : "";
      return jsonResponse({
        error: `Could not complete the ${operation} request for ${resource.title}${detail}`,
      }, 502, origin, allowedOrigins);
    }
  }

  const i2SnatcherActions = [
    "list-i2snatcher-users",
    "update-i2snatcher-approval",
    "get-i2snatcher-stats",
  ];
  let i2SnatcherUrl = "";
  let i2SnatcherHeaders: Record<string, string> = {};
  if (i2SnatcherActions.includes(String(body.action))) {
    const configuredUrl = Deno.env.get("I2SNATCHER_SUPABASE_URL");
    const configuredKey = Deno.env.get("I2SNATCHER_SERVICE_ROLE_KEY");
    if (!configuredUrl || !configuredKey) {
      console.error("Admin function requires I2SNATCHER_SUPABASE_URL and I2SNATCHER_SERVICE_ROLE_KEY.");
      return jsonResponse({ error: "i2Snatcher storage is not configured." }, 500, origin, allowedOrigins);
    }
    i2SnatcherUrl = configuredUrl.replace(/\/+$/, "");
    i2SnatcherHeaders = {
      apikey: configuredKey,
      Authorization: `Bearer ${configuredKey}`,
    };
  }

  if (body.action === "list-i2snatcher-users") {
    const query = new URLSearchParams({
      select: "client_id,display_name,approved,created_at,last_seen",
      order: "created_at.desc",
    });
    try {
      const users: unknown[] = [];
      const pageSize = 1000;
      for (let offset = 0; ; offset += pageSize) {
        const response = await fetch(
          `${i2SnatcherUrl}/rest/v1/i2snatcher_users?${query}`,
          {
            headers: {
              ...i2SnatcherHeaders,
              Range: `${offset}-${offset + pageSize - 1}`,
            },
          },
        );
        if (!response.ok) {
          const details = await response.text();
          console.error("Supabase i2Snatcher user list failed:", response.status, details);
          return jsonResponse({ error: "Could not load i2Snatcher users." }, 502, origin, allowedOrigins);
        }
        const page: unknown = await response.json();
        if (!Array.isArray(page)) {
          return jsonResponse({ error: "User storage returned an invalid response." }, 502, origin, allowedOrigins);
        }
        users.push(...page);
        if (page.length < pageSize) break;
      }
      return jsonResponse({ users }, 200, origin, allowedOrigins);
    } catch (error) {
      console.error("Supabase i2Snatcher user list request failed:", error);
      return jsonResponse({ error: "Could not connect to i2Snatcher user storage." }, 502, origin, allowedOrigins);
    }
  }

  if (body.action === "update-i2snatcher-approval") {
    if (
      typeof body.clientId !== "string" ||
      !/^[a-zA-Z0-9_-]{1,128}$/.test(body.clientId) ||
      !["0", "1"].includes(String(body.approved))
    ) {
      return jsonResponse({ error: "Invalid client ID or approval value." }, 400, origin, allowedOrigins);
    }
    const query = new URLSearchParams({
      client_id: `eq.${body.clientId}`,
      select: "client_id,approved",
    });
    try {
      const response = await fetch(
        `${i2SnatcherUrl}/rest/v1/i2snatcher_users?${query}`,
        {
          method: "PATCH",
          headers: {
            ...i2SnatcherHeaders,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({ approved: Number(body.approved) }),
        },
      );
      if (!response.ok) {
        const details = await response.text();
        console.error("Supabase i2Snatcher status update failed:", response.status, details);
        return jsonResponse({ error: "Could not update i2Snatcher access." }, 502, origin, allowedOrigins);
      }
      const updated: unknown = await response.json();
      if (!Array.isArray(updated) || updated.length === 0) {
        return jsonResponse({ error: "i2Snatcher client was not found." }, 404, origin, allowedOrigins);
      }
      return jsonResponse({ user: updated[0] }, 200, origin, allowedOrigins);
    } catch (error) {
      console.error("Supabase i2Snatcher status update request failed:", error);
      return jsonResponse({ error: "Could not connect to i2Snatcher user storage." }, 502, origin, allowedOrigins);
    }
  }

  if (body.action === "get-i2snatcher-stats") {
    const query = new URLSearchParams({
      select: "copied,downloaded",
      singleton: "eq.true",
      limit: "1",
    });
    try {
      const response = await fetch(
        `${i2SnatcherUrl}/rest/v1/i2snatcher_stats?${query}`,
        { headers: i2SnatcherHeaders },
      );
      if (!response.ok) {
        const details = await response.text();
        console.error("Supabase i2Snatcher stats request failed:", response.status, details);
        return jsonResponse({ error: "Could not load i2Snatcher counters." }, 502, origin, allowedOrigins);
      }
      const rows: unknown = await response.json();
      if (!Array.isArray(rows) || rows.length === 0) {
        return jsonResponse({ stats: { copied: 0, downloaded: 0 } }, 200, origin, allowedOrigins);
      }
      return jsonResponse({ stats: rows[0] as Record<string, unknown> }, 200, origin, allowedOrigins);
    } catch (error) {
      console.error("Supabase i2Snatcher stats request failed:", error);
      return jsonResponse({ error: "Could not connect to i2Snatcher stats." }, 502, origin, allowedOrigins);
    }
  }

  if (body.action === "list-licenses") {
    const query = new URLSearchParams({
      select: "id,serial_key,email,plugin,plan,license_type,unlimited",
      plugin: "eq.quictext",
      order: "id.desc",
    });
    try {
      const licenses: unknown[] = [];
      const pageSize = 1000;
      for (let offset = 0; ; offset += pageSize) {
        const response = await fetch(`${restUrl}?${query}`, {
          headers: {
            ...supabaseHeaders,
            Range: `${offset}-${offset + pageSize - 1}`,
          },
        });
        if (!response.ok) {
          const details = await response.text();
          console.error("Supabase license list failed:", response.status, details);
          return jsonResponse({ error: "Could not load QuickText licenses." }, 502, origin, allowedOrigins);
        }
        const page: unknown = await response.json();
        if (!Array.isArray(page)) {
          console.error("Supabase license list returned an unexpected response.");
          return jsonResponse({ error: "License storage returned an invalid response." }, 502, origin, allowedOrigins);
        }
        licenses.push(...page);
        if (page.length < pageSize) break;
      }
      return jsonResponse({ licenses }, 200, origin, allowedOrigins);
    } catch (error) {
      console.error("Supabase license list request failed:", error);
      return jsonResponse({ error: "Could not connect to license storage." }, 502, origin, allowedOrigins);
    }
  }

  if (body.action === "delete-license") {
    if ((typeof body.id !== "string" && typeof body.id !== "number")
      || String(body.id).length === 0
      || String(body.id).length > 128) {
      return jsonResponse({ error: "Invalid license ID." }, 400, origin, allowedOrigins);
    }
    const query = new URLSearchParams({
      id: `eq.${String(body.id)}`,
      plugin: "eq.quictext",
      select: "id",
    });
    try {
      const response = await fetch(`${restUrl}?${query}`, {
        method: "DELETE",
        headers: { ...supabaseHeaders, Prefer: "return=representation" },
      });
      if (!response.ok) {
        const details = await response.text();
        console.error("Supabase license deletion failed:", response.status, details);
        return jsonResponse({ error: "Could not delete the license." }, 502, origin, allowedOrigins);
      }
      const deleted: unknown = await response.json();
      if (!Array.isArray(deleted) || deleted.length === 0) {
        return jsonResponse({ error: "QuickText license was not found." }, 404, origin, allowedOrigins);
      }
      return jsonResponse({ deleted: true }, 200, origin, allowedOrigins);
    } catch (error) {
      console.error("Supabase license deletion request failed:", error);
      return jsonResponse({ error: "Could not connect to license storage." }, 502, origin, allowedOrigins);
    }
  }

  if (!isValidEmail(body.email)) {
    return jsonResponse({ error: "Enter a valid customer email address." }, 400, origin, allowedOrigins);
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
    const response = await fetch(restUrl, {
      method: "POST",
      headers: {
        ...supabaseHeaders,
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
