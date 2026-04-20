import { db } from "@/db";
import { auditLog, signupAttempts } from "@/db/schema";
import { newId } from "./ids";

export async function logAudit(input: {
  actorUserId: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(auditLog).values({
    id: newId(),
    actorUserId: input.actorUserId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    metadata: input.metadata ?? {},
  });
}

export async function logSignupAttempt(input: {
  email?: string | null;
  ip?: string | null;
  codeUsed?: string | null;
  success: boolean;
  reason?: string;
}) {
  await db.insert(signupAttempts).values({
    id: newId(),
    email: input.email ?? null,
    ip: input.ip ?? null,
    codeUsed: input.codeUsed ?? null,
    success: input.success,
    reason: input.reason,
  });
}
