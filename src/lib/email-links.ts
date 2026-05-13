/**
 * Build a Gmail compose URL with the To, Subject, and optional Body prefilled.
 * Opens in a new tab; the admin's signed-in Gmail handles the reply, which
 * keeps the conversation in their real inbox + threading history (vs. sending
 * a synthetic email from our Resend "from" address).
 *
 * Example:
 *   gmailComposeUrl({ to: "juan@example.com", subject: "Re: Quote" })
 *   → "https://mail.google.com/mail/?view=cm&to=juan%40example.com&su=Re%3A+Quote"
 */
type GmailComposeArgs = {
  to: string;
  subject: string;
  body?: string;
};

export function gmailComposeUrl({ to, subject, body }: GmailComposeArgs): string {
  const params = new URLSearchParams({
    view: "cm",
    to,
    su: subject,
  });
  if (body) {
    params.set("body", body);
  }
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Friendly opening template the admin can edit before hitting Send.
 * Generic enough to cover both quote and contact replies.
 */
export function replyBodyTemplate(name: string): string {
  return `Hi ${name},

Thanks for reaching out to GreenGrows.

[your reply here]

— The GreenGrows team`;
}
