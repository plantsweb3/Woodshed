import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

/* ---------- users + profiles ---------- */

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    grade: integer("grade").notNull(),
    section: text("section").notNull(),
    primaryInstrument: text("primary_instrument").notNull(),
    marchingInstrument: text("marching_instrument"),
    role: text("role", { enum: ["student", "section_leader", "drum_major", "director"] })
      .notNull()
      .default("student"),
    status: text("status", {
      enum: ["pending", "approved", "inactive", "awaiting_parent_consent", "alumni", "deleted_pending"],
    })
      .notNull()
      .default("pending"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    approvedAt: integer("approved_at", { mode: "timestamp" }),
    approvedBy: text("approved_by"),
    onboardingCompletedAt: integer("onboarding_completed_at", { mode: "timestamp" }),

    // COPPA: parent_email is only present for grade 9-10 signups.
    parentEmail: text("parent_email"),

    // Graduation: auto-computed from grade + signup year. See lib/graduation.ts.
    graduationYear: integer("graduation_year"),
    alumniSince: integer("alumni_since", { mode: "timestamp" }),
    profileVisible: integer("profile_visible", { mode: "boolean" }).notNull().default(true),

    // Soft-delete with 7-day grace.
    deletedAt: integer("deleted_at", { mode: "timestamp" }),

    // Social surface — avatar image (data URL or remote), short live status.
    avatarUrl: text("avatar_url"),
    workingOn: text("working_on"),
  },
  (t) => ({
    statusIdx: index("users_status_idx").on(t.status),
    sectionIdx: index("users_section_idx").on(t.section),
    gradYearIdx: index("users_grad_year_idx").on(t.graduationYear),
  })
);

export const profiles = sqliteTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  mentorAvailable: integer("mentor_available", { mode: "boolean" }).notNull().default(false),
  mentorSkills: text("mentor_skills", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  outsideEnsembles: text("outside_ensembles", { mode: "json" })
    .$type<Array<{ name: string; startYear?: number | null; notes?: string | null }>>()
    .notNull()
    .default(sql`'[]'`),
  privateLessons: text("private_lessons", { mode: "json" })
    .$type<Array<{ teacher: string; focus?: string | null }>>()
    .notNull()
    .default(sql`'[]'`),
  achievements: text("achievements", { mode: "json" })
    .$type<Array<{ title: string; year?: number | null; detail?: string | null }>>()
    .notNull()
    .default(sql`'[]'`),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  featuredUntil: integer("featured_until", { mode: "timestamp" }),
  hiddenAt: integer("hidden_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
});

/* ---------- invite codes ---------- */

export const inviteCodes = sqliteTable(
  "invite_codes",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    rotatedAt: integer("rotated_at", { mode: "timestamp" }),
    createdBy: text("created_by"),
  },
  (t) => ({
    codeUnique: uniqueIndex("invite_codes_code_unique").on(t.code),
    activeIdx: index("invite_codes_active_idx").on(t.active),
  })
);

/* ---------- mentor requests ---------- */

