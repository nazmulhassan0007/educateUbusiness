"use client";

import Lenis from "lenis";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  HardHat,
  HeartPulse,
  LayoutGrid,
  LifeBuoy,
  LogIn,
  LogOut,
  Mail,
  MessageCircle,
  MonitorPlay,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FlipText } from "@/components/shared/animation/FlipText";
import CartDropdown from "@/components/shared/cart-dropdown/CartDropdown";
import { EASE } from "@/components/page-components/awwwards/types";
import ProfileMenu, { type ProfileMenuUser } from "@/components/shared/profile-menu/ProfileMenu";
import { allowHeavyMotion } from "@/lib/motion-budget";
import { PORTAL_URL } from "@/lib/portal";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartHydrated, useCartStore } from "@/store/cart-store";

export type NavSubject = { name: string; slug: string; count: number };

// educateU Business pages. Level 7 Diplomas live on educateU.com (the switcher).
const LINKS: [string, string][] = [
  // ["About us", "/about"], // hidden for now — the /about page itself is kept
  ["Contact us", "/contact-us"],
];
// How to reach the team, shown in the full-screen menu (same as the footer's).
const EMAIL = "support@educateu.com";
const PHONE = "+44 204 613 9443";
// Dev and preview builds link to the educateU dev site, production to the real one.
// Pages whose hero runs under the bar (a film, or its own dark ground): it stays clear until the page scrolls.
export const OVER_FILM = ["/about", "/contact-us", "/courses", "/support-hub", "/login", "/register", "/forgot-password", "/certificate-checker"];
// …and every course page, whose hero is the course's own photo.
export const isOverFilm = (pathname: string) => OVER_FILM.includes(pathname) || pathname.startsWith("/courses/");

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={cn("transition-transform duration-300", open && "rotate-180")}>
      <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The full-screen menu's rows: icon and one-line hint, by href.
const MENU_ROWS: Record<string, { hint: string; Icon: LucideIcon }> = {
  "/courses": { hint: "CPD-accredited training", Icon: GraduationCap },
  "/contact-us": { hint: "We reply within a day", Icon: MessageCircle },
  [PORTAL_URL]: { hint: "Continue your learning", Icon: MonitorPlay },
};
// Smaller tiles under the rows, for the pages people look for (the footer's).
const MENU_EXTRAS: [string, string, string, LucideIcon][] = [
  ["Support hub", "Guides and FAQs", "/support-hub", LifeBuoy],
  ["Certificate checker", "Verify a certificate", "/certificate-checker", BadgeCheck],
];
// Each subject's icon, matched on its name; anything new gets the book.
const SUBJECT_ICONS: [RegExp, LucideIcon][] = [
  [/health|safety|fire/i, HardHat],
  [/compliance|law|regulat/i, ClipboardCheck],
  [/cyber|\bIT\b|tech|data/i, ShieldCheck],
  [/leader|manage/i, Users],
  [/food|hygiene/i, Utensils],
  [/care|medic|first aid/i, HeartPulse],
];
const subjectIcon = (name: string) => SUBJECT_ICONS.find(([re]) => re.test(name))?.[1] ?? BookOpen;

/** A menu row's round end icon: outlined at rest, mint on hover or while its row is `active`. */
function RowIcon({ Icon, active = false, className }: { Icon: LucideIcon; active?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full border transition-colors duration-300",
        active
          ? "border-[#1ee9b5] bg-[#1ee9b5] text-[#06180b]"
          : "border-white/15 text-white/70 group-hover:border-[#1ee9b5] group-hover:bg-[#1ee9b5] group-hover:text-[#06180b]",
      )}
    >
      <Icon strokeWidth={1.8} className={cn("size-[18px] transition-transform duration-300", className)} />
    </span>
  );
}

const MENU_ROW_CLASS = "group flex w-full items-center gap-4 border-b border-white/10 py-4 text-left text-white [@media(max-height:700px)]:py-3";

