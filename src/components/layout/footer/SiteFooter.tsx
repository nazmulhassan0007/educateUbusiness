"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState, type FormEvent } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube } from "react-icons/fa";
import type { IconType } from "react-icons";
import { useSmoothScrollTo } from "@/components/shared/smooth-scroll/SmoothScroll";
import type { FooterData } from "./Footer";
import { emailProblem, suggestEmail } from "@/lib/validation/email";

// Fallbacks, used only when the CMS footer is missing a field.
const EMAIL = "support@educateu.com";
// Not in the CMS yet; from the design.
const PHONE = "+44 204 613 9443";
const ADDRESS = "EDUCATEU LTD 118-120 Meridian Place, Isle Of Dogs, London, England, E14 9FF";
const COPYRIGHT = "All rights reserved. educateU is registered in England & Wales No. 14400001";
// The current Instagram account; it wins over an older one still in the CMS.
const INSTAGRAM = "https://www.instagram.com/educateuofficial/";
const SOCIALS: { name: string; url: string }[] = [
  { name: "facebook", url: "https://www.facebook.com/educateu/" },
  { name: "linkedin", url: "https://www.linkedin.com/company/educateuofficial/" },
  { name: "instagram", url: INSTAGRAM },
  { name: "tiktok", url: "https://www.tiktok.com/@educateuofficial" },
  { name: "youtube", url: "https://www.youtube.com/@educateU_official" },
];
const ICONS: Record<string, [IconType, string]> = {
  facebook: [FaFacebookF, "Facebook"],
  linkedin: [FaLinkedinIn, "LinkedIn"],
  instagram: [FaInstagram, "Instagram"],
  tiktok: [FaTiktok, "TikTok"],
  youtube: [FaYoutube, "YouTube"],
};

const EXPLORE = [
  { label: "Courses", href: "/courses" },
  // { label: "About us", href: "/about" }, // hidden for now — the /about page itself is kept
  { label: "Contact", href: "/contact-us" },
];
const SUPPORT = [
  { label: "Support Hub", href: "/support-hub" },
  { label: "Certificate Checker", href: "/certificate-checker" },
];

/** Pulls what the design shows out of the CMS footer, falling back field by field. */
function fromCms(data?: FooterData) {
  const col = (title: string) => data?.columns?.find((c) => c.title?.toLowerCase() === title.toLowerCase());
  const socials = (col("Socials")?.items ?? [])
    .map((i) => ({ name: i.label.toLowerCase(), url: i.label.toLowerCase() === "instagram" ? INSTAGRAM : i.url }))
    .filter((s) => ICONS[s.name] && /^https?:\/\//.test(s.url));
  const locations = col("Locations")?.items ?? [];
  const address = locations.find((i) => !/@/.test(i.label))?.label.replace(/ Isle Of/, ", Isle Of");
  const email = locations.map((i) => i.label.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0]).find(Boolean);
  const bottom = data?.sections?.find((s) => s.items && "copyright_text" in s.items);
  const copyright = (bottom?.items?.copyright_text?.value as string | undefined)?.replace(/^©\s*/, "").replace(/EducateU/, "educateU");
  return {
    socials: socials.length ? socials : SOCIALS,
    address: address || ADDRESS,
    email: email || EMAIL,
    copyright: copyright || COPYRIGHT,
  };
}

/**
 * The site footer (every page, from the root layout), from the design:
 * logo, tagline and newsletter; link columns, contact and socials; the
 * wordmark sinking behind the bottom rule; copyright, policies, back to top.
 */
