import Link from "next/link";
import { Arrow, Check } from "@/components/page-components/concepts/shared";
import { cn } from "@/lib/utils";

/*
 * The cart and checkout pages share the course page's light world (see
 * CourseOverview / CoursePurchaseCard): a cream band, panels lifted off it by
 * a soft ink shadow, ink text, deep mint for links and confirmations, and the
 * pill call-to-action with its round icon chip.
 */

/** The page band. */
export const PAGE =
  "ragged min-h-[70svh] bg-[#f2efe6] px-5 pb-24 pt-10 text-[#06180b] selection:bg-[#1ee9b5] selection:text-[#06180b] md:px-10 lg:pb-32 lg:pt-14";

/** A raised panel on the band. */
export const PANEL =
  "rounded-[20px] bg-[#f7f6f1] p-5 shadow-[0_24px_48px_-32px_rgb(6_24_11/0.35)] sm:p-8";

/** Panel and sub-section titles. */
export const PANEL_TITLE = "m-0 font-title type-h4 font-medium tracking-[-0.02em]";

/** Hairline between rows and groups. */
export const RULE = "h-px w-full bg-[#06180b]/12";

/** Text fields and selects. Locked (read-only) inputs dim; a select counts
 * as :read-only in CSS, so the lock style is scoped to inputs. */
export const FIELD =
  "h-12 w-full rounded-[14px] border border-[#06180b]/18 bg-white px-4 text-base leading-[1.6] text-[#06180b] caret-[#0c7a5e] transition-colors placeholder:text-[#06180b]/60 hover:border-[#06180b]/30 focus:border-[#0c7a5e] focus:outline-none focus:ring-4 focus:ring-[#1ee9b5]/25 [&:is(input):read-only]:cursor-not-allowed [&:is(input):read-only]:bg-[#06180b]/[0.04] [&:is(input):read-only]:text-[#06180b]/70 [&:is(input):read-only]:hover:border-[#06180b]/18";

/** A field in its error state (added after FIELD). */
export const FIELD_ERROR =
  "border-[#b42318] hover:border-[#b42318] focus:border-[#b42318] focus:ring-[#b42318]/15";

export const LABEL = "type-small font-medium text-[#06180b]/80";

/** Inline errors. */
export const ERROR_TEXT = "m-0 type-small text-[#b42318]";

/** Quiet text links. */
export const LINK =
  "cursor-pointer type-small font-medium text-[#0c7a5e] underline decoration-from-font underline-offset-[3px] transition-colors hover:text-[#06180b] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c7a5e]";

const PILL_TONES = {
  mint: {
    body: "bg-[#1ee9b5] text-[#06180b]",
    wipe: "bg-[#5ef0c9]",
    chip: "bg-[#06180b] text-[#f2efe6] group-hover:-rotate-45",
  },
  ink: {
    body: "bg-[#06180b] text-[#f2efe6]",
    wipe: "bg-[#0b3a28]",
    chip: "bg-[#1ee9b5] text-[#06180b] group-hover:-rotate-45",
  },
  outline: {
    body: "border border-[#06180b]/25 text-[#06180b]",
    wipe: "bg-[#06180b]/[0.06]",
    chip: "bg-[#06180b]/[0.08] text-[#06180b] group-hover:-rotate-45",
  },
} as const;

/**
 * The course page's call-to-action pill (CoursePurchaseCard's PillButton),
 * as a link, a button or a submit: label left, a round icon chip right, a
 * wipe of colour on hover. Disabled pills hold still.
 */
export function PillAction({
  children,
  tone = "mint",
  icon = <Arrow size={16} />,
  href,
  onClick,
  type = "button",
  disabled = false,
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof PILL_TONES;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const t = PILL_TONES[tone];
  const classes = cn(
    "relative flex h-[60px] w-full items-center justify-between gap-6 overflow-hidden rounded-full py-2 pl-6 pr-2 type-button font-medium transition-[transform,opacity] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c7a5e]",
    t.body,
    disabled ? "cursor-not-allowed opacity-45" : "group cursor-pointer active:scale-[0.985]",
    className,
  );
  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 right-0 w-0 rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full",
          t.wipe,
        )}
      />
      <span className="relative">{children}</span>
      <span
        aria-hidden="true"
        className={cn(
          "relative grid size-11 place-items-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          t.chip,
        )}
      >
        {icon}
      </span>
    </>
  );

  if (href) {
    return disabled ? (
      <span aria-disabled="true" className={classes}>
        {content}
      </span>
    ) : (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}

const STEPS = ["Cart", "Details", "Payment"] as const;
export type CheckoutStep = (typeof STEPS)[number];

/**
 * Where the buyer is in the purchase: the cart, their details, then payment.
 * Done steps carry a check, the current one a mint dot.
 */
export function StepRail({ current }: { current: CheckoutStep }) {
  const at = STEPS.indexOf(current);
  return (
    <ol aria-label="Checkout progress" className="m-0 flex list-none flex-wrap items-center gap-x-3 gap-y-2 p-0">
      {STEPS.map((step, i) => {
        const done = i < at;
        const active = i === at;
        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 type-small font-medium",
              active ? "text-[#06180b]" : done ? "text-[#0c7a5e]" : "text-[#06180b]/55",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid size-5 place-items-center rounded-full",
                done && "bg-[#1ee9b5]/30 text-[#0c7a5e]",
                active && "bg-[#06180b]",
                !done && !active && "border border-[#06180b]/25",
              )}
            >
              {done && <Check size={10} />}
              {active && <span className="size-1.5 rounded-full bg-[#1ee9b5]" />}
            </span>
            {step}
            {done && <span className="sr-only">(done)</span>}
            {i < STEPS.length - 1 && (
              <span aria-hidden="true" className="ml-1 h-px w-6 bg-[#06180b]/20 sm:w-10" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The page's opening: the step rail, the title, and whatever sits opposite it
 * (a count, a way back).
 */
export function CheckoutHeader({
  step,
  title,
  aside,
}: {
  step: CheckoutStep;
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-6">
      <StepRail current={step} />
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h1 className="m-0 font-title type-h1 font-normal tracking-[-0.03em]">{title}</h1>
        {aside}
      </div>
    </header>
  );
}

/** One label / amount line in an order summary. */
export function SummaryRow({
  label,
  value,
  tone = "default",
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: "default" | "saving";
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 type-small",
        tone === "saving" ? "font-medium text-[#0c7a5e]" : "text-[#06180b]/70",
      )}
    >
      <span>{label}</span>
      <span className={cn("tabular-nums", tone === "default" && "text-[#06180b]")}>{value}</span>
    </div>
  );
}

/** The total at the foot of a summary. */
export function SummaryTotal({ label = "Total", value }: { label?: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="type-body font-medium">{label}</span>
      <span className="font-title type-h3 font-normal tracking-[-0.02em] tabular-nums">{value}</span>
    </div>
  );
}

/** A guidance note inside a panel (not an error). */
export function Note({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "error" }) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "rounded-[14px] px-4 py-3 type-small",
        tone === "error" ? "bg-[#b42318]/[0.07] text-[#b42318]" : "bg-[#06180b]/[0.05] text-[#06180b]/80",
      )}
    >
      {children}
    </div>
  );
}
