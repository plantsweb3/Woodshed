"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users, profiles, inviteCodes } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { newId } from "@/lib/ids";
import { rateLimit, ipFromHeaders } from "@/lib/rate-limit";
import { logAudit, logSignupAttempt } from "@/lib/audit";
import { SECTIONS, GRADES } from "@/lib/constants";
import { computeGraduationYear } from "@/lib/graduation";
import { onSignupCompleted, onSignupStarted } from "@/lib/events";
import { getOrCreatePreferences } from "@/lib/notifications";

const SignupSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(40),
    lastName: z.string().trim().min(1, "Last name is required").max(40),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8, "At least 8 characters").max(128),
    grade: z.coerce.number().int().refine((n) => (GRADES as readonly number[]).includes(n), "Pick a grade 9-12"),
    section: z.enum(SECTIONS),
    primaryInstrument: z.string().trim().min(1).max(60),
    marchingInstrument: z
      .string()
      .trim()
      .max(60)
      .optional()
      .transform((v) => (v ? v : null)),
    inviteCode: z.string().trim().min(1, "Invite code required").max(32),
    tosAccepted: z
      .string()
      .optional()
      .transform((v) => v === "on" || v === "true"),
  })
  .superRefine((data, ctx) => {
    if (!data.tosAccepted) {
      ctx.addIssue({ code: "custom", path: ["tosAccepted"], message: "Please accept the terms and privacy policy." });
    }
  });

export interface AuthState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const h = await headers();
  const ip = ipFromHeaders(h);

  await onSignupStarted({ ip });

  const rl = rateLimit(`signup:${ip}`, 8, 60 * 60);
  if (!rl.ok) {
    await logSignupAttempt({ ip, success: false, reason: "rate_limited" });
    return { error: "Too many signup attempts. Try again in an hour." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = SignupSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const p = issue.path.join(".") || "_";
      if (!fieldErrors[p]) fieldErrors[p] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const input = parsed.data;

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
  if (existing.length) {
    await logSignupAttempt({ email: input.email, ip, codeUsed: input.inviteCode, success: false, reason: "email_exists" });
    return { error: "An account with that email already exists. Try signing in." };
  }

  const [code] = await db
    .select()
    .from(inviteCodes)
    .where(and(eq(inviteCodes.code, input.inviteCode), eq(inviteCodes.active, true)))
    .limit(1);
  if (!code) {
    await logSignupAttempt({ email: input.email, ip, codeUsed: input.inviteCode, success: false, reason: "bad_code" });
    return { error: "That invite code isn't active. Ask your section leader or drum major for the current one." };
  }

  const codeRl = rateLimit(`code:${input.inviteCode}`, 40, 60 * 60);
  if (!codeRl.ok) {
    await logSignupAttempt({ email: input.email, ip, codeUsed: input.inviteCode, success: false, reason: "code_rate_limited" });
    return { error: "This invite code is being used too heavily. Please try again later." };
  }

  const id = newId();
  const passwordHash = await hashPassword(input.password);
  const graduationYear = computeGraduationYear(input.grade);

  // Auto-approve everyone — admin approval gate is off for now.
  // Re-enable by setting status to "pending" (11-12) or "awaiting_parent_consent" (9-10).
  const status = "approved" as const;

  await db.insert(users).values({
    id,
    email: input.email,
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    grade: input.grade,
    section: input.section,
    primaryInstrument: input.primaryInstrument,
    marchingInstrument: input.marchingInstrument,
    role: "student",
    status,
    graduationYear,
    approvedAt: new Date(),
  });
  await db.insert(profiles).values({ userId: id });
  await getOrCreatePreferences(id);

  await logSignupAttempt({ email: input.email, ip, codeUsed: input.inviteCode, success: true });
  await logAudit({ actorUserId: id, action: "signup", targetType: "user", targetId: id, metadata: { ip, autoApproved: true } });
  await onSignupCompleted(id);

  await setSessionCookie(id, "student", status);
  redirect("/onboarding");
}

const SigninSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function signin(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const h = await headers();
  const ip = ipFromHeaders(h);
  const rl = rateLimit(`signin:${ip}`, 10, 15 * 60);
  if (!rl.ok) return { error: "Too many sign-in attempts. Try again shortly." };

  const parsed = SigninSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (!user) return { error: "That email and password don't match." };
  if (user.status === "deleted_pending") return { error: "This account is being deleted. If this was a mistake, contact your director." };
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return { error: "That email and password don't match." };

  await setSessionCookie(user.id, user.role, user.status);

  if (user.status === "awaiting_parent_consent") redirect("/pending?state=parent");
  if (user.status === "pending") redirect("/pending");
  if (user.status === "inactive") return { error: "This account has been deactivated. Talk to your director." };
  if (user.status === "alumni" && !user.onboardingCompletedAt) redirect("/onboarding");
  if (!user.onboardingCompletedAt) redirect("/onboarding");
  redirect("/directory");
}

export async function signout() {
  await clearSessionCookie();
  redirect("/");
}
