import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

function generateLicenseKey() {
const part = () =>
Math.random().toString(36).substring(2, 6).toUpperCase();
return `QT-${part()}-${part()}-${part()}`;
}


async function sendLicenseEmail(email: string, serialKey: string) {
const response = await fetch("https://api.resend.com/emails", {
method: "POST",
headers: {
Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
"Content-Type": "application/json"
},
body: JSON.stringify({
from: "QuicText by Quiclab <support@quiclab.tech>", 
to: email, subject: 'QuicText Pro License Key' , 
html: `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your QuicText License Key</title>
  </head>

  <body
    style="margin:0;padding:0;background-color:#fefdf9;font-family:'DM Sans',Inter,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fefdf9;padding:40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

            <!-- Header / Logo -->
            <tr>
              <td style="padding-bottom:32px;" align="center">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom:32px;" align="center">
                      <img src="https://quiclab.tech/quiclab.png" alt="Quiclab" width="160" height="40"
                        style="display:block;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main Card -->
            <tr>
              <td
                style="background-color:#ffffff;border-radius:24px;border:1px solid #e7e5e4;padding:40px 36px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

                <!-- Success badge -->
                <div style="text-align:center;margin-bottom:24px;">
                  <span
                    style="display:inline-block;background-color:#fff7ed;border:1px solid #fed7aa;border-radius:99px;padding:6px 14px;font-size:11px;font-weight:600;color:#ea580c;text-transform:uppercase;letter-spacing:0.06em;">
                    ● Purchase Confirmed
                  </span>
                </div>

                <!-- Heading -->
                <h1
                  style="margin:0 0 8px 0;font-size:28px;font-weight:700;color:#0f0e0c;text-align:center;line-height:1.2;">
                  You're all set!
                </h1>
                <p style="margin:0 0 28px 0;font-size:15px;color:#78716c;text-align:center;line-height:1.6;">
                  Thanks for purchasing <strong style="color:#0f0e0c;">QuicText Pro</strong>.<br />
                  Here's your license key — keep it safe.
                </p>

                <!-- License Key Box -->
                <div
                  style="background-color:#fff7ed;border:1.5px dashed #f97316;border-radius:12px;padding:20px 24px;margin-bottom:28px;text-align:center;">
                  <div
                    style="font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;font-weight:600;">
                    Your License Key
                  </div>
                  <div
                    style="font-family:'Courier New',Courier,monospace;font-size:17px;font-weight:700;color:#f97316;word-break:break-all;user-select:all;letter-spacing:0.04em;">
                    ${serialKey}
                  </div>
                  <div style="font-size:12px;color:#a8a29e;margin-top:10px;">
                    Click the key above to select it, then copy &amp; paste into the plugin
                  </div>
                </div>

                <!-- Steps -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                  <tr>
                    <td style="background-color:#fafaf9;border-radius:12px;padding:20px 24px;">
                      <div
                        style="font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;margin-bottom:14px;">
                        How to activate
                      </div>
                      ${[
                      "Open Figma and launch the QuicText",
                      "Enter License Key",
                      "Boom! You're a Pro now 🎉",
                      ].map((step, i) => `
                      <div style="display:flex;align-items:flex-start;margin-bottom:${i < 2 ? " 10px" : "0" };">
                        <span
                          style="display:inline-block;min-width:22px;height:22px;background-color:#fff7ed;border-radius:99px;text-align:center;line-height:22px;font-size:10px;font-weight:700;color:#f97316;margin-right:10px;margin-top:1px;">
                          ${i + 1}
                        </span>
                        <span style="font-size:13px;color:#57534e;line-height:1.5;">${step}</span>
                      </div>`).join("")}
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <div style="text-align:center;margin-bottom:8px;">
                  <a href="https://www.figma.com/community/plugin/1365014672422582628/quictext"
                    style="display:inline-block;background-color:#fff7ed6;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:99px;font-weight:600;font-size:14px;letter-spacing:0.01em;">
                    Open QuicText in Figma →
                  </a>
                </div>

              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:32px 0 0 0;">
                <hr style="border:none;border-top:1px solid #e7e5e4;margin:0;" />
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px 0 8px 0;text-align:center;">
                <p style="margin:0 0 16px 0;font-size:12px;color:#a8a29e;line-height:1.6;">
                  Need help? Reach us at
                  <a href="https://www.reddit.com/r/quiclab/"
                    style="color:#f97316;text-decoration:none;font-weight:500;">Reddit</a>
                  &nbsp;·&nbsp;
                  <a href="https://www.instagram.com/quiclab"
                    style="color:#f97316;text-decoration:none;font-weight:500;">Instagram</a>
                </p>
                <p style="margin:0;font-size:11px;color:#c4bfbb;">
                  © ${new Date().getFullYear()} Quiclab. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </body>

  </html>`
  })
  });

  if (!response.ok) {
  console.error("Resend email failed:", await response.text());
  }
  }

  Deno.serve(async (req) => {
  try {
  const body = await req.json();
  console.log("Dodo Webhook Payload:", body);

  // ✅ Correct event check
  if (body.type !== "payment.succeeded") {
  return new Response("Ignored", { status: 200 });
  }

  const data = body.data;

  // ✅ Correct field extraction
  const email = data.customer?.email;
  const paymentId = data.payment_id;
  const productId = data.product_cart?.[0]?.product_id;
  const city = data.billing?.city ?? null;
  const country = data.billing?.country ?? null;
  const pluginname = "quictext";

  if (!email || !paymentId || !productId) {
  console.error("Missing fields", { email, paymentId, productId });
  return new Response("Invalid payload", { status: 400 });
  }

  const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ✅ Idempotency (use payment_id)
  const { data: existing } = await supabase
  .from("licenses")
  .select("id")
  .eq("order_id", paymentId)
  .single();

  if (existing) {
  return new Response("Already processed", { status: 200 });
  }

  const serialKey = generateLicenseKey();

  const { error } = await supabase.from("licenses").insert({
  serial_key: serialKey,
  email,
  product_id: productId,
  payment_id: paymentId,
  plugin: "quictext",
  plan: "pro",
  license_type: "paid",
  unlimited: true,
  source: "dodo",
  device_id: null,
  city,
  country
  });

  if (error) throw error;

  await sendLicenseEmail(email, serialKey);

  return new Response(JSON.stringify({ success: true }), {
  headers: { "Content-Type": "application/json" }
  });

  } catch (err) {
  console.error("Webhook Error:", err);
  return new Response("Server error", { status: 500 });
  }
  });