export const mentorRequests = sqliteTable(
  "mentor_requests",
  {
    id: text("id").primaryKey(),
    requesterId: text("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetId: text("target_id").references(() => users.id, { onDelete: "set null" }),
    skill: text("skill").notNull(),
    description: text("description").notNull(),
    urgency: text("urgency", { enum: ["casual", "upcoming_audition", "this_week"] })
      .notNull()
      .default("casual"),
    status: text("status", { enum: ["open", "claimed", "closed"] })
      .notNull()
      .default("open"),
    claimedBy: text("claimed_by").references(() => users.id, { onDelete: "set null" }),
    claimedAt: integer("claimed_at", { mode: "timestamp" }),
    hiddenAt: integer("hidden_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => ({
    statusIdx: index("mentor_requests_status_idx").on(t.status),
    requesterIdx: index("mentor_requests_requester_idx").on(t.requesterId),
  })
);

/* ---------- opportunities ---------- */

export const opportunities = sqliteTable(
  "opportunities",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    deadlineDate: integer("deadline_date", { mode: "timestamp" }),
    description: text("description").notNull(),
    opportunityType: text("opportunity_type").notNull(),
    sections: text("sections", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    instruments: text("instruments", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    link: text("link"),
    postedBy: text("posted_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => ({
    deadlineIdx: index("opportunities_deadline_idx").on(t.deadlineDate),
  })
);

/* ---------- practice logs / sheds ---------- */

export const practiceLogs = sqliteTable(
  "practice_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: integer("date", { mode: "timestamp" }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    workedOn: text("worked_on").notNull(),
    notes: text("notes"),
    visibility: text("visibility", { enum: ["private", "section", "band"] })
      .notNull()
      .default("private"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => ({
    userDateIdx: index("practice_logs_user_date_idx").on(t.userId, t.date),
    visibilityIdx: index("practice_logs_visibility_idx").on(t.visibility),
    createdAtIdx: index("practice_logs_created_at_idx").on(t.createdAt),
  })
);

/* ---------- resources (Phase 2 UI) ---------- */

export const resources = sqliteTable("resources", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  link: text("link"),
  fileUrl: text("file_url"),
  postedBy: text("posted_by")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
});

/* ---------- messaging (Phase 2 UI) ---------- */

export const threads = sqliteTable("threads", {
  id: text("id").primaryKey(),
  userAId: text("user_a_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userBId: text("user_b_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  contextType: text("context_type"),
  contextId: text("context_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
});

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => ({
    threadIdx: index("messages_thread_idx").on(t.threadId, t.createdAt),
  })
);

/* ---------- drum major private notes (Phase 3) ---------- */

export const drumMajorNotes = sqliteTable(
  "drum_major_notes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    bodyMarkdownEncrypted: text("body_markdown_encrypted").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => ({
    userIdx: index("drum_major_notes_user_idx").on(t.userId),
  })
);

/* ---------- audit / security ---------- */

export const signupAttempts = sqliteTable(
  "signup_attempts",
  {
    id: text("id").primaryKey(),
    email: text("email"),
    ip: text("ip"),
    codeUsed: text("code_used"),
    success: integer("success", { mode: "boolean" }).notNull(),
    reason: text("reason"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => ({
    ipIdx: index("signup_attempts_ip_idx").on(t.ip, t.createdAt),
  })
);

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>().default(sql`'{}'`),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => ({
    actorIdx: index("audit_log_actor_idx").on(t.actorUserId, t.createdAt),
  })
);

/* ---------- sessions ---------- */

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userAgent: text("user_agent"),
    ip: text("ip"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    lastSeenAt: integer("last_seen_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    revokedAt: integer("revoked_at", { mode: "timestamp" }),
  },
  (t) => ({
    userIdx: index("sessions_user_idx").on(t.userId, t.revokedAt),
  })
);

/* ---------- parent consent (COPPA) ---------- */

export const parentConsents = sqliteTable(
  "parent_consents",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentEmail: text("parent_email").notNull(),
    token: text("token").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    consentedAt: integer("consented_at", { mode: "timestamp" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    revokedAt: integer("revoked_at", { mode: "timestamp" }),
  },
  (t) => ({
    tokenUnique: uniqueIndex("parent_consents_token_unique").on(t.token),
    userIdx: index("parent_consents_user_idx").on(t.userId),
  })
);

/* ---------- notifications ---------- */

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    link: text("link"),
    readAt: integer("read_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => ({
    userUnreadIdx: index("notifications_user_unread_idx").on(t.userId, t.readAt),
    userCreatedIdx: index("notifications_user_created_idx").on(t.userId, t.createdAt),
  })
);

export const notificationPreferences = sqliteTable("notification_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  emailMentorRequestDirect: integer("email_mentor_request_direct", { mode: "boolean" })
    .notNull()
    .default(true),
  emailMentorOfferAccepted: integer("email_mentor_offer_accepted", { mode: "boolean" })
    .notNull()
    .default(true),
  emailSignupApproved: integer("email_signup_approved", { mode: "boolean" }).notNull().default(true),
  emailSignupRejected: integer("email_signup_rejected", { mode: "boolean" }).notNull().default(true),
  emailZeroTolerance: integer("email_zero_tolerance", { mode: "boolean" }).notNull().default(true),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
});

