// notify-quote — Supabase Edge Function
// Triggered by a Database Webhook on `quotes` INSERT. Sends two emails:
//   1. Owner notification with the new quote details + admin link.
//   2. Customer confirmation that the request was received.
// Set the RESEND_API_KEY secret before deploying:
//   supabase secrets set RESEND_API_KEY=re_...

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  ADMIN_URL,
  BLOCKQUOTE_BG,
  BRAND_GREEN,
  OWNER_EMAIL,
  TEXT_MUTED,
  TEXT_PRIMARY,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
  ctaButton,
  emailLayout,
  escapeHtml,
  infoRow,
  messageBlock,
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
  const body = `
      <h2 style="margin: 0 0 8px; color: ${TEXT_PRIMARY}; font-size: 22px; font-weight: 700; line-height: 1.3;">New Quote Request</h2>
      <p style="margin: 0 0 28px; color: ${TEXT_MUTED}; font-size: 15px; line-height: 1.5;">A new quote request just landed. Reply to this email to respond directly to the customer.</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${infoRow("Customer", q.name)}
        ${infoRow("Email", q.email)}
        ${infoRow("Phone", q.phone)}
        ${infoRow("Product", q.product)}
        ${infoRow("Quantity", q.quantity, !q.message)}
      </table>
      ${q.message ? messageBlock(q.message, "Customer Note") : ""}
      ${ctaButton("Open in Admin Dashboard", ADMIN_URL)}`;

  return emailLayout({
    preheader: `New quote: ${q.name} — ${q.quantity} of ${q.product}`,
    body,
  });
}

function customerEmailHtml(q: QuoteRecord): string {
  const body = `
      <h2 style="margin: 0 0 16px; color: ${TEXT_PRIMARY}; font-size: 24px; font-weight: 700; line-height: 1.3;">Thank you for your inquiry</h2>
      <p style="margin: 0 0 16px; color: ${TEXT_PRIMARY}; font-size: 16px; line-height: 1.6;">
        Hi ${escapeHtml(q.name)},
      </p>
      <p style="margin: 0 0 16px; color: ${TEXT_PRIMARY}; font-size: 16px; line-height: 1.6;">
        We received your quote request and our team will review your requirements. You can expect a tailored response from us <strong>within 1 business day</strong>.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
        <tr>
          <td style="background-color: ${BLOCKQUOTE_BG}; border-radius: 8px; padding: 20px 24px;">
            <p style="margin: 0 0 14px; color: ${TEXT_MUTED}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">Your Request</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding: 5px 0; color: ${TEXT_MUTED}; font-size: 14px; width: 100px;">Product</td>
                <td style="padding: 5px 0; font-size: 15px; font-weight: 600; color: ${TEXT_PRIMARY};">${escapeHtml(q.product)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: ${TEXT_MUTED}; font-size: 14px;">Quantity</td>
                <td style="padding: 5px 0; font-size: 15px; font-weight: 600; color: ${TEXT_PRIMARY};">${escapeHtml(q.quantity)}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 16px; color: ${TEXT_PRIMARY}; font-size: 16px; line-height: 1.6;">
        Need a faster reply or want to chat about your specific crop or region? Message us on WhatsApp at
        <a href="${WHATSAPP_URL}" style="color: ${BRAND_GREEN}; text-decoration: none; font-weight: 600;">${WHATSAPP_DISPLAY}</a>.
      </p>

      <p style="margin: 36px 0 0; color: ${TEXT_PRIMARY}; font-size: 16px; line-height: 1.5;">
        Warm regards,<br>
        <strong style="color: ${BRAND_GREEN};">The GreenGrows Team</strong>
      </p>`;

  return emailLayout({
    preheader: `Your quote request for ${q.product} is being reviewed.`,
    body,
  });
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

    await sendEmail({
      to: OWNER_EMAIL,
      replyTo: q.email,
      subject: `New quote: ${q.product} — ${q.name}`,
      html: ownerEmailHtml(q),
    });

    await sendEmail({
      to: q.email,
      replyTo: OWNER_EMAIL,
      subject: `We received your quote request — GreenGrows`,
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
