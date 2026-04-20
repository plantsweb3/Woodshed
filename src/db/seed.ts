import "dotenv/config";
import { db } from "./index";
import { users, profiles, inviteCodes, mentorRequests, opportunities } from "./schema";
import { hashPassword } from "../lib/auth";
import { newId } from "../lib/ids";
import { computeGraduationYear } from "../lib/graduation";
import { eq } from "drizzle-orm";

/*
 * Seed the DB with a realistic-looking demo set — director, Hailey as drum major,
 * 5 upperclassmen spread across sections, a couple of opportunities, and one open mentor request.
 * Safe to re-run: it checks each seed row before inserting.
 */

const DEMO_CODE = "WOOD-SHED";

async function ensureUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  grade: number;
  section: string;
  primaryInstrument: string;
  marchingInstrument?: string | null;
  role: "student" | "section_leader" | "drum_major" | "director";
  profile?: Partial<{
    bio: string;
    mentorAvailable: boolean;
    mentorSkills: string[];
    outsideEnsembles: Array<{ name: string; startYear?: number | null; notes?: string | null }>;
    privateLessons: Array<{ teacher: string; focus?: string | null }>;
    achievements: Array<{ title: string; year?: number | null; detail?: string | null }>;
    featured: boolean;
  }>;
}) {
  const [existing] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (existing) return existing.id;
  const id = newId();
  const passwordHash = await hashPassword(input.password);
  const gradYear = input.role === "director" ? null : computeGraduationYear(input.grade);
  await db.insert(users).values({
    id,
    email: input.email,
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    grade: input.grade,
    section: input.section,
    primaryInstrument: input.primaryInstrument,
    marchingInstrument: input.marchingInstrument ?? null,
    role: input.role,
    status: "approved",
    approvedAt: new Date(),
    onboardingCompletedAt: new Date(),
    graduationYear: gradYear,
  });
  await db.insert(profiles).values({
    userId: id,
    bio: input.profile?.bio,
    mentorAvailable: input.profile?.mentorAvailable ?? false,
    mentorSkills: input.profile?.mentorSkills ?? [],
    outsideEnsembles: input.profile?.outsideEnsembles ?? [],
    privateLessons: input.profile?.privateLessons ?? [],
    achievements: input.profile?.achievements ?? [],
    featured: input.profile?.featured ?? false,
  });
  return id;
}

