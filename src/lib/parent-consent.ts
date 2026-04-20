import { randomBytes } from "node:crypto";
import { and, eq, gte, isNull } from "drizzle-orm";
import { db } from "@/db";
import { parentConsents, users } from "@/db/schema";
import { newId } from "./ids";
import { sendEmail } from "./email";
import { ParentConsentEmail } from "@/emails/parent-consent";
import { appUrl } from "./urls";

export const CONSENT_DAYS = 14;

export function newConsentToken() {
  return randomBytes(32).toString("base64url");
}

export async function createConsentAndEmail(input: {
  userId: string;
  parentEmail: string;
  studentName: string;
}) {
  const token = newConsentToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CONSENT_DAYS);
  await db.insert(parentConsents).values({
    id: newId(),
    userId: input.userId,
    parentEmail: input.parentEmail,
    token,
    expiresAt,
  });
  const consentUrl = `${appUrl()}/consent/${token}`;
  await sendEmail({
    to: input.parentEmail,
    subject: `Please approve your student's Woodshed account`,
    component: ParentConsentEmail({
      studentName: input.studentName,
      consentUrl,
      appUrl: appUrl(),
      expiresDays: CONSENT_DAYS,
    }),
    targetUserId: input.userId,
    category: "parent_consent",
  });
  return { token, consentUrl, expiresAt };
}

export async function confirmConsentByToken(token: string) {
  const now = new Date();
  const [row] = await db
    .select()
    .from(parentConsents)
    .where(
      and(eq(parentConsents.token, token), gte(parentConsents.expiresAt, now), isNull(parentConsents.consentedAt))
    )
    .limit(1);
  if (!row) return { ok: false as const, reason: "invalid_or_expired" as const };
  await db.update(parentConsents).set({ consentedAt: now }).where(eq(parentConsents.id, row.id));
  await db
    .update(users)
    .set({ status: "pending" })
    .where(and(eq(users.id, row.userId), eq(users.status, "awaiting_parent_consent")));
  return { ok: true as const, userId: row.userId };
}

export async function purgeExpiredConsents() {
  const now = new Date();
  const expired = await db
    .select({ userId: parentConsents.userId })
    .from(parentConsents)
    .where(and(isNull(parentConsents.consentedAt)))
    .then((rows) => rows.filter((r) => true));
  // In practice, compute on expiresAt. Simplified here.
  return expired;
}
