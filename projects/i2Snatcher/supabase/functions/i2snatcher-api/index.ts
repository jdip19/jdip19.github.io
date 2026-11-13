import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function getSupabaseCredentials(): { url: string; key: string } {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase service credentials are not configured.");
  return { url: url.replace(/\/+$/, ""), key };
}

async function supabaseRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; prefer?: string } = {},
): Promise<T> {
  const { url, key } = getSupabaseCredentials();
  const headers = new Headers({
    apikey: key,
    Authorization: `Bearer ${key}`,
  });
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.prefer) headers.set("Prefer", options.prefer);

  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) {
    const details = await response.text();
    console.error("i2Snatcher Supabase request failed:", response.status, details);
    throw new ApiError("Could not access i2Snatcher data.", 502);
  }
  if (response.status === 204) return undefined as T;
  return await response.json() as T;
}

function validateClientId(value: unknown): string {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(value)) {
    throw new ApiError("Invalid client ID.", 400);
  }
  return value;
}

async function getUser(
  clientId: string,
): Promise<{ approved: number; display_name: string | null } | null> {
  const query = new URLSearchParams({
    select: "approved,display_name",
    client_id: `eq.${clientId}`,
    limit: "1",
  });
  const rows = await supabaseRequest<
    Array<{ approved: number; display_name: string | null }>
  >(
    `i2snatcher_users?${query}`,
  );
  return rows[0] ?? null;
}

async function getStats(): Promise<{ copied: number; downloaded: number }> {
  const query = new URLSearchParams({
    select: "copied,downloaded",
    singleton: "eq.true",
    limit: "1",
  });
  const rows = await supabaseRequest<Array<{ copied: number; downloaded: number }>>(
    `i2snatcher_stats?${query}`,
  );
  return rows[0] ?? { copied: 0, downloaded: 0 };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new ApiError("Invalid request body.", 400);
    }

    const payload = body as Record<string, unknown>;
    const clientId = validateClientId(payload.clientId);

    if (payload.action === "status") {
      let displayName: string | null = null;
      if (payload.displayName !== undefined) {
        if (typeof payload.displayName !== "string") {
          throw new ApiError("Enter a valid name.", 400);
        }
        displayName = payload.displayName.trim();
        if (!displayName || displayName.length > 80) {
          throw new ApiError("Name must be between 1 and 80 characters.", 400);
        }
      }

      const now = new Date().toISOString();
      let user = await getUser(clientId);
      if (!displayName && (!user || !user.display_name)) {
        throw new ApiError("Enter your name to request access.", 400);
      }
      if (!user) {
        const query = new URLSearchParams({ on_conflict: "client_id" });
        await supabaseRequest(
          `i2snatcher_users?${query}`,
          {
            method: "POST",
            body: {
              client_id: clientId,
              display_name: displayName,
              approved: 0,
            },
            prefer: "resolution=ignore-duplicates,return=minimal",
          },
        );
        user = await getUser(clientId);
      }
      if (!user) throw new ApiError("Could not register this extension.", 502);

      const updateQuery = new URLSearchParams({ client_id: `eq.${clientId}` });
      await supabaseRequest(
        `i2snatcher_users?${updateQuery}`,
        {
          method: "PATCH",
          body: {
            last_seen: now,
            ...(displayName
              ? { display_name: displayName }
              : {}),
          },
          prefer: "return=minimal",
        },
      );
      return jsonResponse({ approved: user.approved, ...(await getStats()) });
    }

    if (payload.action === "increment") {
      if (
        payload.actionType !== "copied" &&
        payload.actionType !== "downloaded"
      ) {
        throw new ApiError("Invalid counter action.", 400);
      }
      if (
        typeof payload.eventId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          payload.eventId,
        )
      ) {
        throw new ApiError("Invalid usage event ID.", 400);
      }

      const user = await getUser(clientId);
      if (user?.approved !== 1) {
        throw new ApiError("Extension access is not approved.", 403);
      }

      const result = await supabaseRequest<
        Array<{ copied: number; downloaded: number }>
      >("rpc/record_i2snatcher_usage", {
        method: "POST",
        body: {
          p_client_id: clientId,
          p_event_id: payload.eventId,
          p_action: payload.actionType,
        },
      });
      const totals = result[0];
      if (!totals) throw new ApiError("Counter service returned no totals.", 502);
      return jsonResponse(totals);
    }

    throw new ApiError("Unknown action.", 400);
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonResponse({ error: error.message }, error.status);
    }
    console.error("i2Snatcher API request failed:", error);
    return jsonResponse({ error: "Could not complete the request." }, 500);
  }
});
