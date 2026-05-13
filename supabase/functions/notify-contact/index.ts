// notify-contact — Supabase Edge Function
// Triggered by a Database Webhook on `contacts` INSERT. Sends ONE email:
//   - Owner notification with the new contact message + admin link.
// No customer confirmation needed — the homepage form already shows a
// success toast on submit.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  ADMIN_URL,
  OWNER_EMAIL,
  TEXT_MUTED,
  TEXT_PRIMARY,
  ctaButton,
  emailLayout,
  infoRow,
  messageBlock,
  sendEmail,
} from "../_shared/email.ts";

type ContactRecord = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  admin_notes: string | null;
};

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: ContactRecord;
};

function ownerEmailHtml(c: ContactRecord): string {
  const phone = c.phone ?? "(not provided)";

  const body = `
      <h2 style="margin: 0 0 8px; color: ${TEXT_PRIMARY}; font-size: 22px; font-weight: 700; line-height: 1.3;">New Contact Message</h2>
      <p style="margin: 0 0 28px; color: ${TEXT_MUTED}; font-size: 15px; line-height: 1.5;">Someone reached out through the contact form. Reply to this email to respond directly.</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${infoRow("From", c.name)}
        ${infoRow("Email", c.email)}
        ${infoRow("Phone", phone, true)}
      </table>
      ${messageBlock(c.message)}
      ${ctaButton("Open in Admin Dashboard", ADMIN_URL)}`;

  return emailLayout({
    preheader: `New contact from ${c.name}`,
    body,
  });
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = (await req.json()) as WebhookPayload;

    if (payload.type !== "INSERT" || payload.table !== "contacts") {
      return new Response("Ignored: not a contacts INSERT", { status: 200 });
    }

    const c = payload.record;

    await sendEmail({
      to: OWNER_EMAIL,
      replyTo: c.email,
      subject: `New contact message — ${c.name}`,
      html: ownerEmailHtml(c),
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("notify-contact error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
