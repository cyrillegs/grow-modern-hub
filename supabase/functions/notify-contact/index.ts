// notify-contact — Supabase Edge Function
// Triggered by a Database Webhook on `contacts` INSERT. Sends ONE email:
//   - Owner notification with the new contact message + admin link.
// No customer confirmation needed — the homepage form already shows a
// success toast on submit.

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

  return emailWrapper(`
<h2 style="color: ${BRAND_GREEN}; margin: 0 0 16px;">New Contact Form Message</h2>
<p style="margin: 0 0 20px;">A new message just came in from the contact form:</p>
<table style="border-collapse: collapse; margin: 0 0 16px;">
  <tr>
    <td style="padding: 6px 16px 6px 0; color: ${LABEL_GREY}; vertical-align: top; white-space: nowrap;"><strong>Name</strong></td>
    <td style="padding: 6px 0;">${escapeHtml(c.name)}</td>
  </tr>
  <tr>
    <td style="padding: 6px 16px 6px 0; color: ${LABEL_GREY}; vertical-align: top;"><strong>Email</strong></td>
    <td style="padding: 6px 0;">${escapeHtml(c.email)}</td>
  </tr>
  <tr>
    <td style="padding: 6px 16px 6px 0; color: ${LABEL_GREY}; vertical-align: top;"><strong>Phone</strong></td>
    <td style="padding: 6px 0;">${escapeHtml(phone)}</td>
  </tr>
</table>
<div style="background: #f9fafb; border-left: 3px solid ${BRAND_GREEN}; padding: 12px 16px; margin: 0 0 24px; border-radius: 4px;">
  <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(c.message)}</p>
</div>
<p style="margin: 0 0 20px;">
  <a href="${ADMIN_URL}" style="display: inline-block; padding: 10px 20px; background: ${BRAND_GREEN}; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">View in Admin Dashboard</a>
</p>`);
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
