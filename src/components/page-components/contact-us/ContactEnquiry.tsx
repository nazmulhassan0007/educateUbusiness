"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useId, useState, type FormEvent } from "react";
import { Arrow, Check } from "@/components/page-components/concepts/shared";
import { emailProblem, suggestEmail } from "@/lib/validation/email";
import { phoneProblem } from "@/lib/validation/phone";
import { TOPIC_EVENT, TOPICS } from "./ContactHero";

const EASE = [0.22, 1, 0.36, 1] as const;

export type ContactFormContent = { notice_text?: string };

const NOTICE =
  "educateU is an online learning platform. We do not provide phone-based sales. All courses are available through direct online enrolment.";

// The headline for each topic on the board.
const HEADLINE: Record<string, string> = {
  "Course enquiry": "Tell us about your course question.",
  "Company Training": "Tell us about your team’s training.",
  Partnerships: "Tell us about the partnership.",
  Certificates: "Tell us about your certificate.",
  "Technical issue": "Tell us what isn’t working.",
  Other: "Tell us what’s on your mind.",
};

const STEPS = [
  { title: "You send your enquiry", body: "Pick the topic, add a few details, press submit." },
  { title: "Our UK team reads it", body: "Monday – Friday, 9:00 am – 5:00 pm GMT." },
  { title: "We reply by email", body: "Within 1 business day, to the address you give us." },
];

type Field = "firstName" | "lastName" | "email" | "phone" | "message";
const EMPTY: Record<Field, string> = { firstName: "", lastName: "", email: "", phone: "", message: "" };
const FIELDS = Object.keys(EMPTY) as Field[];

// The checks the server makes too (src/lib/resend/contact.ts), shown before a
// round trip. The server adds the ones a browser can't do — throwaway inboxes,
// domains that can't receive mail — and names the field it rejected.
function problem(field: Field, value: string): string | null {
  if (field === "email") return emailProblem(value);
  if (field === "phone") return phoneProblem(value);
  if (!value.trim()) return { firstName: "Enter your first name.", lastName: "Enter your last name.", message: "Enter a message." }[field];
  return null;
}

function Alert() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 4v3.5M7 9.6v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The enquiry form under the Contact hero: the chosen topic as a chip (the
 * board above picks it), a headline for that topic, the fields, and beside
 * them a card saying what happens after you send.
 *
 * Motion: the headline rolls over when the topic changes; the fields rise in
 * turn; the steps' line draws down the card, and on sending the steps light
 * up one after another.
 */
