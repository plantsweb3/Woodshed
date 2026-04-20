/*
 * Central event dispatcher — consolidates notification, email, milestone, and telemetry
 * fanout for app events. Keeps action files focused on their core mutation and lets us
 * evolve the fanout (batch emails, digest windows, new channels) in one place.
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, notificationPreferences, reports } from "@/db/schema";
import { createInAppNotification, getOrCreatePreferences } from "./notifications";
import { sendEmail } from "./email";
import { captureServerEvent } from "./telemetry";
import { awardMilestone } from "./milestones";
import { appUrl } from "./urls";
import { SignupApprovedEmail } from "@/emails/signup-approved";
import { SignupRejectedEmail } from "@/emails/signup-rejected";
import { MentorRequestDirectEmail } from "@/emails/mentor-request-direct";
import { MentorOfferAcceptedEmail } from "@/emails/mentor-offer-accepted";
import { FeaturedNoticeEmail } from "@/emails/featured-notice";
import { ZeroToleranceEmail } from "@/emails/zero-tolerance";

async function prefs(userId: string) {
  return await getOrCreatePreferences(userId);
}

async function userOrNull(userId: string) {
  const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return u ?? null;
}

export async function onSignupStarted(meta: { ip?: string }) {
  await captureServerEvent({ distinctId: `ip:${meta.ip ?? "unknown"}`, event: "signup_started" });
}

export async function onSignupCompleted(userId: string) {
  await captureServerEvent({ distinctId: userId, event: "signup_completed" });
}

export async function onSignupApproved(userId: string, actorId: string) {
  const user = await userOrNull(userId);
  if (!user) return;
  const p = await prefs(userId);
  await createInAppNotification({
    userId,
    category: "signup_approved",
    title: "You're in. Set up your profile.",
    body: "A drum major just approved your account. Take the 2-minute setup so the directory can see you properly.",
    link: "/onboarding",
  });
  if (p.emailSignupApproved) {
    await sendEmail({
      to: user.email,
      subject: "You're in — The Woodshed",
      component: SignupApprovedEmail({ firstName: user.firstName, appUrl: appUrl() }),
      actorUserId: actorId,
      targetUserId: userId,
      category: "signup_approved",
    });
  }
  await captureServerEvent({ distinctId: userId, event: "signup_approved" });
}

export async function onSignupRejected(email: string, firstName: string, actorId: string) {
  await sendEmail({
    to: email,
    subject: "About your Woodshed signup",
    component: SignupRejectedEmail({ firstName }),
    actorUserId: actorId,
    category: "signup_rejected",
  });
}

export async function onMentorRequestCreated(requestId: string, requesterId: string, skill: string, urgency: string, description: string, targetId: string | null) {
  if (targetId) {
    const target = await userOrNull(targetId);
    const requester = await userOrNull(requesterId);
    if (target && requester) {
      const p = await prefs(target.id);
      await createInAppNotification({
        userId: target.id,
        category: "mentor_request_direct",
        title: `${requester.firstName} asked for your help on ${skill}`,
        body: description.slice(0, 160),
        link: "/mentorship",
      });
      if (p.emailMentorRequestDirect) {
        await sendEmail({
          to: target.email,
          subject: `Mentor request: ${skill}`,
          component: MentorRequestDirectEmail({
            mentorFirstName: target.firstName,
            requesterName: `${requester.firstName} ${requester.lastName}`,
            skill,
            urgency,
            description,
            appUrl: appUrl(),
          }),
          targetUserId: target.id,
          category: "mentor_request_direct",
        });
      }
    }
  }
  await captureServerEvent({ distinctId: requesterId, event: "mentor_request_posted", properties: { direct: !!targetId, skill, urgency } });
}

export async function onMentorRequestClaimed(requestId: string, requesterId: string, mentorId: string, skill: string) {
  const requester = await userOrNull(requesterId);
  const mentor = await userOrNull(mentorId);
  if (!requester || !mentor) return;
  const p = await prefs(requester.id);
  await createInAppNotification({
    userId: requester.id,
    category: "mentor_offer_accepted",
    title: `${mentor.firstName} ${mentor.lastName} offered to help on ${skill}`,
    body: "Find them at rehearsal. The work happens offline from here.",
    link: "/mentorship",
  });
  if (p.emailMentorOfferAccepted) {
    await sendEmail({
      to: requester.email,
      subject: "Someone picked up your request",
      component: MentorOfferAcceptedEmail({
        requesterFirstName: requester.firstName,
        mentorName: `${mentor.firstName} ${mentor.lastName}`,
        skill,
        appUrl: appUrl(),
      }),
      targetUserId: requester.id,
      category: "mentor_offer_accepted",
    });
  }
  await awardMilestone(mentorId, { type: "mentor_first_offer", dedupeKey: "mentor_first_offer", title: "Mentored your first student" });
  await captureServerEvent({ distinctId: mentorId, event: "mentor_offer_accepted", properties: { skill } });
}

export async function onFeaturedAdded(userId: string, actorId: string) {
  const user = await userOrNull(userId);
  if (!user) return;
  await createInAppNotification({
    userId,
    category: "featured",
    title: "You've been featured this week.",
    body: "You're at the top of the directory. Younger students are seeing your work first — make sure it's current.",
    link: "/profile",
  });
  await sendEmail({
    to: user.email,
    subject: "You've been featured on The Woodshed",
    component: FeaturedNoticeEmail({ firstName: user.firstName, appUrl: appUrl() }),
    actorUserId: actorId,
    targetUserId: userId,
    category: "featured",
  });
  await awardMilestone(userId, { type: "featured_first", dedupeKey: "featured_first", title: "Earned your first featured placement" });
}

export async function onZeroToleranceReport(input: {
  reportId: string;
  reason: string;
  targetUserName: string;
  reporterName: string | null;
  excerpt: string;
}) {
  // Find the director to email.
  const [director] = await db.select().from(users).where(eq(users.role, "director")).limit(1);
  if (!director) return;
  const p = await prefs(director.id);
  if (!p.emailZeroTolerance) return;
  await sendEmail({
    to: director.email,
    subject: `[URGENT] Zero-tolerance report: ${input.reason.replace("_", " ")}`,
    component: ZeroToleranceEmail({
      reason: input.reason,
      targetUserName: input.targetUserName,
      reporterName: input.reporterName,
      excerpt: input.excerpt,
      appUrl: appUrl(),
    }),
    targetUserId: director.id,
    category: "zero_tolerance",
  });
  await createInAppNotification({
    userId: director.id,
    category: "zero_tolerance",
    title: `Urgent review: ${input.reason.replace("_", " ")} flagged`,
    body: input.excerpt.slice(0, 160),
    link: "/admin/moderation",
  });
}

export async function onOnboardingCompleted(userId: string) {
  await awardMilestone(userId, { type: "profile_complete", dedupeKey: "profile_complete", title: "Completed your profile" });
  await captureServerEvent({ distinctId: userId, event: "profile_published" });
}

// Silences warnings for as-yet-unused helper imports.
void reports;
void notificationPreferences;