async function main() {
  console.log("→ Seeding Woodshed…");

  // 1) Invite code
  const [existingCode] = await db.select().from(inviteCodes).where(eq(inviteCodes.code, DEMO_CODE)).limit(1);
  if (!existingCode) {
    // Deactivate any current active
    await db.update(inviteCodes).set({ active: false, rotatedAt: new Date() }).where(eq(inviteCodes.active, true));
    await db.insert(inviteCodes).values({ id: newId(), code: DEMO_CODE, active: true });
    console.log(`   ✓ Invite code: ${DEMO_CODE}`);
  } else if (!existingCode.active) {
    await db.update(inviteCodes).set({ active: true, rotatedAt: null }).where(eq(inviteCodes.id, existingCode.id));
    console.log(`   ✓ Invite code reactivated: ${DEMO_CODE}`);
  } else {
    console.log(`   • Invite code present: ${DEMO_CODE}`);
  }

  // 2) Director (Mr. Barry — placeholder)
  const directorId = await ensureUser({
    email: process.env.SEED_DIRECTOR_EMAIL ?? "director@pieperhs.test",
    password: process.env.SEED_DIRECTOR_PASSWORD ?? "director-demo-password",
    firstName: "Mr.",
    lastName: "Barry",
    grade: 12,
    section: "Battery Percussion",
    primaryInstrument: "Other",
    role: "director",
    profile: { bio: "Director of bands. Placeholder account — replace with real info before rollout." },
  });
  console.log(`   ✓ Director seeded (id=${directorId.slice(0, 8)}…)`);

  // 3) Drum major — Hailey
  const haileyId = await ensureUser({
    email: process.env.SEED_DRUM_MAJOR_EMAIL ?? "hailey@pieperhs.test",
    password: process.env.SEED_DRUM_MAJOR_PASSWORD ?? "hailey-demo-password",
    firstName: "Hailey",
    lastName: "M.",
    grade: 11,
    section: "Flute",
    primaryInstrument: "Flute",
    marchingInstrument: "Drum Major",
    role: "drum_major",
    profile: {
      bio: "I built this so we can see each other's work. BAND has the schedule. This is for the shed.",
      mentorAvailable: true,
      mentorSkills: ["Marching fundamentals", "Audition prep", "Practice habits"],
      outsideEnsembles: [{ name: "SAYWE — Flute", startYear: 2024 }],
      achievements: [
        { title: "TMEA All-Region Band", year: 2025, detail: "Advanced to area" },
        { title: "Solo & Ensemble — Class I", year: 2025, detail: "Division 1" },
      ],
      featured: true,
    },
  });
  console.log("   ✓ Drum major (Hailey) seeded");

  // 4) Demo upperclassmen
  const demos = await Promise.all([
    ensureUser({
      email: "fred2@pieperhs.test",
      password: "demo-password",
      firstName: "Fred",
      lastName: "Two",
      grade: 12,
      section: "Trumpet",
      primaryInstrument: "Trumpet",
      marchingInstrument: "Trumpet",
      role: "section_leader",
      profile: {
        bio: "Quiet about it, but the practice is real. Happy to run All-State etudes with anyone who's serious.",
        mentorAvailable: true,
        mentorSkills: ["All-State audition prep", "Brass technique", "Mental game"],
        outsideEnsembles: [
          { name: "SAYWE Symphonic Winds", startYear: 2023 },
          { name: "UIW Honor Band", startYear: 2024 },
        ],
        privateLessons: [{ teacher: "Sam Reyna", focus: "Classical trumpet" }],
        achievements: [
          { title: "TMEA All-State Symphonic Band", year: 2025, detail: "7th chair" },
          { title: "TMEA All-Region", year: 2024 },
          { title: "Solo & Ensemble — Class I", year: 2024, detail: "Division 1" },
        ],
        featured: true,
      },
    }),
    ensureUser({
      email: "mia@pieperhs.test",
      password: "demo-password",
      firstName: "Mia",
      lastName: "Okoro",
      grade: 12,
      section: "Clarinet",
      primaryInstrument: "Clarinet",
      marchingInstrument: "Clarinet",
      role: "section_leader",
      profile: {
        bio: "Three straight years of All-Region. Love working with freshmen on tone production.",
        mentorAvailable: true,
        mentorSkills: ["Clarinet technique", "Audition prep", "Sight-reading"],
        outsideEnsembles: [{ name: "San Antonio Youth Symphony", startYear: 2023 }],
        achievements: [
          { title: "TMEA All-Region Band", year: 2025, detail: "2nd chair" },
          { title: "TMEA All-Region Band", year: 2024, detail: "4th chair" },
          { title: "Solo & Ensemble — Class I", year: 2025, detail: "Division 1" },
        ],
        featured: true,
      },
    }),
    ensureUser({
      email: "jalen@pieperhs.test",
      password: "demo-password",
      firstName: "Jalen",
      lastName: "Ramos",
      grade: 11,
      section: "Battery Percussion",
      primaryInstrument: "Percussion",
      marchingInstrument: "Snare",
      role: "student",
      profile: {
        bio: "Mallet and snare. DCI camp last summer opened my eyes to what's possible.",
        mentorAvailable: true,
        mentorSkills: ["Marching fundamentals", "Percussion technique", "DCI audition prep"],
        outsideEnsembles: [{ name: "Genesis DCI Rookie Camp", startYear: 2025 }],
        achievements: [{ title: "Solo & Ensemble — Class I", year: 2025, detail: "Division 1, mallet solo" }],
      },
    }),
    ensureUser({
      email: "ava@pieperhs.test",
      password: "demo-password",
      firstName: "Ava",
      lastName: "Chen",
      grade: 10,
      section: "Horn",
      primaryInstrument: "French Horn",
      marchingInstrument: "Mellophone",
      role: "student",
      profile: {
        bio: "Sophomore, first year on mellophone. Working on endurance and high range.",
        mentorAvailable: false,
        achievements: [{ title: "TMEA All-Region Band", year: 2025, detail: "First time" }],
      },
    }),
    ensureUser({
      email: "diego@pieperhs.test",
      password: "demo-password",
      firstName: "Diego",
      lastName: "Salas",
      grade: 9,
      section: "Saxophone",
      primaryInstrument: "Alto Saxophone",
      marchingInstrument: "Alto Saxophone",
      role: "student",
      profile: {
        bio: "Freshman year. Trying to figure out what's possible in this program.",
        mentorAvailable: false,
      },
    }),
  ]);

  console.log(`   ✓ ${demos.length} demo members`);

  // 5) Opportunities
  const existingOpps = await db.select().from(opportunities);
  if (existingOpps.length === 0) {
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    const in60 = new Date();
    in60.setDate(in60.getDate() + 60);
    const in14 = new Date();
    in14.setDate(in14.getDate() + 14);

    await db.insert(opportunities).values([
      {
        id: newId(),
        title: "SAYWE Spring Auditions",
        description:
          "San Antonio Youth Wind Ensembles opens spring auditions for next season. All winds and percussion eligible. Excerpts posted on the SAYWE site mid-April.",
        opportunityType: "outside_audition",
        link: "https://example.org/saywe-auditions",
        deadlineDate: in30,
        sections: ["Flute", "Clarinet", "Saxophone", "Trumpet", "Horn", "Trombone", "Low Brass", "Battery Percussion", "Front Ensemble"],
        instruments: [],
        postedBy: haileyId,
      },
      {
        id: newId(),
        title: "Genesis DCI Rookie Camp",
        description:
          "Two-day camp introducing DCI fundamentals — marching, technique, and audition prep. For brass, percussion, and guard. No prior DCI experience required.",
        opportunityType: "dci_camp",
        link: "https://example.org/genesis-rookie",
        deadlineDate: in60,
        sections: ["Trumpet", "Horn", "Trombone", "Low Brass", "Battery Percussion", "Color Guard"],
        postedBy: directorId,
      },
      {
        id: newId(),
        title: "UIW Wind Symposium — Student day",
        description:
          "Masterclasses with UIW faculty, open to high school musicians in woodwinds and brass. Free with registration. Great intro to the UIW program.",
        opportunityType: "college_clinic",
        link: "https://example.org/uiw-symposium",
        deadlineDate: in14,
        sections: ["Flute", "Clarinet", "Saxophone", "Double Reed", "Trumpet", "Horn", "Trombone", "Low Brass"],
        postedBy: haileyId,
      },
    ]);
    console.log("   ✓ 3 opportunities");
  }

  // 6) One open mentor request
  const existingReqs = await db.select().from(mentorRequests);
  if (existingReqs.length === 0 && demos[4]) {
    await db.insert(mentorRequests).values({
      id: newId(),
      requesterId: demos[4]!, // Diego the freshman
      targetId: null,
      skill: "Marching fundamentals",
      description:
        "I'm struggling with set position and the slide step. I can follow in rehearsal but when I'm alone I can tell my fundamentals aren't there yet. Any upperclassman who's been through this?",
      urgency: "casual",
      status: "open",
    });
    console.log("   ✓ 1 open mentor request");
  }

  console.log("\nDone. Demo logins:");
  console.log(`  • director   ${process.env.SEED_DIRECTOR_EMAIL ?? "director@pieperhs.test"}`);
  console.log(`  • drum_major ${process.env.SEED_DRUM_MAJOR_EMAIL ?? "hailey@pieperhs.test"}`);
  console.log(`  • student    mia@pieperhs.test / fred2@pieperhs.test / jalen@pieperhs.test / ava@pieperhs.test / diego@pieperhs.test`);
  console.log(`  • invite code for new signups: ${DEMO_CODE}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