/** A menu row's insides: icon tile, title over its hint, and the round end icon. */
function MenuRowBody({ label, href, current = false, end }: { label: string; href: string; current?: boolean; end: React.ReactNode }) {
  const { hint, Icon } = MENU_ROWS[href];
  return (
    <>
      <span
        aria-hidden="true"
        className="grid size-12 shrink-0 place-items-center rounded-[14px] border border-white/10 bg-white/[0.05] text-[#1ee9b5] transition-colors duration-300 group-hover:border-[#1ee9b5]/40 group-hover:bg-[#1ee9b5]/10"
      >
        <Icon strokeWidth={1.7} className="size-[22px]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={cn("font-title text-[clamp(24px,6.5vw,32px)] font-medium leading-none tracking-[-0.02em]", current && "text-[#1ee9b5]")}>{label}</span>
        <span className="truncate type-small text-white/50">{hint}</span>
      </span>
      {end}
    </>
  );
}

/**
 * The menu's "Courses" row: like the bar's Courses dropdown, it opens to the
 * subjects, each linking to the filtered catalogue, then "All courses".
 */
function MenuCourses({ subjects, onPick }: { subjects: NavSubject[]; onPick: () => void }) {
  const [open, setOpen] = useState(false);
  const total = subjects.reduce((n, s) => n + s.count, 0);
  return (
    <div className="border-b border-white/10">
      <button type="button" aria-expanded={open} aria-controls="menu-courses" onClick={() => setOpen((v) => !v)} className={cn(MENU_ROW_CLASS, "border-b-0")}>
        <MenuRowBody label="Courses" href="/courses" end={<RowIcon Icon={ChevronDown} active={open} className={cn(open && "rotate-180")} />} />
      </button>
      <div
        id="menu-courses"
        inert={!open}
        className={cn("grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
      >
        <div className="overflow-hidden">
          <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 pb-5 sm:grid-cols-2">
            {subjects.map((s) => {
              const Icon = subjectIcon(s.name);
              return (
                <li key={s.slug}>
                  <Link
                    href={`/courses?category=${encodeURIComponent(s.slug)}`}
                    onClick={onPick}
                    className="group/s flex items-center gap-3 rounded-[14px] border border-white/[0.06] bg-white/[0.03] p-2.5 pr-4 transition-colors hover:border-white/15 hover:bg-white/[0.06]"
                  >
                    <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[#1ee9b5]/10 text-[#1ee9b5]">
                      <Icon strokeWidth={1.8} className="size-[18px]" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate type-small font-semibold text-white">{s.name}</span>
                      <span className="type-caption text-white/45">
                        {s.count} course{s.count === 1 ? "" : "s"}
                      </span>
                    </span>
                    <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-white/35 transition-[color,translate] group-hover/s:translate-x-0.5 group-hover/s:text-[#1ee9b5]" />
                  </Link>
                </li>
              );
            })}
            <li className="sm:col-span-2">
              <Link
                href="/courses"
                onClick={onPick}
                className="flex h-12 items-center justify-between gap-4 rounded-[14px] bg-[#1ee9b5] px-4 type-button font-semibold text-[#06180b] transition-colors hover:bg-[#5ef0c9]"
              >
                <span className="flex items-center gap-2.5">
                  <LayoutGrid aria-hidden="true" strokeWidth={1.8} className="size-[18px]" />
                  Browse all {total} courses
                </span>
                <ArrowRight aria-hidden="true" className="size-[18px]" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const PILL = "flex h-12 items-center justify-center gap-2 rounded-full px-5 type-button font-semibold transition-colors";
const PILL_MINT = cn(PILL, "bg-[#1ee9b5] text-[#06180b] hover:bg-[#5ef0c9]");
const PILL_GHOST = cn(PILL, "border border-white/20 text-white hover:border-white/40 hover:bg-white/[0.06]");

/**
 * The menu's account block (phones only: from 540px the bar carries Log in /
 * the profile menu). Signed out, Log in and Sign up; signed in, who you are,
 * My account and Log out.
 */
function MenuAccount({ user, onPick, onLogout }: { user: ProfileMenuUser | null; onPick: () => void; onLogout: () => void }) {
  if (!user) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Link href="/register" onClick={onPick} className={PILL_GHOST}>
          Sign up
        </Link>
        <Link href="/login" onClick={onPick} className={PILL_MINT}>
          <LogIn aria-hidden="true" strokeWidth={1.8} className="size-[18px]" />
          Log in
        </Link>
      </div>
    );
  }
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const initials = (user.firstName && user.lastName ? user.firstName[0] + user.lastName[0] : name.slice(0, 2)).toUpperCase();
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-[#1ee9b5] type-small font-semibold text-[#06180b]">
          {initials}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate type-body font-semibold text-white">{name}</span>
          <span className="truncate type-small text-white/55">{user.email}</span>
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button type="button" onClick={onLogout} className={PILL_GHOST}>
          <LogOut aria-hidden="true" strokeWidth={1.8} className="size-[18px]" />
          Log out
        </button>
        <Link href="/account" onClick={onPick} className={PILL_MINT}>
          <UserRound aria-hidden="true" strokeWidth={1.8} className="size-[18px]" />
          My account
        </Link>
      </div>
    </div>
  );
}

/** "Courses" opens a list of the subjects, each linking to the filtered catalogue. */
function CoursesMenu({ subjects }: { subjects: NavSubject[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!subjects.length) {
    return (
      <Link href="/courses" className="group type-small font-medium text-white/90 transition-colors hover:text-white">
        <FlipText>Courses</FlipText>
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="nav-courses"
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-1.5 type-small font-medium text-white/90 transition-colors hover:text-white"
      >
        <FlipText>Courses</FlipText>
        <Chevron open={open} />
      </button>
      <AnimatePresence>
        {open && (
          // The top padding bridges the gap to the button, so moving the pointer down doesn't close the menu.
          <div id="nav-courses" className="absolute -left-3 top-full w-[256px] pt-6">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="rounded-[18px] border border-white/10 bg-[#0b2215] p-1.5 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)]"
            >
              <ul className="m-0 list-none p-0">
                {subjects.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/courses?category=${encodeURIComponent(s.slug)}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-4 rounded-[12px] px-3 py-2.5 type-small text-white/90 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      {s.name}
                      <span className="type-caption tabular-nums text-white/50">{s.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/courses"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center justify-between rounded-[12px] bg-[#1ee9b5] px-3 py-2.5 type-button font-medium text-[#06180b] transition-colors hover:bg-[#5ef0c9]"
              >
                All courses
                <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The mint pill with the ink circle that fills it on hover (same as the site-wide navbar). */
function AccountButton({ href, label, className = "" }: { href: string; label: string; className?: string }) {
  return (
    <Link href={href} className={cn("group relative h-11 items-center gap-2 rounded-full bg-[#1ee9b5] py-1.5 pl-5 pr-1.5 type-button font-semibold text-[#06180b]", className)}>
      <span className="relative z-10 whitespace-nowrap transition-colors duration-300 group-hover:text-white">
        <FlipText>{label}</FlipText>
      </span>
      <span
        aria-hidden="true"
        className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#06180b] transition-all duration-200 ease-in-out group-hover:right-1 group-hover:h-[calc(100%-8px)] group-hover:w-[calc(100%-8px)] group-hover:duration-500"
        style={{ transitionProperty: "height, width, right", transitionDelay: "0ms, 200ms, 200ms" }}
      />
      <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src="/navbar/icon-log-in.svg" className="size-4 transition-transform duration-300 group-hover:scale-110" />
      </span>
    </Link>
  );
}

/**
 * The site navbar (every page, from the root layout), laid out like the educateU site's: logo on the left; the links, a divider, cart and Log in on
 * the right. It fills in as the screen widens: phones get the logo, cart and
 * menu button, with Log in and Sign up in the menu; from 540px Log in moves to the bar, from
 * 1024px the links (the menu button goes), and from 1280px the cart spells
 * out "CART (n)". 84px tall (20px above and below a 44px row), ink, full width.
 * Once the page scrolls it tightens to 68px and turns translucent with a
 * blur; it stays on screen the whole way down. --home-nav-h in
 * globals.css mirrors the resting height so the hero clears it.
 */
export default function SiteNav({ subjects = [] }: { subjects?: NavSubject[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // The cart lives in the browser, so its count only exists after hydration.
  const mounted = useCartHydrated();
  const count = useCartStore((s) => s.items.length);
  const cartOpen = useCartStore((s) => s.isOpen);
  const setCartOpen = useCartStore((s) => s.setIsOpen);
  const cartRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOpen(false);
    // The account page is server-rendered from the cookie, so it stays on
    // screen after logout unless we leave it; elsewhere, refresh so server
    // components (and the router cache) drop the logged-in render.
    if (pathname === "/account" || pathname.startsWith("/account/")) router.replace("/");
    else router.refresh();
  };
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  const account: [string, string] = user ? ["My account", "/account"] : ["Log in", "/login"];
  const shownCount = mounted ? count : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The cart dropdown closes on a click anywhere outside it.
  useEffect(() => {
    if (!cartOpen) return;
    const onDown = (e: MouseEvent) => cartRef.current && !cartRef.current.contains(e.target as Node) && setCartOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [cartOpen, setCartOpen]);

  // With a mouse or trackpad the open menu scrolls on its own Lenis, eased
  // like the page, so the wheel glides through the menu instead of
  // stepping. Touch is left to the browser: a phone's native momentum scroll
  // runs off the main thread and tracks the finger, where a JS-driven one
  // (syncTouch) lags behind it. Native too on reduced-motion / low-power
  // clients, like the page itself.
  useEffect(() => {
    const wrapper = menuRef.current;
    const content = menuContentRef.current;
    if (!open || !wrapper || !content || !allowHeavyMotion()) return;
    if (window.matchMedia("(pointer: coarse) and (hover: none)").matches) return;
    const lenis = new Lenis({ wrapper, content, lerp: 0.1, smoothWheel: true, autoRaf: true });
    return () => lenis.destroy();
  }, [open]);

  // Pages written for the old navbar read --navbar-height (sticky sidebars,
  // the old hero's pull-up). Give them the bar's resting height, which the
  // stylesheet keeps in --home-nav-h per breakpoint, so nothing shifts when
  // the bar tightens on scroll.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const sync = () => root.style.setProperty("--navbar-height", getComputedStyle(root).getPropertyValue("--home-nav-h").trim() || "84px");
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  // The /new/b design direction ships its own navigation.
  if (pathname.startsWith("/new/") && pathname !== "/new/c") return null;

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-[90] text-white transition-[background-color,padding,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          // Over the open menu the bar is always solid: the menu scrolls under
          // it (a clear bar would show the rows behind the logo), and a
          // backdrop blur over a scrolling layer is re-rendered every frame,
          // which phones stutter on.
          scrolled && open
            ? "bg-[#06180b] py-3"
            : scrolled
            ? "bg-[#06180b]/[0.86] py-3 backdrop-blur-[14px]"
            : isOverFilm(pathname) && !open
              ? "bg-transparent py-[14px] lg:py-5"
              : "bg-[#06180b] py-[14px] lg:py-5",
        )}
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="site-container flex h-11 items-center justify-between gap-4 lg:gap-7">
          <Link href="/" aria-label="educateU Business home" className="flex h-10 shrink-0 items-stretch gap-2">
            {/* The mark sits high and the wordmark low, as in the design. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/navbar/logo-circle.png" alt="" className="size-[31px] self-start" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/navbar/logo-wordmark.png" alt="" className="h-8 w-auto self-end" />
          </Link>

          {/* The page links sit with the cart and Log in on the right; a divider keeps pages apart from account actions. */}
          <nav aria-label="Main" className="ml-auto hidden items-center gap-7 lg:flex xl:gap-8">
            <CoursesMenu subjects={subjects} />
            {LINKS.map(([label, href]) => (
              <Link key={href} href={href} className="group whitespace-nowrap type-small font-medium text-white/90 transition-colors hover:text-white">
                <FlipText>{label}</FlipText>
              </Link>
            ))}
            {user && (
              <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer" className="group whitespace-nowrap type-small font-medium text-white/90 transition-colors hover:text-white">
                <FlipText>Portal login</FlipText>
              </a>
            )}
          </nav>
          <span aria-hidden="true" className="hidden h-5 w-px bg-white/20 lg:block" />

          <div className="flex items-center gap-3 sm:gap-4 xl:gap-5">
            {/* Below md the wrapper is static, so the dropdown anchors to the
                header itself and opens as a full-width sheet under the bar —
                anchored to the cart icon it would run off the left edge. */}
            <div ref={cartRef} className="md:relative">
              <button
                type="button"
                aria-expanded={cartOpen}
                aria-haspopup="true"
                aria-label={`Cart, ${shownCount} item${shownCount === 1 ? "" : "s"}`}
                onClick={() => {
                  setOpen(false);
                  setCartOpen(!cartOpen);
                }}
                className="group flex size-11 items-center justify-center gap-1 type-small font-medium xl:size-auto"
              >
                <span id="navbar-cart-icon" className="relative flex shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" src="/navbar/icon-shopping-cart.svg" className="size-[18px]" />
                  {shownCount > 0 && (
                    <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-[#1ee9b5] text-[10px] font-medium leading-none text-[#06180b] xl:hidden">
                      {shownCount}
                    </span>
                  )}
                </span>
                <FlipText className="hidden xl:inline-block">
                  CART <span className="text-[#1ee9b5]">({shownCount})</span>
                </FlipText>
              </button>
              <div
                inert={!cartOpen}
                className={cn(
                  "absolute inset-x-5 top-full z-50 mt-2 origin-top transition-[opacity,translate,scale,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:inset-x-auto md:right-0 md:mt-6 md:origin-top-right md:duration-300",
                  cartOpen
                    ? "visible translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none invisible -translate-y-2 opacity-0 md:-translate-y-3 md:scale-95 motion-reduce:translate-y-0 motion-reduce:scale-100",
                )}
              >
                <CartDropdown />
              </div>
            </div>

            {user ? (
              <div className="hidden sm:block">
                <ProfileMenu user={user} onLogout={logout} />
              </div>
            ) : (
              <AccountButton href={account[1]} label={account[0]} className="hidden sm:flex" />
            )}

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => {
                setCartOpen(false);
                setOpen((v) => !v);
              }}
              className="relative grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.06] lg:hidden"
            >
              <span className={`absolute h-[2px] w-4 bg-white transition-transform ${open ? "rotate-45" : "-translate-y-1"}`} />
              <span className={`absolute h-[2px] w-4 bg-white transition-transform ${open ? "-rotate-45" : "translate-y-1"}`} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            // The page's Lenis leaves this alone; the menu's own (above) scrolls it.
            data-lenis-prevent
            className="fixed inset-0 z-[85] overflow-y-auto overscroll-contain bg-[#06180b] text-white lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            // Drop the clip once open: a clipped scroller can't scroll on the compositor, which shows as jank.
            animate={{ clipPath: "inset(0 0 0% 0)", transitionEnd: { clipPath: "none" } }}
            exit={{ clipPath: ["inset(0 0 0% 0)", "inset(0 0 100% 0)"] }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {/* The page links sit at the top at their natural height; help and
                the account block are pushed to the bottom, within thumb reach.
                On a screen too short for both, the menu scrolls. */}
            <div ref={menuContentRef} className="flex min-h-full flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[88px] md:px-10 md:pb-10 md:pt-28">
              <nav aria-label="Menu" className="border-t border-white/10">
                {([["Courses", "/courses"], ...LINKS, ...(user ? [["Portal login", PORTAL_URL]] : [])] as [string, string][]).map(([label, href], i) => (
                  <motion.div key={href} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.06, duration: 0.6, ease: EASE }}>
                    {href === "/courses" && subjects.length > 0 ? (
                      <MenuCourses subjects={subjects} onPick={() => setOpen(false)} />
                    ) : (
                      <Link
                        href={href}
                        {...(href === PORTAL_URL && { target: "_blank", rel: "noopener noreferrer" })}
                        onClick={() => setOpen(false)}
                        aria-current={pathname === href ? "page" : undefined}
                        className={MENU_ROW_CLASS}
                      >
                        <MenuRowBody
                          label={label}
                          href={href}
                          current={pathname === href}
                          end={href === PORTAL_URL ? <RowIcon Icon={ArrowUpRight} /> : <RowIcon Icon={ArrowRight} className="group-hover:translate-x-0.5" />}
                        />
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>

              <motion.div
                className="mt-5 grid grid-cols-2 gap-3"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
              >
                {MENU_EXTRAS.map(([label, hint, href, Icon]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-[#1ee9b5]/40 hover:bg-white/[0.05]"
                  >
                    <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[#1ee9b5]/10 text-[#1ee9b5]">
                      <Icon strokeWidth={1.8} className="size-[18px]" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="type-small font-semibold leading-tight text-white">{label}</span>
                      <span className="hidden type-caption text-white/50 sm:block">{hint}</span>
                    </span>
                  </Link>
                ))}
              </motion.div>

              <motion.div
                className="mt-auto flex flex-col gap-6 pt-10"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: EASE }}
              >
                <div>
                  <p className="m-0 type-caption font-medium uppercase tracking-[0.08em] text-white/45">Need help? Talk to an advisor</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {(
                      [
                        [`tel:${PHONE.replace(/\s/g, "")}`, PHONE, "Mon–Fri, 9am–6pm (GMT)", Phone],
                        [`mailto:${EMAIL}`, EMAIL, "Reply within 24 hours", Mail],
                      ] as const
                    ).map(([href, label, hint, Icon]) => (
                      <a key={href} href={href} className="group flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-white/20">
                        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[#1ee9b5]/10 text-[#1ee9b5]">
                          <Icon strokeWidth={1.8} className="size-[18px]" />
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate type-small font-semibold text-white transition-colors group-hover:text-[#1ee9b5]">{label}</span>
                          <span className="truncate type-caption text-white/50">{hint}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
                <div className="sm:hidden">
                  <MenuAccount user={user} onPick={() => setOpen(false)} onLogout={logout} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
