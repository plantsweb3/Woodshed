import "dotenv/config";
import { db } from "./index";
import { users, profiles, inviteCodes, mentorRequests, opportunities, shoutouts } from "./schema";
import { hashPassword } from "../lib/auth";
import { newId } from "../lib/ids";
import { computeGraduationYear } from "../lib/graduation";
import { eq } from "drizzle-orm";

/*
 * Seed the prod or local DB with demo data:
 *  - Mr. Berry (Pieper director, real name swap from earlier "Mr. Barry" placeholder),
 *  - Hailey as drum major candidate,
 *  - 7 demo students across sections with realistic Pieper-flavored profiles,
 *  - 4 outside opportunities,
 *  - 2 open mentor requests, 1 claimed.
 *
 * Safe to re-run; ensureUser / dedupe checks before inserting.
 */

const DEMO_CODE = "WARRIORS-26";

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
  workingOn?: string;
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
    workingOn: input.workingOn ?? null,
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
  console.log("→ Seeding Woodshed (Pieper Band of Warriors)…");

  // 1) Invite code
  const [existingCode] = await db.select().from(inviteCodes).where(eq(inviteCodes.code, DEMO_CODE)).limit(1);
  if (!existingCode) {
    await db.update(inviteCodes).set({ active: false, rotatedAt: new Date() }).where(eq(inviteCodes.active, true));
    await db.insert(inviteCodes).values({ id: newId(), code: DEMO_CODE, active: true });
    console.log(`   ✓ Invite code: ${DEMO_CODE}`);
  } else if (!existingCode.active) {
    await db.update(inviteCodes).set({ active: true, rotatedAt: null }).where(eq(inviteCodes.id, existingCode.id));
    console.log(`   ✓ Invite code reactivated: ${DEMO_CODE}`);
  } else {
    console.log(`   • Invite code present: ${DEMO_CODE}`);
  }

  // 2) Director — Mr. Berry (real Pieper director per program site).
  const directorId = await ensureUser({
    email: process.env.SEED_DIRECTOR_EMAIL ?? "director@pieperhs.test",
    password: process.env.SEED_DIRECTOR_PASSWORD ?? "director-demo-password",
    firstName: "Mr.",
    lastName: "Berry",
    grade: 12,
    section: "Battery Percussion",
    primaryInstrument: "Other",
    role: "director",
    workingOn: "Building Pieper toward our first 6A season.",
    profile: { bio: "Director of Bands. Pieper Band of Warriors." },
  });
  console.log(`   ✓ Director (Mr. Berry) seeded`);

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
    workingOn: "All-Region prep + drum major audition fundamentals.",
    profile: {
      bio:
        "I built this for the Warriors. BAND has the rehearsal schedule. Woodshed is for the work everyone does between rehearsals — the hours, the lessons, the auditions, the camps. The thing other Pieper musicians never see.",
      mentorAvailable: true,
      mentorSkills: ["Marching fundamentals", "Audition prep", "Practice habits"],
      outsideEnsembles: [{ name: "SAYWE — Flute", startYear: 2024 }],
      privateLessons: [{ teacher: "TBD", focus: "Flute" }],
      achievements: [
        { title: "TMEA All-Region Band", year: 2025, detail: "Advanced to area" },
        { title: "Solo & Ensemble — Class I", year: 2025, detail: "Division 1" },
      ],
      featured: true,
    },
  });
  console.log("   ✓ Drum major (Hailey) seeded");

  // 4) Demo upperclassmen + underclassmen — Pieper-realistic.
  const fred2Id = await ensureUser({
    email: "fred2@pieperhs.test",
    password: "demo-password",
    firstName: "Fred",
    lastName: "Two",
    grade: 12,
    section: "Trumpet",
    primaryInstrument: "Trumpet",
    marchingInstrument: "Trumpet",
    role: "section_leader",
    workingOn: "All-State concert etude — Charlier №2.",
    profile: {
      bio: "Quiet about it but the practice is real. Happy to run All-State etudes with anyone who's serious. Lessons every Saturday morning since 9th grade.",
      mentorAvailable: true,
      mentorSkills: ["All-State audition prep", "Brass technique", "Mental game"],
      outsideEnsembles: [
        { name: "SAYWE Symphonic Winds", startYear: 2023 },
        { name: "Region 12 Honor Band", startYear: 2024 },
      ],
      privateLessons: [{ teacher: "Mr. Reyna", focus: "Classical trumpet" }],
      achievements: [
        { title: "TMEA All-State Symphonic Band", year: 2025, detail: "7th chair" },
        { title: "TMEA All-Region Band", year: 2024, detail: "1st chair" },
        { title: "Solo & Ensemble — Class I", year: 2024, detail: "Division 1" },
      ],
      featured: true,
    },
  });

  const miaId = await ensureUser({
    email: "mia@pieperhs.test",
    password: "demo-password",
    firstName: "Mia",
    lastName: "Okoro",
    grade: 12,
    section: "Clarinet",
    primaryInstrument: "Clarinet",
    marchingInstrument: "Clarinet",
    role: "section_leader",
    workingOn: "Auditioning for Trinity scholarship — Mozart concerto mvt I.",
    profile: {
      bio: "Three straight years of All-Region. Love working with freshmen on tone production and the basics nobody covers in rehearsal.",
      mentorAvailable: true,
      mentorSkills: ["Clarinet technique", "Audition prep", "Sight-reading", "Tone production"],
      outsideEnsembles: [
        { name: "San Antonio Youth Symphony", startYear: 2023 },
        { name: "SAYWE — Wind Symphony", startYear: 2024 },
      ],
      privateLessons: [{ teacher: "Dr. Chavez", focus: "Classical clarinet" }],
      achievements: [
        { title: "TMEA All-Region Band", year: 2025, detail: "2nd chair" },
        { title: "TMEA All-Region Band", year: 2024, detail: "4th chair" },
        { title: "Solo & Ensemble — Class I", year: 2025, detail: "Division 1" },
      ],
      featured: true,
    },
  });

  const jalenId = await ensureUser({
    email: "jalen@pieperhs.test",
    password: "demo-password",
    firstName: "Jalen",
    lastName: "Ramos",
    grade: 11,
    section: "Battery Percussion",
    primaryInstrument: "Percussion",
    marchingInstrument: "Snare",
    role: "section_leader",
    workingOn: "DCI audition prep — Genesis snare callback packet.",
    profile: {
      bio: "Mallet and snare. Genesis rookie camp last summer broke my brain — I came back understanding what real practice looks like.",
      mentorAvailable: true,
      mentorSkills: ["Marching fundamentals", "Percussion technique", "DCI audition prep"],
      outsideEnsembles: [{ name: "Genesis DCI — Rookie Camp", startYear: 2025 }],
      privateLessons: [{ teacher: "Mr. Lowe", focus: "Marching percussion" }],
      achievements: [
        { title: "Solo & Ensemble — Class I", year: 2025, detail: "Division 1, mallet solo" },
        { title: "TMEA All-Region Band", year: 2024 },
      ],
    },
  });

  const avaId = await ensureUser({
    email: "ava@pieperhs.test",
    password: "demo-password",
    firstName: "Ava",
    lastName: "Chen",
    grade: 10,
    section: "Horn",
    primaryInstrument: "French Horn",
    marchingInstrument: "Mellophone",
    role: "student",
    workingOn: "Building high range — long tones up to high C, daily.",
    profile: {
      bio: "Sophomore, first year on mello. Trying to do what the seniors do.",
      mentorAvailable: false,
      privateLessons: [{ teacher: "Ms. Patel", focus: "French horn" }],
      achievements: [{ title: "TMEA All-Region Band", year: 2025, detail: "First-time qualifier" }],
    },
  });

  const diegoId = await ensureUser({
    email: "diego@pieperhs.test",
    password: "demo-password",
    firstName: "Diego",
    lastName: "Salas",
    grade: 9,
    section: "Saxophone",
    primaryInstrument: "Alto Saxophone",
    marchingInstrument: "Alto Saxophone",
    role: "student",
    workingOn: "Slide step + set position. Nailing the basics.",
    profile: {
      bio: "Freshman. Just trying to figure out what's possible here.",
      mentorAvailable: false,
    },
  });

  const sofiaId = await ensureUser({
    email: "sofia@pieperhs.test",
    password: "demo-password",
    firstName: "Sofia",
    lastName: "Reyes",
    grade: 11,
    section: "Color Guard",
    primaryInstrument: "Voice",
    marchingInstrument: "Color Guard",
    role: "section_leader",
    workingOn: "Sabre choreo for next year's opener — solo work.",
    profile: {
      bio: "Guard captain in waiting. Spinning sabre since 8th grade. The sweat tax is real on guard side too.",
      mentorAvailable: true,
      mentorSkills: ["Color guard technique", "Mental game"],
      outsideEnsembles: [{ name: "Heat Winter Guard", startYear: 2024 }],
      achievements: [{ title: "TCGC Regional A — Silver", year: 2025 }],
    },
  });

  const danielId = await ensureUser({
    email: "daniel@pieperhs.test",
    password: "demo-password",
    firstName: "Daniel",
    lastName: "Park",
    grade: 11,
    section: "Low Brass",
    primaryInstrument: "Tuba",
    marchingInstrument: "Sousaphone",
    role: "student",
    workingOn: "Hindemith Sonata — last movement.",
    profile: {
      bio: "Sousa marching, tuba concert. I shed alone a lot. Trying to get loud about it.",
      mentorAvailable: true,
      mentorSkills: ["Brass technique", "Practice habits"],
      privateLessons: [{ teacher: "Mr. Salinas", focus: "Tuba" }],
      achievements: [{ title: "TMEA All-Region Band", year: 2025, detail: "1st chair tuba" }],
    },
  });

  console.log(`   ✓ 7 demo members`);

  // 5) Opportunities — calendar + Texas-specific
  const existingOpps = await db.select().from(opportunities);
  if (existingOpps.length === 0) {
    const in7 = new Date(); in7.setDate(in7.getDate() + 7);
    const in21 = new Date(); in21.setDate(in21.getDate() + 21);
    const in45 = new Date(); in45.setDate(in45.getDate() + 45);
    const in75 = new Date(); in75.setDate(in75.getDate() + 75);

    await db.insert(opportunities).values([
      {
        id: newId(),
        title: "TMEA All-State Audition — Etude packet release",
        description:
          "TMEA releases the official All-State etude packets for the upcoming audition cycle. Anyone serious about an All-State chair starts now — the cycle gets impossible if you wait for fall.",
        opportunityType: "outside_audition",
        link: "https://www.tmea.org/programs/all-state/",
        deadlineDate: in7,
        sections: [
          "Flute","Clarinet","Saxophone","Double Reed","Trumpet","Horn","Trombone","Low Brass","Battery Percussion","Front Ensemble",
        ],
        postedBy: haileyId,
      },
      {
        id: newId(),
        title: "SAYWE Spring Auditions",
        description:
          "San Antonio Youth Wind Ensembles spring audition cycle. Strong feeder for All-State and college prep — half our top auditioners are SAYWE members.",
        opportunityType: "outside_audition",
        link: "https://saywe.org",
        deadlineDate: in21,
        sections: [
          "Flute","Clarinet","Saxophone","Double Reed","Trumpet","Horn","Trombone","Low Brass","Battery Percussion","Front Ensemble",
        ],
        postedBy: haileyId,
      },
      {
        id: newId(),
        title: "Genesis DCI — Rookie Camp",
        description:
          "Two-day intro to DCI fundamentals: marching, technique, audition prep. Brass, percussion, and guard. No prior DCI experience required. This is what changed Jalen.",
        opportunityType: "dci_camp",
        link: "https://www.genesisdrumcorps.org",
        deadlineDate: in45,
        sections: ["Trumpet","Horn","Trombone","Low Brass","Battery Percussion","Color Guard"],
        postedBy: directorId,
      },
      {
        id: newId(),
        title: "Trinity University — Wind Symposium Student Day",
        description:
          "Masterclasses with Trinity faculty open to high school musicians in winds and brass. Free with registration. Pieper alumni track for college music programs starts here.",
        opportunityType: "college_clinic",
        link: "https://new.trinity.edu/academics/departments/music",
        deadlineDate: in75,
        sections: ["Flute","Clarinet","Saxophone","Double Reed","Trumpet","Horn","Trombone","Low Brass"],
        postedBy: haileyId,
      },
    ]);
    console.log("   ✓ 4 opportunities");
  }

  // 6) Mentor requests
  const existingReqs = await db.select().from(mentorRequests);
  if (existingReqs.length === 0) {
    await db.insert(mentorRequests).values([
      {
        id: newId(),
        requesterId: diegoId,
        targetId: null,
        skill: "Marching fundamentals",
        description:
          "I'm struggling with set position and the slide step. I can follow in rehearsal but when I'm alone I can tell my fundamentals aren't there yet. Any upperclassman who's been through this?",
        urgency: "casual",
        status: "open",
      },
      {
        id: newId(),
        requesterId: avaId,
        targetId: null,
        skill: "All-State audition prep",
        description:
          "First time auditioning for All-State next cycle. Want to prep right but I don't know what I don't know. Especially looking for someone who's done it on French horn / mello.",
        urgency: "upcoming_audition",
        status: "open",
      },
      {
        id: newId(),
        requesterId: avaId,
        targetId: fred2Id,
        skill: "Brass technique",
        description:
          "Hi Fred — heard you do this for clarinet kids too. I'm trying to extend high range without losing tone. Open to a 30 min session sometime.",
        urgency: "casual",
        status: "claimed",
        claimedBy: fred2Id,
        claimedAt: new Date(),
      },
    ]);
    console.log("   ✓ 3 mentor requests (1 claimed)");
  }

  // 7) Pending signups — so the approval queue isn't empty on demo day.
  const pendingFolks = [
    { firstName: "Marcus", lastName: "Holt", grade: 9, section: "Trumpet" as const, instrument: "Trumpet" },
    { firstName: "Priya", lastName: "Anand", grade: 10, section: "Clarinet" as const, instrument: "Clarinet" },
  ];
  for (const p of pendingFolks) {
    const email = `${p.firstName.toLowerCase()}@pieperhs.test`;
    const [exists] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (exists) continue;
    const id = newId();
    const passwordHash = await hashPassword("demo-password");
    await db.insert(users).values({
      id,
      email,
      passwordHash,
      firstName: p.firstName,
      lastName: p.lastName,
      grade: p.grade,
      section: p.section,
      primaryInstrument: p.instrument,
      marchingInstrument: p.instrument,
      role: "student",
      status: "pending",
      graduationYear: computeGraduationYear(p.grade),
    });
    await db.insert(profiles).values({ userId: id });
  }
  console.log(`   ✓ ${pendingFolks.length} pending signups`);

  // 8) Shoutouts — peer-led visibility, real and recent feeling.
  const existingShoutouts = await db.select().from(shoutouts);
  if (existingShoutouts.length === 0) {
    const seedShoutouts: Array<{ authorId: string; kind: "audition" | "lesson" | "honor" | "summer_program" | "camp" | "performance" | "other"; title: string; body?: string; daysAgo: number }> = [
      { authorId: fred2Id, kind: "honor", title: "Made TMEA All-State Symphonic Band — 7th chair.", body: "Charlier №2 was a beast all year. Whoever's working it for next cycle, hit me up — happy to walk through the bowed-arm passage that haunts me to this day.", daysAgo: 12 },
      { authorId: miaId, kind: "audition", title: "Auditioned for Trinity scholarship today.", body: "Mozart concerto first movement. Felt as ready as I'll ever be — we'll see. If anyone else is doing college auditions in the spring, let's start a Sunday lunch group.", daysAgo: 5 },
      { authorId: jalenId, kind: "camp", title: "Genesis DCI rookie camp last summer.", body: "I'm at Pieper because of the show, but I'm a serious musician because of those two days. If you're a brass or perc kid even thinking about DCI, the rookie camp is genuinely free — they want you there.", daysAgo: 30 },
      { authorId: avaId, kind: "honor", title: "First-time TMEA All-Region.", body: "Sophomore, mello, didn't expect to advance. Sat in lessons on Saturdays since freshman year. The 'maybe' kids should sign up for lessons. Worth it.", daysAgo: 18 },
      { authorId: sofiaId, kind: "performance", title: "Heat Winter Guard regional silver.", body: "Spinning sabre since 8th grade. Guard side gets the same sweat tax as winds + brass — happy to mentor any guard freshman next year.", daysAgo: 9 },
      { authorId: danielId, kind: "lesson", title: "Started lessons with Mr. Salinas this semester.", body: "I've been shedding alone since 9th grade and finally got over the cost concern. Two weeks in and I'm a different player. If you're brass and wondering whether it's worth it: yes.", daysAgo: 2 },
      { authorId: haileyId, kind: "other", title: "I built this app for us.", body: "Not really a shoutout — more like a PSA. Use it. Post here. Fill in your profile. The whole point is so we can see each other.", daysAgo: 1 },
    ];
    for (const s of seedShoutouts) {
      const created = new Date();
      created.setDate(created.getDate() - s.daysAgo);
      await db.insert(shoutouts).values({
        id: newId(),
        authorId: s.authorId,
        kind: s.kind,
        title: s.title,
        body: s.body ?? null,
        createdAt: created,
      });
    }
    console.log(`   ✓ ${seedShoutouts.length} shoutouts`);
  }

  console.log("\nDone. Demo logins:");
  console.log(`  • director (Mr. Berry)   ${process.env.SEED_DIRECTOR_EMAIL ?? "director@pieperhs.test"}`);
  console.log(`  • drum major (Hailey)    ${process.env.SEED_DRUM_MAJOR_EMAIL ?? "hailey@pieperhs.test"}`);
  console.log(`  • students               fred2 / mia / jalen / sofia / daniel / ava / diego @pieperhs.test`);
  console.log(`  • invite code            ${DEMO_CODE}`);
  console.log();

  // Silence unused-id warnings.
  void miaId; void jalenId; void sofiaId; void danielId;
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
