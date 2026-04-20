/*
 * Pieper-specific enums — verify with Ulysses/Hailey and edit as needed.
 * Keeping these centralized so updating them doesn't require hunting through files.
 */

export const GRADES = [9, 10, 11, 12] as const;
export type Grade = (typeof GRADES)[number];

export const SECTIONS = [
  "Flute",
  "Clarinet",
  "Saxophone",
  "Double Reed",
  "Trumpet",
  "Horn",
  "Trombone",
  "Low Brass",
  "Battery Percussion",
  "Front Ensemble",
  "Color Guard",
] as const;
export type Section = (typeof SECTIONS)[number];

export const SECTION_GROUPS: Record<string, readonly Section[]> = {
  Woodwinds: ["Flute", "Clarinet", "Saxophone", "Double Reed"],
  Brass: ["Trumpet", "Horn", "Trombone", "Low Brass"],
  Percussion: ["Battery Percussion", "Front Ensemble"],
  Guard: ["Color Guard"],
};

export const CONCERT_INSTRUMENTS = [
  "Flute",
  "Piccolo",
  "Oboe",
  "Bassoon",
  "Clarinet",
  "Bass Clarinet",
  "Alto Saxophone",
  "Tenor Saxophone",
  "Baritone Saxophone",
  "Trumpet",
  "French Horn",
  "Trombone",
  "Bass Trombone",
  "Euphonium",
  "Tuba",
  "Percussion",
  "Piano",
  "Voice",
  "Other",
] as const;

export const MARCHING_INSTRUMENTS = [
  "Flute",
  "Clarinet",
  "Alto Saxophone",
  "Tenor Saxophone",
  "Trumpet",
  "Mellophone",
  "Trombone",
  "Baritone",
  "Sousaphone",
  "Snare",
  "Tenors",
  "Bass Drum",
  "Cymbals",
  "Marimba",
  "Vibraphone",
  "Xylophone",
  "Synth",
  "Aux Percussion",
  "Color Guard",
  "Drum Major",
] as const;

export const ROLES = ["student", "section_leader", "drum_major", "director"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUS = [
  "pending",
  "approved",
  "inactive",
  "awaiting_parent_consent",
  "alumni",
  "deleted_pending",
] as const;
export type UserStatus = (typeof USER_STATUS)[number];

export const MENTOR_URGENCY = ["casual", "upcoming_audition", "this_week"] as const;
export type MentorUrgency = (typeof MENTOR_URGENCY)[number];

export const URGENCY_LABEL: Record<MentorUrgency, string> = {
  casual: "Casual",
  upcoming_audition: "Upcoming audition",
  this_week: "This week",
};

export const MENTOR_REQUEST_STATUS = ["open", "claimed", "closed"] as const;
export type MentorRequestStatus = (typeof MENTOR_REQUEST_STATUS)[number];

export const OPPORTUNITY_TYPES = [
  "outside_audition",
  "dci_camp",
  "college_clinic",
  "summer_program",
  "theory_workshop",
  "masterclass",
  "scholarship",
  "competition",
  "other",
] as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const OPPORTUNITY_TYPE_LABEL: Record<OpportunityType, string> = {
  outside_audition: "Audition",
  dci_camp: "DCI camp",
  college_clinic: "College clinic",
  summer_program: "Summer program",
  theory_workshop: "Theory workshop",
  masterclass: "Masterclass",
  scholarship: "Scholarship",
  competition: "Competition",
  other: "Other",
};

export const PRACTICE_VISIBILITY = ["private", "section", "band"] as const;
export type PracticeVisibility = (typeof PRACTICE_VISIBILITY)[number];

export const MENTOR_SKILLS = [
  "Marching fundamentals",
  "Audition prep",
  "Sight-reading",
  "Music theory",
  "Flute technique",
  "Clarinet technique",
  "Saxophone technique",
  "Brass technique",
  "Percussion technique",
  "Color guard technique",
  "SAYWE audition prep",
  "All-Region audition prep",
  "All-State audition prep",
  "DCI audition prep",
  "College audition prep",
  "Practice habits",
  "Mental game",
] as const;

/* ---- Brand strings — use consistently everywhere in the app. ---- */

export const APP = {
  name: "Woodshed",
  shortName: "Woodshed",
  affection: "the shed",
  tagline: "Where the work happens.",
  program: "Pieper Band of Warriors",
} as const;
