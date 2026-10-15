"use client";

import { Zap } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Fragment } from "react";
import type { ApiCourseDetail } from "@/lib/courses/loaders";
import {
  assessmentPhrase,
  audienceOf,
  audienceSummary,
  certificateName,
  durationOf,
  pad2,
  passMarkOf,
} from "./course-view";

const EASE = [0.22, 1, 0.36, 1] as const;

const tile = "relative overflow-hidden rounded-[20px] p-6 sm:p-8 min-h-[260px] lg:min-h-0 flex flex-col justify-end";

/**
 * "Everything at a glance" (Figma 183:256): a bento of the course's "at a
 * glance" fields from the API — the route through it, who it's for, the
 * assessment, the certificate, flexible learning, study methods and support. Tiles a course has nothing for drop out; on a wide
 * screen the grid packs the rest.
 */
export default function CourseGlance({ course }: { course: ApiCourseDetail }) {
  const still = !!useReducedMotion();
  const duration = durationOf(course);
  const passMark = passMarkOf(course);
  // Each tile's words come from the course's own "at a glance" fields in the API.
  const whoFor = course.whoIsFor?.trim() || audienceSummary(audienceOf(course));
  const support = course.dedicatedSupportText?.trim();
  const modules = [...course.modules].sort((a, b) => a.displayOrder - b.displayOrder);
  // The full overview has its own section above, so this tile carries the shorter description.
  const summary = course.overviewText ? course.longDescription : null;

  // The route: start, one stop per module, then the certificate (or the end).
  const stops = ["Start", ...modules.map((_, i) => pad2(i + 1)), course.hasCertificate ? "Cert" : "End"];

  return (
    <section aria-labelledby="glance-title" className="ragged bg-[#f7f6f1] px-5 py-20 text-[#06180b] md:px-10 lg:py-32">
      <div className="mx-auto max-w-site">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-14">
          <h2 id="glance-title" className="m-0 font-title type-h2 font-normal tracking-[-0.03em]">
            Everything at a glance
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-14 lg:grid-flow-dense lg:grid-cols-4 lg:grid-rows-[repeat(3,300px)] lg:gap-6">
          {/* The route through the course. */}
          <div className={`${tile} bg-[#0b3a28] text-[#f2efe6] md:col-span-2 lg:row-span-2 lg:min-h-0`}>
            <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-40 size-[500px] rounded-full bg-[#1ee9b5]/25 blur-[100px]" />
            <div className="relative flex flex-col gap-4 pt-10">
              <div aria-hidden="true" className="relative mb-2 h-10">
                <span className="absolute inset-x-0 top-[18px] h-[3px] rounded-sm bg-[#f2efe6]/20" />
                <motion.span
                  className="absolute left-0 top-[18px] h-[3px] origin-left rounded-sm bg-[#1ee9b5]"
                  style={{ width: `${100 / (stops.length - 1)}%` }}
                  initial={still ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-20%" }}
                  transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
                />
                {stops.map((label, i) => {
                  const at = (i / (stops.length - 1)) * 100;
                  const last = i === stops.length - 1;
                  const lit = i <= 1;
                  // A long course keeps every stop but names only the ends, so labels never collide.
                  const named = i === 0 || last || (i === 1 && stops.length <= 7);
                  return (
                    <Fragment key={label}>
                      {named && (
                      <span
                        className={`absolute top-[-4px] whitespace-nowrap font-[family-name:var(--font-geist-mono)] type-caption ${lit ? "text-[#1ee9b5]" : "text-[#f2efe6]/60"}`}
                        style={{ left: `${at}%`, transform: `translateX(${i === 0 ? "0" : last ? "-100%" : "-50%"})` }}
                      >
                        {label}
                      </span>
                      )}
                      <span
                        className={`absolute top-[14px] size-3 rounded-full ${lit ? "bg-[#1ee9b5]" : "bg-[#f2efe6]"}`}
                        style={{ left: `calc(${at}% - ${i === 0 ? 0 : last ? 12 : 6}px)` }}
                      />
                    </Fragment>
                  );
                })}
              </div>
              {course.deliveryMode && (
                <p className="m-0 self-start rounded-full border border-[#1ee9b5]/60 px-3 py-1.5 type-caption font-medium text-[#1ee9b5]">
                  {course.deliveryMode}
                </p>
              )}
              <p className="m-0 font-title type-h3 font-normal tracking-[-0.03em]">
                <span className="block text-[#1ee9b5]">Learn at your own pace.</span>
                <span className="block">
                  {course.hasCertificate ? "Certified" : "Finished"} {duration ? `in ${duration}.` : "on completion."}
                </span>
              </p>
              {summary && <p className="m-0 line-clamp-4 max-w-[520px] type-body text-[#f2efe6]/80">{summary}</p>}
            </div>
          </div>

          {whoFor && (
            <div className={`${tile} text-[#f2efe6]`}>
              <Image src="/course-details/audience.jpg" alt="" fill sizes="(min-width: 1024px) 310px, (min-width: 768px) 50vw, 100vw" className="object-cover" />
              <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgb(6_24_11/0)_35%,rgb(6_24_11/0.88)_100%)]" />
              <div className="relative flex flex-col gap-3">
                <h3 className="m-0 font-title type-h3 font-normal tracking-[-0.025em]">Who it&rsquo;s for</h3>
                <p className="m-0 line-clamp-4 type-small text-[#f2efe6]/85">{whoFor}</p>
              </div>
            </div>
          )}

          {(passMark !== null || course.assessmentText) && (
            <div className={`${tile} bg-[#1ee9b5]`}>
              <div className="flex flex-col gap-3">
                <p className="m-0 font-title type-stat font-normal tracking-[-0.03em] tabular-nums">{passMark !== null ? `${passMark}%` : "Assessment"}</p>
                <p className="m-0 type-body font-medium text-[#06180b]/80">{course.assessmentText?.trim() || `pass mark in ${assessmentPhrase(course)}`}</p>
              </div>
            </div>
          )}

          {course.hasCertificate && (
            <div className={`${tile} justify-center bg-[#f2efe6] md:col-span-2`}>
              <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
                <div
                  aria-hidden="true"
                  className="flex w-[250px] shrink-0 rotate-4 flex-col items-center gap-2 rounded-[12px] border border-[#0c7a5e]/45 bg-[#f7f6f1] p-6 text-center shadow-[0_16px_32px_-10px_rgb(11_58_40/0.18)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:rotate-0"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-[#1ee9b5]">
                    <svg width="18" height="20" viewBox="0 0 22 24" fill="none">
                      <circle cx="11" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="2" />
                      <path d="m7 13.5-1.5 8.5 5.5-3 5.5 3-1.5-8.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="type-caption font-medium text-[#0c7a5e]">Certificate of completion</span>
                  <span className="font-title type-h4 tracking-[-0.025em]">Your name here</span>
                  <span className="max-w-full truncate type-caption text-[#06180b]/60">{course.title}</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <h3 className="m-0 max-w-[300px] font-title type-h3 font-normal tracking-[-0.025em]">A {certificateName(course)}</h3>
                  <p className="m-0 max-w-[300px] type-body text-[#06180b]/72">
                    {course.courseCertificateText?.trim() || "On successfully passing the final assessment."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {course.studyMethodsText?.trim() && (
            <div className={`${tile} bg-[#f2efe6]`}>
              <div className="flex flex-col gap-3">
                <p className="m-0 type-caption font-medium uppercase tracking-[0.14em] text-[#0c7a5e]">Study methods</p>
                <p className="m-0 font-title type-h3 font-normal tracking-[-0.025em]">{course.studyMethodsText.trim()}</p>
              </div>
            </div>
          )}

          <div className={`${tile} bg-[#06180b] text-[#f2efe6]`}>
            <div className="flex flex-col gap-3">
              <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b]">
                <Zap size={22} strokeWidth={1.8} />
              </span>
              {course.flexibleLearningText?.trim() ? (
                <>
                  <h3 className="m-0 font-title type-h3 font-normal tracking-[-0.025em]">Flexible learning</h3>
                  <p className="m-0 type-small text-[#f2efe6]/75">{course.flexibleLearningText.trim()}</p>
                </>
              ) : (
                <>
                  <h3 className="m-0 font-title type-h3 font-normal tracking-[-0.025em]">Instant access</h3>
                  <p className="m-0 type-small text-[#f2efe6]/75">the moment you enrol, on any internet-enabled device</p>
                </>
              )}
            </div>
          </div>

          {support && (
            <div className={`${tile} text-[#f2efe6] md:col-span-2`}>
              <Image src="/course-details/up-to-date.jpg" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgb(6_24_11/0.9)_0%,rgb(6_24_11/0.2)_65%)]" />
              <div className="relative flex flex-col gap-3">
                <h3 className="m-0 font-title type-h3 font-normal tracking-[-0.025em]">Dedicated support</h3>
                {/^\S+@\S+\.\S+$/.test(support) ? (
                  <a href={`mailto:${support}`} className="self-start type-body text-[#1ee9b5] underline-offset-4 hover:underline">
                    {support}
                  </a>
                ) : (
                  <p className="m-0 max-w-[380px] type-body text-[#f2efe6]/85">{support}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
