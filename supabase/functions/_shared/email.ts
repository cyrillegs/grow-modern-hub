// Shared email helpers used by notify-quote and notify-contact.
// Edge Functions run in Deno; this file uses fetch + Deno.env, both globals
// in the runtime. Templates use email-safe HTML: table layout, inline styles
// (no classes), no CSS-only features like flexbox.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_ADDRESS = Deno.env.get("FROM_ADDRESS") ?? "GreenGrows <onboarding@resend.dev>";

export const OWNER_EMAIL = Deno.env.get("OWNER_EMAIL") ?? "cyrildave.legaspi@gmail.com";
export const ADMIN_URL = Deno.env.get("ADMIN_URL") ?? "https://grow-modern-hub.vercel.app/admin";
export const WHATSAPP_URL = "https://wa.me/639954115063";
export const WHATSAPP_DISPLAY = "+63 995 411 5063";

// Design tokens — match the website's emerald palette and use a typography
// stack that renders consistently across Gmail, Outlook, Apple Mail, and
// major webmail clients.
export const BRAND_GREEN = "#16a34a";
export const BG_PAGE = "#f4f6f8";
export const CARD_BG = "#ffffff";
export const FOOTER_BG = "#fafbfc";
export const BLOCKQUOTE_BG = "#f9fafb";
export const BORDER_GREY = "#e5e7eb";
export const TEXT_PRIMARY = "#111827";
export const TEXT_MUTED = "#6b7280";
export const TEXT_SUBTLE = "#9ca3af";

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

type EmailLayoutArgs = {
  /** Preview text shown in the inbox list (Gmail snippet, etc.). */
  preheader: string;
  /** Pre-rendered HTML for the body of the email card. */
  body: string;
};

/**
 * Wraps the inner email body with a branded header, a white content card on a
 * grey page background, and a footer with contact info. Single 600px-wide
 * column. Tables for layout (Outlook still uses Word's renderer).
 */
export function emailLayout({ preheader, body }: EmailLayoutArgs): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GreenGrows</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_PAGE}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${TEXT_PRIMARY}; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; visibility: hidden; mso-hide: all;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BG_PAGE};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: ${CARD_BG}; border-radius: 10px; overflow: hidden;">
          <tr>
            <td style="background-color: ${BRAND_GREEN}; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.2;">GreenGrows</h1>
              <p style="margin: 6px 0 0; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 500;">Premium Agricultural Solutions</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px 32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background-color: ${FOOTER_BG}; padding: 24px 32px; border-top: 1px solid ${BORDER_GREY}; text-align: center;">
              <p style="margin: 0; color: ${TEXT_MUTED}; font-size: 13px; line-height: 1.7;">
                Need to reach us faster? Message us on
                <a href="${WHATSAPP_URL}" style="color: ${BRAND_GREEN}; text-decoration: none; font-weight: 600;">WhatsApp at ${WHATSAPP_DISPLAY}</a>
              </p>
              <p style="margin: 14px 0 0; color: ${TEXT_SUBTLE}; font-size: 11px;">
                GreenGrows Fertilizers · Premium fertilizers for sustainable agriculture
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Render a labeled info row inside the body — used by both quote and contact. */
export function infoRow(label: string, value: string, isLast = false): string {
  const border = isLast ? "none" : `1px solid ${BORDER_GREY}`;
  return `
        <tr>
          <td style="padding: 14px 0; border-bottom: ${border}; color: ${TEXT_MUTED}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; width: 100px; vertical-align: top;">
            ${escapeHtml(label)}
          </td>
          <td style="padding: 14px 0 14px 16px; border-bottom: ${border}; font-size: 15px; color: ${TEXT_PRIMARY}; word-break: break-word;">
            ${escapeHtml(value)}
          </td>
        </tr>`;
}

/**
 * Render a green CTA button as a centered table. The outer 100%-width
 * table with align="center" on its cell is the "bulletproof button"
 * pattern — works in Outlook (which ignores margin: auto on tables).
 */
export function ctaButton(label: string, href: string): string {
  return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0 0;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background-color: ${BRAND_GREEN}; border-radius: 6px;">
                  <a href="${href}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; letter-spacing: 0.01em;">
                    ${escapeHtml(label)} &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;
}

/** Render a message block with brand-green left accent — used for free-text fields. */
export function messageBlock(text: string, label = "Message"): string {
  return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
        <tr>
          <td style="background-color: ${BLOCKQUOTE_BG}; border-left: 3px solid ${BRAND_GREEN}; padding: 18px 20px; border-radius: 4px;">
            <p style="margin: 0 0 8px; color: ${TEXT_MUTED}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">${escapeHtml(label)}</p>
            <p style="margin: 0; font-size: 15px; line-height: 1.65; color: ${TEXT_PRIMARY}; white-space: pre-wrap; word-break: break-word;">${escapeHtml(text)}</p>
          </td>
        </tr>
      </table>`;
}