export default function ContactEnquiry({ data }: { data?: ContactFormContent }) {
  const reduce = useReducedMotion();
  const uid = useId();
  const [topic, setTopic] = useState(TOPICS[0].topic);
  const [picking, setPicking] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<{ field: Field; message: string } | null>(null);

  // A row picked on the board above chooses the topic here.
  useEffect(() => {
    const pick = (e: Event) => {
      const name = (e as CustomEvent<string>).detail;
      if (HEADLINE[name]) setTopic(name);
    };
    window.addEventListener(TOPIC_EVENT, pick);
    return () => window.removeEventListener(TOPIC_EVENT, pick);
  }, []);

  const group = reduce ? { initial: "show", animate: "show" } : { initial: "hide", whileInView: "show", viewport: { once: true, margin: "-10%" } };
  const fade: Variants = {
    hide: { opacity: 0, y: 24 },
    show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.85, delay: d, ease: EASE } }),
  };

  const error = (f: Field) => (touched[f] ? problem(f, form[f]) : null) ?? (fieldError?.field === f ? fieldError.message : null);
  const emailSuggestion = error("email") ? null : suggestEmail(form.email);
  const change = (f: Field, value: string) => {
    setForm((p) => ({ ...p, [f]: value }));
    if (fieldError?.field === f) setFieldError(null);
  };
  const lit = status === "sent" ? 3 : 1;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setTouched({ firstName: true, lastName: true, email: true, phone: true, message: true });
    const first = FIELDS.find((f) => problem(f, form[f]));
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    setServerError(null);
    setFieldError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, inquiry: topic }),
      });
      const result = (await res.json()) as { success: boolean; error?: string; field?: string };
      if (!result.success && result.error && FIELDS.includes(result.field as Field)) {
        const field = result.field as Field;
        setStatus("idle");
        setFieldError({ field, message: result.error });
        document.getElementById(`${uid}-${field}`)?.focus();
        return;
      }
      if (!result.success) {
        setStatus("error");
        setServerError(result.error ?? "We couldn’t send your enquiry just now. Please try again.");
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setServerError("We couldn’t send your enquiry just now. Please try again.");
    }
  }

  const input = (f: Field, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, hint?: React.ReactNode) => {
    const err = error(f);
    return (
      <label className="flex min-w-0 flex-col gap-2.5" htmlFor={`${uid}-${f}`}>
        <span className="type-small font-medium">
          {label} <span className="text-[#0c7a5e]">*</span>
        </span>
        <input
          id={`${uid}-${f}`}
          value={form[f]}
          onChange={(e) => change(f, e.target.value)}
          onBlur={() => form[f] && setTouched((t) => ({ ...t, [f]: true }))}
          aria-invalid={Boolean(err)}
          aria-describedby={err ? `${uid}-${f}-err` : hint ? `${uid}-${f}-hint` : undefined}
          className={`h-[56px] w-full rounded-[10px] border bg-[#f7f6f1] px-5 text-[17px] text-[#06180b] outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-[#06180b]/45 ${
            err ? "border-[#c2410c] shadow-[0_0_0_1px_#c2410c]" : "border-[#06180b]/10 hover:border-[#06180b]/25 focus:border-[#0c7a5e] focus:shadow-[0_0_0_3px_rgb(30_233_181/0.25)]"
          }`}
          {...props}
        />
        <AnimatePresence initial={false}>
          {err && (
            <motion.span
              id={`${uid}-${f}-err`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="-mt-0.5 flex items-center gap-1.5 overflow-hidden type-small text-[#a3341a]"
            >
              <Alert />
              {err}
            </motion.span>
          )}
        </AnimatePresence>
        {!err && hint && (
          <span id={`${uid}-${f}-hint`} className="-mt-0.5 type-small text-[#06180b]/75">
            {hint}
          </span>
        )}
      </label>
    );
  };

  return (
    // overflow-x-clip: the card below slides in from 40px right, which would
    // otherwise widen the page on phones until it plays (and keeps it sticky).
    <section id="contact-form" aria-labelledby="enquiry-title" className="scroll-mt-[var(--home-nav-h)] overflow-x-clip bg-[#f2efe6] px-5 py-20 text-[#06180b] md:px-10 lg:pb-[128px] lg:pt-[120px]">
      <div className="mx-auto grid max-w-site grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[minmax(0,1fr)_400px] lg:justify-between lg:gap-10 xl:grid-cols-[minmax(0,820px)_420px]">
        <motion.div {...group} className="min-w-0">
          {/* The topic, and a way to change it here. */}
          <motion.div variants={fade} custom={0} className="flex min-h-[40px] flex-wrap items-center gap-x-4 gap-y-2">
            <AnimatePresence mode="popLayout" initial={false}>
              {picking ? (
                <motion.ul
                  key="list"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="m-0 flex list-none flex-wrap gap-2 p-0"
                  aria-label="Choose a topic"
                >
                  {TOPICS.map((t, i) => (
                    <motion.li key={t.topic} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.04 } }}>
                      <button
                        type="button"
                        aria-pressed={t.topic === topic}
                        onClick={() => {
                          setTopic(t.topic);
                          setPicking(false);
                        }}
                        className={`h-10 rounded-full border px-4 type-small font-medium transition-colors ${
                          t.topic === topic ? "border-[#06180b] bg-[#06180b] text-white" : "border-[#06180b]/20 hover:border-[#06180b]/60"
                        }`}
                      >
                        {t.topic}
                      </button>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <motion.span
                  key="chip"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="inline-flex h-10 items-center gap-2.5 rounded-full bg-[#06180b] pl-2 pr-4 type-small font-medium text-white"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b]">
                    <Check size={10} />
                  </span>
                  {topic}
                </motion.span>
              )}
            </AnimatePresence>
            {!picking && (
              <button type="button" onClick={() => setPicking(true)} className="type-small font-medium text-[#0c7a5e] underline underline-offset-4 transition-colors hover:text-[#06180b]">
                Change topic
              </button>
            )}
          </motion.div>

          <motion.h2 variants={fade} custom={0.08} id="enquiry-title" className="m-0 mt-8 font-title type-h2 font-normal tracking-[-0.045em]" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={topic}
                className="block"
                initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE } }}
                exit={reduce ? undefined : { opacity: 0, y: -20, filter: "blur(6px)", transition: { duration: 0.25 } }}
              >
                {HEADLINE[topic]}
              </motion.span>
            </AnimatePresence>
          </motion.h2>

          <AnimatePresence mode="wait" initial={false}>
            {status === "sent" ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }}
                className="mt-12 rounded-[16px] border border-[#0c7a5e]/25 bg-[#f7f6f1] p-8 md:p-10"
                role="status"
              >
                <span className="grid size-12 place-items-center rounded-full bg-[#1ee9b5]">
                  <Check size={16} />
                </span>
                <p className="m-0 mt-5 font-title type-h3 tracking-[-0.03em]">Thanks{form.firstName.trim() ? `, ${form.firstName.trim()}` : ""}. It’s with our UK team.</p>
                <p className="m-0 mt-3 type-body text-[#06180b]/75">We’ll reply to {form.email.trim()} within 1 business day.</p>
                <button
                  type="button"
                  onClick={() => {
                    setForm(EMPTY);
                    setTouched({});
                    setStatus("idle");
                  }}
                  className="mt-7 type-small font-medium text-[#0c7a5e] underline underline-offset-4 hover:text-[#06180b]"
                >
                  Send another enquiry
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" noValidate onSubmit={submit} exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }} className="mt-10 lg:mt-8">
                <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
                  <motion.div variants={fade} custom={0.16}>{input("firstName", "First name", { autoComplete: "given-name", maxLength: 100 })}</motion.div>
                  <motion.div variants={fade} custom={0.2}>{input("lastName", "Last name", { autoComplete: "family-name", maxLength: 100 })}</motion.div>
                  <motion.div variants={fade} custom={0.24}>{input(
                      "email",
                      "Email address",
                      { type: "email", autoComplete: "email", inputMode: "email", maxLength: 254 },
                      emailSuggestion && (
                        <>
                          Did you mean{" "}
                          <button type="button" onClick={() => change("email", emailSuggestion)} className="font-medium text-[#0c7a5e] underline underline-offset-4 hover:text-[#06180b]">
                            {emailSuggestion}
                          </button>
                          ?
                        </>
                      ),
                    )}</motion.div>
                  <motion.div variants={fade} custom={0.28}>{input("phone", "Phone number", { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "+44" })}</motion.div>
                </div>

                <motion.label variants={fade} custom={0.32} htmlFor={`${uid}-message`} className="mt-6 flex flex-col gap-2.5">
                  <span className="type-small font-medium">
                    Message <span className="text-[#0c7a5e]">*</span>
                  </span>
                  <textarea
                    id={`${uid}-message`}
                    value={form.message}
                    onChange={(e) => change("message", e.target.value)}
                    onBlur={() => form.message && setTouched((t) => ({ ...t, message: true }))}
                    aria-invalid={Boolean(error("message"))}
                    aria-describedby={error("message") ? `${uid}-message-err` : undefined}
                    maxLength={5000}
                    placeholder="Tell us about the course, partnership or team training you have in mind."
                    className={`h-[148px] w-full resize-y rounded-[10px] border bg-[#f7f6f1] px-5 py-4 text-[17px] leading-[26px] outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-[#06180b]/45 ${
                      error("message") ? "border-[#c2410c] shadow-[0_0_0_1px_#c2410c]" : "border-[#06180b]/10 hover:border-[#06180b]/25 focus:border-[#0c7a5e] focus:shadow-[0_0_0_3px_rgb(30_233_181/0.25)]"
                    }`}
                  />
                  {error("message") && (
                    <span id={`${uid}-message-err`} className="-mt-0.5 flex items-center gap-1.5 type-small text-[#a3341a]">
                      <Alert />
                      {error("message")}
                    </span>
                  )}
                </motion.label>

                <motion.div variants={fade} custom={0.36} className="mt-8 flex flex-col-reverse gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
                  <p className="m-0 max-w-[410px] type-small text-[#06180b]/70">{data?.notice_text?.trim() || NOTICE}</p>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="group relative inline-flex h-[60px] shrink-0 items-center gap-4 overflow-hidden whitespace-nowrap rounded-full bg-[#06180b] py-1.5 pl-7 pr-1.5 type-button font-medium text-white disabled:opacity-70"
                    >
                      <span aria-hidden="true" className="absolute inset-y-0 right-0 w-0 rounded-full bg-[#0c3a28] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
                      <span className="relative">{status === "sending" ? "Sending…" : "Submit your enquiry"}</span>
                      <span className={`relative grid size-[46px] place-items-center rounded-full bg-[#1ee9b5] text-[#06180b] transition-transform duration-500 group-hover:-rotate-45 ${status === "sending" ? "animate-pulse" : ""}`}>
                        <Arrow size={14} />
                      </span>
                    </button>
                    {status === "error" && serverError && (
                      <p role="alert" className="m-0 flex items-center gap-1.5 type-small text-[#a3341a]">
                        <Alert />
                        {serverError}
                      </p>
                    )}
                  </div>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* What happens next. */}
        <motion.aside
          {...group}
          variants={{ hide: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0, transition: { duration: 1, delay: 0.2, ease: EASE } } }}
          className="self-start rounded-[16px] bg-[#0c3a28] px-7 py-10 text-white md:px-10 lg:sticky lg:top-[calc(var(--home-nav-h)+24px)] lg:pb-10 lg:pt-[42px]"
          aria-labelledby="next-title"
        >
          <h3 id="next-title" className="m-0 font-title type-h3 font-normal tracking-[-0.035em]">
            What happens next
          </h3>
          <ol className="relative m-0 mt-8 list-none p-0">
            {/* The line joining the steps, drawn down; it fills mint as they light. */}
            <motion.span
              aria-hidden="true"
              className="absolute bottom-[78px] left-4 top-4 w-px origin-top bg-white/15"
              variants={{ hide: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 1.1, delay: 0.6, ease: EASE } } }}
            />
            <span
              aria-hidden="true"
              className="absolute bottom-[78px] left-4 top-4 w-px origin-top bg-[#1ee9b5] transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `scaleY(${status === "sent" ? 1 : 0})` }}
            />
            {STEPS.map((s, i) => {
              const on = i < lit;
              return (
                <motion.li key={s.title} variants={fade} custom={0.5 + i * 0.12} className="relative flex gap-5 pb-6 last:pb-0">
                  <span
                    className={`relative grid size-8 shrink-0 place-items-center rounded-full type-caption font-semibold transition-colors duration-500 ${on ? "bg-[#1ee9b5] text-[#06180b]" : "bg-[#24503f] text-white"}`}
                    style={{ transitionDelay: status === "sent" ? `${i * 350}ms` : "0ms" }}
                  >
                    <span className="relative">{i + 1}</span>
                  </span>
                  <div className="pt-0.5">
                    <p className="m-0 type-h4 font-medium">{s.title}</p>
                    <p className="m-0 mt-1 type-small text-white/70">{s.body}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
          <motion.p variants={fade} custom={0.9} className="m-0 mt-7 border-t border-white/10 pt-7 type-small text-white/80">
            Prefer email?{" "}
            <a href="mailto:hello@educateU.com" className="text-white underline-offset-4 hover:text-[#1ee9b5] hover:underline">
              hello@educateU.com
            </a>{" "}
            reaches the same team.
          </motion.p>
        </motion.aside>
      </div>
    </section>
  );
}