export default function SiteFooter({ data }: { data?: FooterData }) {
  const pathname = usePathname();
  const scrollTo = useSmoothScrollTo();
  const { socials, address, email, copyright } = fromCms(data);
  // The /new/b design direction ships its own footer.
  if (pathname.startsWith("/new/") && pathname !== "/new/c") return null;

  return (
    <footer className="relative overflow-hidden bg-[#041f17] px-5 pt-20 text-[#f2efe6] md:px-10 lg:pt-[122px]">
      <div className="mx-auto max-w-site">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_580px]">
          <div className="min-w-0">
            <Link href="/" aria-label="educateU Business home" className="inline-flex h-[66px] items-stretch gap-[13px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/navbar/logo-circle.png" alt="" className="size-[51.5px] self-start" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/navbar/logo-wordmark.png" alt="" className="h-[53px] w-auto self-end" />
            </Link>
            <p className="m-0 mt-9 font-title type-h2 tracking-[-0.035em]">
              <RevealLine>Skills Without Borders,</RevealLine>
              <RevealLine delay={0.12} className="text-[#1ee9b5]">
                Careers Without Limits
              </RevealLine>
            </p>
          </div>
          <Rise delay={0.2} className="min-w-0">
            <Newsletter />
          </Rise>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-12 border-t border-white/10 pt-14 lg:mt-[56px] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1.1fr)] lg:pt-[54px]">
          <Rise>
            <LinkColumn title="Explore" links={EXPLORE} />
          </Rise>
          <Rise delay={0.08}>
            <LinkColumn title="Support" links={SUPPORT} />
          </Rise>
          <Rise delay={0.16}>
            <p className="m-0 type-caption text-white/60">Contact</p>
            <ul className="m-0 mt-6 grid list-none gap-3.5 p-0 type-body">
              <li>
                <a href={`mailto:${email}`} className="transition-colors hover:text-[#1ee9b5]">
                  {email}
                </a>
              </li>
              <li>
                <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="transition-colors hover:text-[#1ee9b5]">
                  {PHONE}
                </a>
              </li>
            </ul>
            <address className="mt-3.5 max-w-[270px] type-small not-italic text-white/65">{address}</address>
          </Rise>
          <Rise delay={0.24}>
            <p className="m-0 type-caption text-white/60">Follow educateU</p>
            <ul className="m-0 mt-6 flex list-none flex-wrap gap-2 p-0 lg:flex-nowrap lg:gap-1.5 xl:gap-2">
              {socials.map((s) => {
                const [Icon, label] = ICONS[s.name];
                return (
                  <li key={s.name}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${label} (opens in a new tab)`}
                      className="group/s grid size-11 place-items-center rounded-full border border-white/20 text-[15px] lg:size-10 xl:size-11 transition-[background-color,border-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-[#1ee9b5] hover:bg-[#1ee9b5] hover:text-[#06180b]"
                    >
                      <Icon aria-hidden="true" className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/s:-rotate-12 group-hover/s:scale-110" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </Rise>
        </div>

        {/* The wordmark, sinking behind the bottom rule. */}
        <Wordmark />

        <div className="flex flex-col gap-4 pb-10 pt-6 type-small text-white/75 xl:flex-row xl:items-center xl:gap-6">
          {/* "No. 14400001" stays on one line, and the lines are evened out, so
              the registration number never sits alone. */}
          <p className="m-0 text-left text-pretty">
            © {new Date().getFullYear()} {copyright.replace(/No\. (?=\d)/, "No.\u00a0")}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 xl:flex-1">
            <p className="m-0 flex shrink-0 items-center gap-6">
              <Link href="/refund-policy" className="whitespace-nowrap underline underline-offset-4 transition-colors hover:text-[#1ee9b5]">
                Refund Policy
              </Link>
              <Link href="/cookies-policy" className="whitespace-nowrap underline underline-offset-4 transition-colors hover:text-[#1ee9b5]">
                Cookies Policy
              </Link>
            </p>
          <button type="button" onClick={() => scrollTo(0)} className="group flex shrink-0 items-center gap-3.5 whitespace-nowrap">
            Back to top
            <span className="grid size-11 place-items-center rounded-full border border-white/20 transition-[background-color,border-color,color] duration-300 group-hover:border-[#1ee9b5] group-hover:bg-[#1ee9b5] group-hover:text-[#06180b]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5">
                <path d="M7 13V1M2 6l5-5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="m-0 type-caption text-white/60">{title}</p>
      <ul className="m-0 mt-6 grid list-none gap-3.5 p-0 type-body">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="group inline-flex items-center gap-1.5 transition-colors hover:text-[#1ee9b5]">
              {l.label}
              <span aria-hidden="true" className="-translate-x-1 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Status = "idle" | "sending" | "done" | "error" | "unsubscribing" | "unsubscribed";

/** Same endpoint as the old footer's form. */
function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [already, setAlready] = useState(false);
  const [unsubscribeQuery, setUnsubscribeQuery] = useState<string | null>(null);
  const suggestion = status === "idle" ? suggestEmail(email) : null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending" || status === "done" || status === "unsubscribing") return;
    // The same syntax check the server makes; it adds the DNS and
    // throwaway-inbox checks a browser can't.
    const problem = emailProblem(email);
    if (problem) {
      setStatus("error");
      setError(problem);
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const result = (await res.json()) as { success: boolean; error?: string; alreadySubscribed?: boolean; unsubscribeQuery?: string };
      if (!result.success) {
        setStatus("error");
        setError(result.error ?? "Could not subscribe right now");
        return;
      }
      setAlready(Boolean(result.alreadySubscribed));
      setUnsubscribeQuery(result.unsubscribeQuery ?? null);
      setStatus("done");
    } catch {
      setStatus("error");
      setError("Could not subscribe right now");
    }
  };

  // Undo, straight from the form — the same endpoint the email's link uses.
  const unsubscribe = async () => {
    if (!unsubscribeQuery || status === "unsubscribing") return;
    setStatus("unsubscribing");
    try {
      const res = await fetch(`/api/newsletter/unsubscribe?${unsubscribeQuery}`, { method: "POST" });
      const result = (await res.json()) as { success: boolean; error?: string };
      if (!result.success) {
        setStatus("done");
        setError(result.error ?? "Could not unsubscribe right now. Please try again.");
        return;
      }
      setUnsubscribeQuery(null);
      setEmail("");
      setError("");
      setStatus("unsubscribed");
    } catch {
      setStatus("done");
      setError("Could not unsubscribe right now. Please try again.");
    }
  };

  const subscribed = status === "done" || status === "unsubscribing";
  const label = status === "sending" ? "Subscribing…" : subscribed ? "Subscribed" : status === "error" ? "Try again" : "Subscribe";

  return (
    <div className="min-w-0 rounded-[26px] border border-white/10 bg-[#0f2920] p-6 md:px-[34px] md:pb-[31px] md:pt-[30px] lg:mt-[101px]">
      <p className="m-0 font-title type-h4 tracking-[-0.025em]">Courses and compliance updates, straight to your inbox.</p>
      <form onSubmit={submit} className="mt-[21px] flex flex-col gap-2 sm:h-16 sm:flex-row sm:items-center sm:rounded-[14px] sm:border sm:border-white/10 sm:bg-[#0a1e14] sm:p-[7px] sm:pl-5 sm:focus-within:border-[#1ee9b5]/60">
        <label htmlFor="footer-email" className="sr-only">
          Your email address
        </label>
        <input
          id="footer-email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          aria-invalid={status === "error"}
          aria-describedby="footer-email-status"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error" || status === "unsubscribed") setStatus("idle");
          }}
          placeholder="Your email address"
          className="h-12 min-w-0 flex-none rounded-[10px] border border-white/10 bg-[#0a1e14] px-4 text-[16px] text-white outline-none transition-colors placeholder:text-white/55 focus:border-[#1ee9b5]/60 sm:h-full sm:flex-1 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0"
        />
        <button
          type="submit"
          disabled={status === "sending" || subscribed}
          className="h-12 w-full shrink-0 rounded-[10px] bg-[#1ee9b5] px-[22px] type-button font-medium text-[#06180b] transition-colors hover:bg-[#5ef0c9] disabled:cursor-default sm:h-full sm:w-auto"
        >
          {label}
        </button>
      </form>
      <p id="footer-email-status" role="status" className={`m-0 type-caption text-white/60 ${subscribed || status === "error" || status === "unsubscribed" || suggestion ? "mt-2" : "sr-only"}`}>
        {subscribed ? (
          already ? (
            "You're already on the list. Every newsletter email has an unsubscribe link at the bottom."
          ) : (
            <>
              {error ? `${error} ` : "Thanks, you're on the list. Changed your mind? "}
              <button
                type="button"
                onClick={unsubscribe}
                disabled={status === "unsubscribing"}
                className="text-[#1ee9b5] underline underline-offset-2 hover:text-white disabled:opacity-60"
              >
                {status === "unsubscribing" ? "Unsubscribing…" : error ? "Try again" : "Unsubscribe"}
              </button>
            </>
          )
        ) : status === "unsubscribed" ? (
          "You've been unsubscribed. You won't receive the newsletter."
        ) : status === "error" ? (
          error
        ) : suggestion ? (
          <>
            Did you mean{" "}
            <button type="button" onClick={() => setEmail(suggestion)} className="text-[#1ee9b5] underline underline-offset-2 hover:text-white">
              {suggestion}
            </button>
            ?
          </>
        ) : (
          ""
        )}
      </p>
    </div>
  );
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** A line that slides up from behind its own mask when it scrolls into view. */
function RevealLine({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className={`block ${className}`}
        initial={reduce ? false : { y: "105%", rotate: 2 }}
        whileInView={{ y: 0, rotate: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Fades and lifts its content in when it scrolls into view. */
function Rise({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const WORD = "educateU".split("");

/**
 * The wordmark: its letters climb out from behind the bottom rule one after
 * another as the page reaches the end, and a mint light follows the pointer
 * across them.
 */
function Wordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.5 });

  // The spotlight: pointer position in px, eased; parked off-screen until used.
  const mx = useSpring(useMotionValue(-400), { stiffness: 140, damping: 24 });
  const my = useSpring(useMotionValue(-400), { stiffness: 140, damping: 24 });
  const mask = useMotionTemplate`radial-gradient(220px circle at ${mx}px ${my}px, #000 0%, rgb(0 0 0 / 0.5) 45%, transparent 75%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const b = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - b.left);
    my.set(e.clientY - b.top);
  };
  const onLeave = () => {
    mx.set(-400);
    my.set(-400);
  };

  // Sized in container units, so "educateU" (about 4.12x its font size wide)
  // spans the footer's content width exactly at every screen size; the band
  // is cut at 15cqw, so the letters always sink the same way behind the rule.
  const text = "m-0 flex justify-center whitespace-nowrap font-title text-[24cqw] leading-[0.82] tracking-[-0.05em]";
  return (
    <div className="mt-16 [container-type:inline-size] lg:mt-[82px]">
    <div
      ref={ref}
      aria-hidden="true"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative h-[15cqw] select-none overflow-hidden border-b border-white/10"
    >
      <p className={`${text} text-[#122b23]`}>
        {WORD.map((ch, i) => (
          <Letter key={i} ch={ch} i={i} progress={progress} still={!!reduce} />
        ))}
      </p>
      {/* The same letters in mint, shown only under the pointer's light. */}
      <motion.p style={{ maskImage: mask, WebkitMaskImage: mask }} className={`${text} pointer-events-none absolute inset-x-0 top-0 text-[#1ee9b5]/70`}>
        {WORD.map((ch, i) => (
          <Letter key={i} ch={ch} i={i} progress={progress} still={!!reduce} />
        ))}
      </motion.p>
    </div>
    </div>
  );
}

function Letter({ ch, i, progress, still }: { ch: string; i: number; progress: MotionValue<number>; still: boolean }) {
  // Each letter has its own slice of the scroll, so they rise in a wave.
  const start = 0.05 + i * 0.07;
  const y = useTransform(progress, [start, start + 0.45], ["100%", "0%"]);
  const rotate = useTransform(progress, [start, start + 0.45], [i % 2 ? 8 : -8, 0]);
  return (
    <motion.span style={still ? undefined : { y, rotate }} className="inline-block origin-bottom">
      {ch}
    </motion.span>
  );
}
