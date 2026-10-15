"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import PasswordInput from "@/components/shared/PasswordInput";
import { Arrow, Check } from "@/components/page-components/concepts/shared";
import { cn } from "@/lib/utils";

// The Contact form's field (ContactEnquiry), so every form on the site reads alike.
const INPUT =
  "h-[56px] w-full rounded-[10px] border bg-[#f7f6f1] px-5 text-[17px] text-[#06180b] caret-[#0c7a5e] outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-[#06180b]/45";
const INPUT_OK = "border-[#06180b]/10 hover:border-[#06180b]/25 focus:border-[#0c7a5e] focus:shadow-[0_0_0_3px_rgb(30_233_181/0.25)]";
const INPUT_BAD = "border-[#c2410c] shadow-[0_0_0_1px_#c2410c]";

export const LINK = "font-medium text-[#0c7a5e] underline underline-offset-4 transition-colors hover:text-[#06180b]";

function Alert() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-[3px] shrink-0">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 4v3.5M7 9.6v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** The card's heading and the line under it. */
export function CardHead({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="m-0 font-title type-h3 font-normal tracking-[-0.035em]">{title}</h2>
      {children && <p className="m-0 mt-3 type-body text-[#06180b]/75">{children}</p>}
    </div>
  );
}

/** A labelled field; `password` swaps in the show/hide input. */
export function Field({
  id,
  label,
  error,
  hint,
  password,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  password?: boolean;
}) {
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  const control = {
    ...props,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy,
    className: cn(INPUT, error ? INPUT_BAD : INPUT_OK, className),
  };

  return (
    <label className="flex min-w-0 flex-col gap-2.5">
      <span className="type-small font-medium">
        {label} {props.required && <span className="text-[#0c7a5e]">*</span>}
      </span>
      {password ? (
        <PasswordInput {...control} iconClassName="text-[#06180b]/60 transition-colors hover:text-[#06180b]" />
      ) : (
        <input id={id} {...control} />
      )}
      <AnimatePresence initial={false}>
        {error && (
          <motion.span
            id={`${id}-err`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="-mt-0.5 flex gap-1.5 overflow-hidden type-small text-[#a3341a]"
          >
            <Alert />
            <span>{error}</span>
          </motion.span>
        )}
      </AnimatePresence>
      {!error && hint && (
        <span id={`${id}-hint`} className="-mt-0.5 type-small text-[#06180b]/70">
          {hint}
        </span>
      )}
    </label>
  );
}

/**
 * The emailed six-digit code: one input, so pasting the whole code and the
 * phone's "from Messages" suggestion both work.
 */
export function CodeField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="type-small font-medium">
        {label} <span className="text-[#0c7a5e]">*</span>
      </span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\s+/g, ""))}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        maxLength={12}
        placeholder="••••••"
        required
        className={cn(
          INPUT,
          INPUT_OK,
          "h-[68px] text-center font-[family-name:var(--font-geist-mono)] text-[28px] tracking-[0.45em] tabular-nums placeholder:tracking-[0.45em] placeholder:text-[#06180b]/25",
        )}
      />
    </label>
  );
}

export function Checkbox({ checked, onChange, children, required }: { checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-px grid size-[22px] shrink-0 place-items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          required={required}
          className="peer size-[22px] cursor-pointer appearance-none rounded-[6px] border border-[#06180b]/25 bg-[#f7f6f1] transition-colors checked:border-[#06180b] checked:bg-[#06180b] hover:border-[#06180b]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c7a5e]"
        />
        <span className="pointer-events-none absolute text-[#1ee9b5] opacity-0 transition-opacity peer-checked:opacity-100">
          <Check size={12} />
        </span>
      </span>
      <span className="type-small text-[#06180b]/85">{children}</span>
    </label>
  );
}

const PILL =
  "group relative inline-flex h-[60px] w-full shrink-0 items-center justify-between gap-4 overflow-hidden rounded-full bg-[#06180b] py-1.5 pl-7 pr-1.5 type-button font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0c7a5e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f2efe6]";

function PillInner({ children, busy }: { children: React.ReactNode; busy?: boolean }) {
  return (
    <>
      <span aria-hidden="true" className="absolute inset-y-0 right-0 w-0 rounded-full bg-[#0c3a28] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
      <span className="relative">{children}</span>
      <span
        className={`relative grid size-[46px] place-items-center rounded-full bg-[#1ee9b5] text-[#06180b] transition-transform duration-500 group-hover:-rotate-45 ${busy ? "animate-pulse" : ""}`}
      >
        <Arrow size={14} />
      </span>
    </>
  );
}

/** The dark pill with the mint arrow, as on the Contact form. */
export function SubmitButton({ children, busy, disabled }: { children: React.ReactNode; busy?: boolean; disabled?: boolean }) {
  return (
    <button type="submit" disabled={disabled} aria-busy={busy} className={cn(PILL, "cursor-pointer disabled:pointer-events-none disabled:opacity-55")}>
      <PillInner busy={busy}>{children}</PillInner>
    </button>
  );
}

export function PillLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={PILL}>
      <PillInner>{children}</PillInner>
    </Link>
  );
}

/** A form-wide problem, read out as it appears. */
export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {children && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="m-0 flex gap-2 rounded-[10px] border border-[#c2410c]/30 bg-[#c2410c]/[0.06] px-4 py-3 type-small text-[#a3341a]"
        >
          <Alert />
          <span>{children}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function FormNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="status" className="m-0 flex items-center gap-2 type-small text-[#0c7a5e]">
      <span className="grid size-5 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b]">
        <Check size={9} />
      </span>
      {children}
    </p>
  );
}

/** The quiet line under the button: "Don't have an account? Register". */
export function SwitchLine({ children }: { children: React.ReactNode }) {
  return <p className="m-0 mt-7 border-t border-[#06180b]/10 pt-6 text-center type-small text-[#06180b]/75">{children}</p>;
}
