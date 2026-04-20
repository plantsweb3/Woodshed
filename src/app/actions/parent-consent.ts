"use server";

import { confirmConsentByToken } from "@/lib/parent-consent";
import { logAudit } from "@/lib/audit";

export async function confirmConsent(token: string) {
  const result = await confirmConsentByToken(token);
  if (result.ok) {
    await logAudit({
      actorUserId: null,
      action: "parent_consent_confirm",
      targetType: "user",
      targetId: result.userId,
    });
  }
  return result;
}
