/*
 * Graduation year is computed from the student's grade at signup + the current
 * school year. Pieper's academic year runs Aug → May. We use May 31 as the
 * graduation boundary — FLAG THIS with Ulysses; San Antonio ISD may differ.
 */

export const GRAD_MONTH = 4; // 0-indexed May
export const GRAD_DAY = 31;

export function currentSchoolYearEnd(now: Date = new Date()) {
  const year = now.getFullYear();
  const juneOfThisYear = new Date(year, 5, 1); // June 1 — after graduation
  // If we're past June 1, school year ended in May of this year.
  // If before June 1, school year ends in May of this year.
  return now >= juneOfThisYear ? year + 1 : year;
}

export function computeGraduationYear(grade: number, now: Date = new Date()) {
  if (grade < 9 || grade > 12) return null;
  const schoolYearEnd = currentSchoolYearEnd(now);
  // Grade 12 graduates at schoolYearEnd, grade 9 graduates 3 years later.
  return schoolYearEnd + (12 - grade);
}

export function graduationDate(graduationYear: number) {
  return new Date(graduationYear, GRAD_MONTH, GRAD_DAY);
}

export function shouldBeAlumni(graduationYear: number | null, now: Date = new Date()) {
  if (!graduationYear) return false;
  return now >= graduationDate(graduationYear);
}
