// send-reply — Supabase Edge Function
// Called from the admin dashboard's Reply dialog. Sends a reply email via
// Resend to the customer and logs the outgoing message in admin_replies.
//
// Unlike notify-quote/notify-contact (which are triggered by Database
// Webhooks), this is invoked from the browser. We:
//   1. Verify the caller has a real signed-in admin JWT (not just the anon key)
//   2. Send the email via Resend
//   3. Log the reply in admin_replies for in-app history

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  emailLayout,
  escapeHtml,
  OWNER_EMAILS,
  sendEmail,
  TEXT_PRIMARY,
} from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SourceTable = "quotes" | "contacts";

type ReplyPayload = {
  to: string;
  subject: string;
  body: string;
  sourceTable: SourceTable;
  sourceId: string;
};

function bodyToHtml(plainText: string): string {
  const escaped = escapeHtml(plainText);
  const withBreaks = escaped.split("\n").join("<br>");
  const preheader =
    plainText
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? "A reply from GreenGrows";
  const body = `<p style="margin: 0; font-size: 15px; line-height: 1.7; color: ${TEXT_PRIMARY}; white-space: pre-wrap; word-break: break-word;">${withBreaks}</p>`;
  return emailLayout({ preheader, body });
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing Authorization header" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  // Verify the caller is a real signed-in admin (not just anyone with the anon key).
  const supabaseClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  let payload: ReplyPayload;
  try {
    payload = (await req.json()) as ReplyPayload;
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  if (
    !payload.to ||
    !payload.subject ||
    !payload.body ||
    !payload.sourceTable ||
    !payload.sourceId
  ) {
    return jsonResponse({ error: "Missing required fields" }, 400);
  }

  if (payload.sourceTable !== "quotes" && payload.sourceTable !== "contacts") {
    return jsonResponse({ error: "Invalid sourceTable" }, 400);
  }

  try {
    await sendEmail({
      to: payload.to,
      replyTo: OWNER_EMAILS,
      subject: payload.subject,
      html: bodyToHtml(payload.body),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("send-reply: Resend send failed:", message);
    return jsonResponse({ error: `Failed to send email: ${message}` }, 502);
  }

  // Email sent. Log to admin_replies. If logging fails, the reply still went
  // out — return success with a warning so the UI knows to surface it.
  const { error: insertError } = await supabaseClient
    .from("admin_replies")
    .insert({
      source_table: payload.sourceTable,
      source_id: payload.sourceId,
      to_email: payload.to,
      subject: payload.subject,
      body: payload.body,
      sent_by_user_id: user.id,
    });

  if (insertError) {
    console.error("send-reply: failed to log reply:", insertError);
    return jsonResponse(
      { ok: true, warning: "Email sent but reply log failed" },
      200,
    );
  }

  return jsonResponse({ ok: true }, 200);
});
