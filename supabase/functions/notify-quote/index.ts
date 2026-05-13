// notify-quote — Supabase Edge Function
// Triggered by a Database Webhook on `quotes` INSERT. Sends two emails:
//   1. Owner notification with the new quote details + admin link.
//   2. Customer confirmation that the request was received.
// Set the RESEND_API_KEY secret before deploying:
//   supabase secrets set RESEND_API_KEY=re_...

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  ADMIN_URL,
  BRAND_GREEN,
  LABEL_GREY,
  OWNER_EMAIL,
  emailWrapper,
  escapeHtml,
  sendEmail,
} from "../_shared/email.ts";

type QuoteRecord = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  product: string;
  quantity: string;
  message: string | null;
  status: string;
  admin_notes: string | null;
};

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: QuoteRecord;
};

function ownerEmailHtml(q: QuoteRecord): string {
  const rows: Array<[string, string]> = [
    ["Name", q.name],
    ["Email", q.email],
    ["Phone", q.phone],
    ["Product", q.product],
    ["Quantity", q.quantity],
  ];
  if (q.message) rows.push(["Message", q.message]);

  const tableRows = rows
    .map(
      ([label, value]) => `
    <tr>
      <td style="padding: 6px 16px 6px 0; color: ${LABEL_GREY}; vertical-align: top; white-space: nowrap;"><strong>${label}</strong></td>
      <td style="padding: 6px 0;">${escapeHtml(value)}</td>
    </tr>`,
    )
    .join("");

  return emailWrapper(`
<h2 style="color: ${BRAND_GREEN}; margin: 0 0 16px;">New Quote Request</h2>
<p style="margin: 0 0 20px;">A new quote request just landed in your dashboard:</p>
<table style="border-collapse: collapse; margin: 0 0 24px;">${tableRows}</table>
<p style="margin: 0 0 20px;">
  <a href="${ADMIN_URL}" style="display: inline-block; padding: 10px 20px; background: ${BRAND_GREEN}; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">View in Admin Dashboard</a>
</p>`);
}

function customerEmailHtml(q: QuoteRecord): string {
  return emailWrapper(`
<h2 style="color: ${BRAND_GREEN}; margin: 0 0 16px;">We received your quote request</h2>
<p style="margin: 0 0 16px;">Hi ${escapeHtml(q.name)},</p>
<p style="margin: 0 0 16px;">
  Thanks for your interest in <strong>${escapeHtml(q.product)}</strong>. We've received your request and will get back to you within 1 business day with pricing and delivery details.
</p>
<p style="margin: 0 0 16px;">
  If you need to reach us sooner, you can message us on WhatsApp:
  <a href="https://wa.me/639954115063" style="color: ${BRAND_GREEN};">+63 995 411 5063</a>.
</p>
<p style="margin: 0;">— The GreenGrows team</p>`);
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = (await req.json()) as WebhookPayload;

    if (payload.type !== "INSERT" || payload.table !== "quotes") {
      return new Response("Ignored: not a quotes INSERT", { status: 200 });
    }

    const q = payload.record;

    // Owner notification — reply-to is the customer so the owner can hit
    // reply directly from Gmail and respond to them.
    await sendEmail({
      to: OWNER_EMAIL,
      replyTo: q.email,
      subject: `New quote request — ${q.product} — ${q.name}`,
      html: ownerEmailHtml(q),
    });

    // Customer confirmation. Reply-to is the owner so customers replying
    // to the confirmation reach a real inbox.
    await sendEmail({
      to: q.email,
      replyTo: OWNER_EMAIL,
      subject: "We received your quote request — GreenGrows",
      html: customerEmailHtml(q),
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("notify-quote error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
