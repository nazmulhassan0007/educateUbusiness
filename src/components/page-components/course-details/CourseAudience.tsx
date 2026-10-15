import {
  BookOpen,
  Briefcase,
  Building2,
  FlaskConical,
  HeartHandshake,
  Server,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ApiCourseDetail } from "@/lib/courses/loaders";
import { audienceOf } from "./course-view";

// The roles are free text, so each gets a glyph by what it names.
const ICONS: [RegExp, LucideIcon][] = [
  [/\bhr\b|human resources|people/i, Users],
  [/admission|student|reception|front/i, Building2],
  [/lectur|tutor|teach|trainer|instruct/i, BookOpen],
  [/research|scien|lab/i, FlaskConical],
  [/\bit\b|tech|digital|developer|engineer/i, Server],
  [/manag|lead|director|head/i, Briefcase],
  [/care|support|welfare|wellbeing|pastoral/i, HeartHandshake],
  [/safeguard|security|compliance|officer/i, ShieldCheck],
];

const iconFor = (role: string) => ICONS.find(([re]) => re.test(role))?.[1] ?? UserRound;

/** "Who this course is for" (Figma 184:284): one card per role the course names. */
export default function CourseAudience({ course }: { course: ApiCourseDetail }) {
  const roles = audienceOf(course);
  if (!roles.length) return null;

  return (
    <section aria-labelledby="audience-title" className="ragged bg-[#f2efe6] px-5 py-20 text-[#06180b] md:px-10 lg:py-32">
      <div className="mx-auto max-w-site">
        <h2 id="audience-title" className="m-0 font-title type-h2 font-normal tracking-[-0.03em]">
          Who this course is for
        </h2>
        <ul className="m-0 mt-10 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6">
          {roles.map(({ role, body }) => {
            const Icon = iconFor(role);
            return (
              <li key={role} className="group flex flex-col gap-4 rounded-[20px] bg-[#f7f6f1] p-7 transition-colors duration-300 hover:bg-white">
                <span
                  aria-hidden="true"
                  className="grid size-[52px] place-items-center rounded-2xl bg-[#0b3a28] text-[#1ee9b5] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6"
                >
                  <Icon size={24} strokeWidth={1.6} />
                </span>
                <h3 className="m-0 font-title type-h4 font-normal tracking-[-0.025em]">{role}</h3>
                {body && <p className="m-0 type-body text-[#06180b]/72">{body}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
