import type { ApiCourseDetail } from "@/lib/courses/loaders";
import { tidyDuration } from "@/lib/courses/format";

// Everything the course page shows that isn't a field read straight off the
// API record. The design (Figma 183:172) was drawn with Online Data
// Protection's copy; these turn any course's record into the same shapes, and
// each returns nothing (or a plainer line) when a course hasn't filled the
// field in, so a section can drop out rather than show a placeholder.

export const MODULE_PHOTOS = [
  "/course-details/module-1.jpg",
  "/course-details/module-2.jpg",
  "/course-details/module-3.jpg",
  "/course-details/up-to-date.jpg",
];

const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

export function numberWord(n: number) {
  return NUMBER_WORDS[n] ?? String(n);
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Online Data Protection" → lead "Online Data", accent "Protection." (the mint line). */
export function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);
  const accent = words.pop() ?? "";
  return { lead: words.join(" "), accent: /[.!?]$/.test(accent) ? accent : `${accent}.` };
}

export function durationOf(course: ApiCourseDetail) {
  return tidyDuration(course.durationLabel) || null;
}

/** The final assessment's pass mark: the exam record first, then the copy that quotes it. */
export function passMarkOf(course: ApiCourseDetail): number | null {
  const exam = course.assessments.find((a) => a.type === "final_exam") ?? course.assessments[0];
  if (exam?.passThreshold) return exam.passThreshold;
  const quoted = `${course.assessmentText ?? ""} ${course.courseCertificateText ?? ""}`.match(/(\d{2,3})\s*%/);
  return quoted ? Number(quoted[1]) : null;
}

export function assessmentPhrase(course: ApiCourseDetail) {
  return /multiple[- ]choice|mcq/i.test(course.assessmentText ?? "")
    ? "the final multiple-choice assessment"
    : "the final assessment";
}

export function certificateName(course: ApiCourseDetail) {
  return course.certificateType || "Certificate of Completion";
}

/** Whether the course says it checks understanding module by module. */
export function hasModuleChecks(course: ApiCourseDetail) {
  return course.whatsIncluded.some((line) => /quiz|knowledge check/i.test(line));
}

/** "Beginner to Intermediate" → "Beginner+"; any other level as it is. */
export function shortLevel(level: string) {
  const [from, to] = level.split(/\s+to\s+/i);
  return to ? `${from}+` : level;
}

export type HeroStat = { title: string; body: string };

/** The four facts along the bottom of the hero; any the course hasn't set drop out. */
export function heroStatsOf(course: ApiCourseDetail): HeroStat[] {
  const duration = durationOf(course);
  const stats: (HeroStat | null)[] = [
    duration ? { title: duration, body: course.deliveryMode || "Self-paced, any device" } : null,
    course.studyMethodsText ? { title: course.studyMethodsText, body: "Learn anytime, anywhere" } : null,
    course.skillLevel
      ? { title: shortLevel(course.skillLevel), body: shortLevel(course.skillLevel) === course.skillLevel ? "Skill level" : course.skillLevel }
      : null,
    course.hasCertificate ? { title: "CPD Certificate of Completion", body: "On passing the final assessment" } : null,
  ];
  return stats.filter((s): s is HeroStat => s !== null);
}

export type AudienceRole = { role: string; body: string };

/** "HR teams: handle staff records…" → { role: "HR teams", body: "Handle staff records…" }. */
export function audienceOf(course: ApiCourseDetail): AudienceRole[] {
  return course.whoThisCourseIsFor
    .map((line) => {
      const at = line.indexOf(":");
      if (at === -1) return { role: line.trim(), body: "" };
      return { role: line.slice(0, at).trim(), body: capitalise(line.slice(at + 1).trim()) };
    })
    .filter((r) => r.role);
}

/**
 * The roles for the "Who it's for" tile, in the course's own words: the
 * first three, then how many more the section below lists.
 */
export function audienceSummary(roles: AudienceRole[]) {
  if (!roles.length) return null;
  const shown = roles.slice(0, 3).map((r) => r.role);
  const rest = roles.length - shown.length;
  return `${shown.join(", ")}${rest ? `, and ${rest} more` : ""}.`;
}

