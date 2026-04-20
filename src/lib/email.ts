/*
 * Thin Resend wrapper with a graceful fallback. When RESEND_API_KEY is missing
 * (dev, or pre-provisioned prod), emails are logged to stdout and to audit_log
 * so the product flow still works end-to-end without a real email account.
 */
import { Resend } from "resend";
import { render } from "@react-email/render";
import { logAudit } from "./audit";

const FROM_DEFAULT = "The Woodshed <noreply@thewoodshed.app>";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export interface SendEmailArgs {
  to: string;
  subject: string;
  component: React.ReactElement;
  actorUserId?: string | null;
  targetUserId?: string | null;
  category?: string;
}

export async function sendEmail({ to, subject, component, actorUserId = null, targetUserId = null, category }: SendEmailArgs) {
  const html = await render(component);
  const text = await render(component, { plainText: true });
  const from = process.env.RESEND_FROM || FROM_DEFAULT;
  const client = getClient();

  if (!client) {
    console.log(`[email:stub] to=${to} subject=${JSON.stringify(subject)} category=${category ?? "-"}`);
    await logAudit({
      actorUserId,
      action: "email_stub",
      targetType: "email",
      targetId: targetUserId ?? undefined,
      metadata: { to, subject, category },
    });
    return { id: "stub", delivered: false as const };
  }

  try {
    const { data, error } = await client.emails.send({ from, to, subject, html, text });
    if (error) {
      console.error("[email:error]", error);
      await logAudit({
        actorUserId,
        action: "email_failed",
        targetType: "email",
        targetId: targetUserId ?? undefined,
        metadata: { to, subject, category, error: String(error.message ?? error) },
      });
      return { id: null, delivered: false as const };
    }
    await logAudit({
      actorUserId,
      action: "email_sent",
      targetType: "email",
      targetId: targetUserId ?? undefined,
      metadata: { to, subject, category, providerId: data?.id },
    });
    return { id: data?.id ?? null, delivered: true as const };
  } catch (err) {
    console.error("[email:exception]", err);
    return { id: null, delivered: false as const };
  }
}
