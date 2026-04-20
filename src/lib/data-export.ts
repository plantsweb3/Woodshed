import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  profiles,
  mentorRequests,
  practiceLogs,
  milestones,
  notifications,
  opportunities,
} from "@/db/schema";

export async function buildUserExport(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

  const mentorRows = await db
    .select()
    .from(mentorRequests)
    .where(or(eq(mentorRequests.requesterId, userId), eq(mentorRequests.claimedBy, userId)));

  const practice = await db.select().from(practiceLogs).where(eq(practiceLogs.userId, userId));
  const mine_milestones = await db.select().from(milestones).where(eq(milestones.userId, userId));
  const myNotifications = await db.select().from(notifications).where(eq(notifications.userId, userId));

  const postedOpps = await db.select().from(opportunities).where(eq(opportunities.postedBy, userId));

  // Strip sensitive server-only fields.
  const safeUser = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    grade: user.grade,
    section: user.section,
    primaryInstrument: user.primaryInstrument,
    marchingInstrument: user.marchingInstrument,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    approvedAt: user.approvedAt,
    onboardingCompletedAt: user.onboardingCompletedAt,
    parentEmail: user.parentEmail,
    graduationYear: user.graduationYear,
    alumniSince: user.alumniSince,
    profileVisible: user.profileVisible,
  };

  return {
    exportedAt: new Date().toISOString(),
    exportVersion: 1,
    user: safeUser,
    profile: profile ?? null,
    mentorRequests: mentorRows,
    practiceLogs: practice,
    milestones: mine_milestones,
    notifications: myNotifications,
    postedOpportunities: postedOpps,
  };
}
