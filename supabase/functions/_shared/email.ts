// Shared email helpers used by notify-quote and notify-contact.
// Edge Functions run in Deno; this file imports nothing from npm at build
// time — just uses fetch + Deno.env, both globals in the runtime.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_ADDRESS = Deno.env.get("FROM_ADDRESS") ?? "GreenGrows <onboarding@resend.dev>";

export const OWNER_EMAIL = Deno.env.get("OWNER_EMAIL") ?? "cyrildave.legaspi@gmail.com";
export const ADMIN_URL = Deno.env.get("ADMIN_URL") ?? "https://grow-modern-hub.vercel.app/admin";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, replyTo }: SendEmailArgs): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [to],
      reply_to: replyTo,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API ${res.status}: ${body}`);
  }
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const BRAND_GREEN = "#16a34a";
const BORDER_GREY = "#e5e7eb";
const LABEL_GREY = "#6b7280";

export function emailWrapper(innerHtml: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 24px;">
${innerHtml}
<hr style="border: 0; border-top: 1px solid ${BORDER_GREY}; margin: 32px 0 16px;">
<p style="color: ${LABEL_GREY}; font-size: 13px; margin: 0;">GreenGrows Fertilizers</p>
</body>
</html>`;
}

export { BRAND_GREEN, BORDER_GREY, LABEL_GREY };
