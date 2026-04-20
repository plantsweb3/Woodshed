import { and, desc, eq, isNull, inArray } from "drizzle-orm";
import { db } from "@/db";
import { notifications, notificationPreferences } from "@/db/schema";
import { newId } from "./ids";

export interface CreateNotification {
  userId: string;
  category: string;
  title: string;
  body?: string;
  link?: string;
}

export async function createInAppNotification(input: CreateNotification) {
  await db.insert(notifications).values({
    id: newId(),
    userId: input.userId,
    category: input.category,
    title: input.title,
    body: input.body,
    link: input.link,
  });
}

export async function listNotifications(userId: string, opts?: { limit?: number; unreadOnly?: boolean }) {
  const conds = [eq(notifications.userId, userId)];
  if (opts?.unreadOnly) conds.push(isNull(notifications.readAt));
  return db
    .select()
    .from(notifications)
    .where(and(...conds))
    .orderBy(desc(notifications.createdAt))
    .limit(opts?.limit ?? 20);
}

export async function unreadCount(userId: string) {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return rows.length;
}

export async function markAllRead(userId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}

export async function markRead(userId: string, ids: string[]) {
  if (!ids.length) return;
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), inArray(notifications.id, ids)));
}

export async function getOrCreatePreferences(userId: string) {
  const [existing] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1);
  if (existing) return existing;
  await db.insert(notificationPreferences).values({ userId }).onConflictDoNothing();
  const [created] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1);
  return created!;
}
