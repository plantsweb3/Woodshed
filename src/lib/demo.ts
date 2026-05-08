/*
 * Demo viewer mode — temporary, for tonight's drum major interview.
 *
 * Lets staff/directors walk the app without signing up. The demo user is a
 * regular approved member with role=student; isDemoUser() and the server
 * actions reject any write operation with a clean error.
 *
 * To remove demo mode after the interview:
 *   1) Delete /tmp/woodshed-prod-env.sh demo references
 *   2) Drop the demo user: DELETE FROM users WHERE email = 'demo@pieperhs.test';
 *   3) Remove src/lib/demo.ts, src/app/actions/demo.ts, src/components/demo-banner.tsx
 *   4) Remove the Demo button from src/app/page.tsx
 *   5) Remove isDemoUser checks from server actions (search for "isDemoUser")
 */
export const DEMO_EMAIL = "demo@pieperhs.test";

export function isDemoUser(user: { email?: string | null } | null | undefined) {
  return !!user && user.email === DEMO_EMAIL;
}

export const DEMO_BLOCKED = "Read-only demo mode — sign up with the invite code to participate.";