/* ---------- moderation ---------- */

export const reports = sqliteTable(
  "reports",
  {
    id: text("id").primaryKey(),
    reporterId: text("reporter_id").references(() => users.id, { onDelete: "set null" }),
    targetType: text("target_type").notNull(), // "profile" | "mentor_request" | "user"
    targetId: text("target_id").notNull(),
    targetUserId: text("target_user_id").references(() => users.id, { onDelete: "set null" }),
    reason: text("reason", { enum: ["harassment", "inappropriate", "spam", "self_harm", "threats", "sexual", "slur", "other"] })
      .notNull()
      .default("other"),
    description: text("description"),
    zeroTolerance: integer("zero_tolerance", { mode: "boolean" }).notNull().default(false),
    status: text("status", { enum: ["open", "dismissed", "actioned", "escalated"] })
      .notNull()
      .default("open"),
    resolution: text("resolution"),
    resolvedAt: integer("resolved_at", { mode: "timestamp" }),
    resolvedBy: text("resolved_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => ({
    statusIdx: index("reports_status_idx").on(t.status, t.createdAt),
    targetIdx: index("reports_target_idx").on(t.targetType, t.targetId),
  })
);

/* ---------- milestones (Part 7) ---------- */

export const milestones = sqliteTable(
  "milestones",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    dedupeKey: text("dedupe_key").notNull(), // e.g. "first_shed", "hours_10", "streak_30"
    earnedAt: integer("earned_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => ({
    userEarnedIdx: index("milestones_user_earned_idx").on(t.userId, t.earnedAt),
    userDedupeUnique: uniqueIndex("milestones_user_dedupe_unique").on(t.userId, t.dedupeKey),
  })
);

/* ---------- kudos (peer acknowledgement, non-competitive) ---------- */

export const kudos = sqliteTable(
  "kudos",
  {
    id: text("id").primaryKey(),
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: text("target_type", { enum: ["profile", "milestone"] }).notNull(),
    targetId: text("target_id").notNull(),
    // Who "owns" the target — denormalized so we can fetch counts per recipient quickly.
    recipientUserId: text("recipient_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => ({
    senderTargetUnique: uniqueIndex("kudos_sender_target_unique").on(t.fromUserId, t.targetType, t.targetId),
    targetIdx: index("kudos_target_idx").on(t.targetType, t.targetId),
    recipientIdx: index("kudos_recipient_idx").on(t.recipientUserId),
  })
);

/* ---------- relations ---------- */

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  notificationPreferences: one(notificationPreferences, {
    fields: [users.id],
    references: [notificationPreferences.userId],
  }),
  mentorRequests: many(mentorRequests, { relationName: "requester" }),
  opportunities: many(opportunities),
  practiceLogs: many(practiceLogs),
  sessions: many(sessions),
  notifications: many(notifications),
  milestones: many(milestones),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const mentorRequestsRelations = relations(mentorRequests, ({ one }) => ({
  requester: one(users, {
    fields: [mentorRequests.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  target: one(users, {
    fields: [mentorRequests.targetId],
    references: [users.id],
    relationName: "target",
  }),
  claimer: one(users, {
    fields: [mentorRequests.claimedBy],
    references: [users.id],
    relationName: "claimer",
  }),
}));

export const opportunitiesRelations = relations(opportunities, ({ one }) => ({
  poster: one(users, { fields: [opportunities.postedBy], references: [users.id] }),
}));

/* ---------- types ---------- */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type InviteCode = typeof inviteCodes.$inferSelect;
export type MentorRequest = typeof mentorRequests.$inferSelect;
export type Opportunity = typeof opportunities.$inferSelect;
export type PracticeLog = typeof practiceLogs.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type ParentConsent = typeof parentConsents.$inferSelect;
export type Kudos = typeof kudos.$inferSelect;
