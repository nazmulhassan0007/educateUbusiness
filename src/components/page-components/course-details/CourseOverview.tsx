import { Check } from "lucide-react";
import type { ApiCourseDetail } from "@/lib/courses/loaders";

// A sentence ends at . ! or ? before a capital.
const SENTENCE_BREAK = /(?<=[.!?])\s+(?=[A-Z])/;

/**
 * The API sends each overview as one block of one to five sentences, which
 * reads as a wall. Split it for reading: the first sentence becomes the lead,
 * a closing "Ideal for…" sentence becomes the audience note, and what's left
 * is one paragraph, or two once it runs past a couple of sentences. The two
 * break at a line break in the text when there is one (the writer's own
 * paragraph), otherwise where they come out closest to equal length.
 */
function splitOverview(text: string) {
  const sentences: string[] = [];
  const lineStarts = new Set<number>();
  for (const line of text.split(/\n+/)) {
    const parts = line.split(SENTENCE_BREAK).map((s) => s.trim()).filter(Boolean);
    if (!parts.length) continue;
    lineStarts.add(sentences.length);
    sentences.push(...parts);
  }
  const lead = sentences.shift() ?? "";
  const audience = sentences.length && /^ideal for\b/i.test(sentences.at(-1)!) ? sentences.pop()! : "";
  if (sentences.length <= 2) return { lead, body: sentences.length ? [sentences.join(" ")] : [], audience };

  // Indexes are one lower now the lead is gone; the break can't come before the first.
  let at = [...lineStarts].map((i) => i - 1).find((i) => i > 0 && i < sentences.length) ?? 0;
  if (!at) {
    const total = sentences.join(" ").length;
    let run = sentences[0].length;
    at = 1;
    while (at < sentences.length - 1 && run + sentences[at].length / 2 < total / 2) run += sentences[at++].length + 1;
  }
  return { lead, body: [sentences.slice(0, at).join(" "), sentences.slice(at).join(" ")], audience };
}

/**
 * Course overview: the course's full overview text from the API beside what the
 * enrolment includes, with how it's assessed underneath. Either side drops
 * out when the course has nothing for it; the section goes when both do.
 */
export default function CourseOverview({ course }: { course: ApiCourseDetail }) {
  const overview = (course.overviewText || course.longDescription || "").trim();
  const included = course.whatsIncluded.filter((line) => line.trim());
  if (!overview && !included.length) return null;
  const { lead, body, audience } = splitOverview(overview);

  return (
    <section aria-labelledby="overview-title" className="ragged bg-[#f2efe6] px-5 py-20 text-[#06180b] md:px-10 lg:py-32">
      <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:gap-20">
        <div className="min-w-0">
          {/* The short description is the hero's subheader, so it isn't repeated as a heading here. */}
          <h2 id="overview-title" className="m-0 type-caption font-medium uppercase tracking-[0.14em] text-[#0c7a5e]">
            Course overview
          </h2>
          {lead && (
            <p className="m-0 mt-5 max-w-[680px] type-lead text-[#06180b]">{lead}</p>
          )}
          {body.map((p) => (
            <p key={p} className="m-0 mt-5 max-w-[680px] type-lead text-[#06180b]/75">
              {p}
            </p>
          ))}
          {audience && (
            <p className="m-0 mt-8 flex max-w-[680px] flex-col gap-1 border-l-2 border-[#1ee9b5] pl-5 type-body">
              <span className="font-medium text-[#0c7a5e]">Who it&rsquo;s for</span>
              {/* "Ideal for teachers, …" reads as "Teachers, …" under its own label. */}
              <span className="text-[#06180b]/75">{audience.replace(/^ideal for\s+(\w)/i, (_, c: string) => c.toUpperCase())}</span>
            </p>
          )}
        </div>

        {included.length > 0 && (
          <div className="self-start rounded-[20px] bg-[#f7f6f1] p-6 shadow-[0_24px_48px_-32px_rgb(6_24_11/0.35)] sm:p-8">
            <h3 className="m-0 font-title type-h3 font-normal tracking-[-0.025em]">What&rsquo;s included</h3>
            <ul className="m-0 mt-6 list-none border-b border-[#06180b]/12 p-0">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-4 border-t border-[#06180b]/12 py-4">
                  <span aria-hidden="true" className="mt-0.5 grid size-[26px] shrink-0 place-items-center rounded-full bg-[#1ee9b5]">
                    <Check size={13} strokeWidth={2.2} />
                  </span>
                  <span className="type-body text-[#06180b]/88">{item}</span>
                </li>
              ))}
            </ul>
            {course.assessmentText && (
              <p className="m-0 mt-6 flex flex-col gap-1 type-small">
                <span className="font-medium">Assessment</span>
                <span className="text-[#06180b]/70">{course.assessmentText}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
