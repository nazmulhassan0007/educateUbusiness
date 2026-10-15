"use client";

import { useState, type FormEvent } from "react";
import PrimaryButton from "@/components/shared/buttons/PrimaryButton";

type SubscribeStatus = "idle" | "submitting" | "subscribed" | "error";

export default function NewsletterForm({
  ctaLabel = "Subscribe",
  variant = "pill",
}: {
  ctaLabel?: string;
  // "field": the homepage footer's squared field with a plain mint button.
  variant?: "pill" | "field";
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscribeStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "submitting" || status === "subscribed") return;

    setStatus("submitting");
    setError(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!result.success) {
        setStatus("error");
        setError(result.error ?? "Could not subscribe right now");
        return;
      }

      setStatus("subscribed");
    } catch {
      setStatus("error");
      setError("Could not subscribe right now");
    }
  };

  const buttonLabel =
    status === "submitting"
      ? "Subscribing..."
      : status === "subscribed"
        ? "Subscribed!"
        : status === "error"
          ? "Try Again"
          : ctaLabel;

  const isBusy = status === "submitting" || status === "subscribed";

  if (variant === "field") {
    return (
      <div className="flex w-full flex-col gap-2">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center gap-2 rounded-[14px] border border-[#f2efe6]/18 bg-[#06180b]/60 py-1.5 pl-[18px] pr-1.5 transition-colors focus-within:border-[#1ee9b5]/60"
        >
          <label className="min-w-0 flex-1">
            <span className="sr-only">Email address</span>
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isBusy}
              className="w-full bg-transparent text-base md:text-[15px] leading-[22px] text-[#f2efe6] outline-none placeholder:text-[#f2efe6]/60 disabled:opacity-60"
            />
          </label>
          <button
            type="submit"
            disabled={isBusy}
            className="shrink-0 rounded-[10px] bg-[#1ee9b5] px-[22px] py-[13px] type-button font-medium text-[#06180b] transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            {buttonLabel}
          </button>
        </form>
        {status === "error" && error && <p className="m-0 type-small text-[#f08083]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[320px] shrink-0 flex-col gap-2 sm:max-w-[483px]">
      <div className="relative w-full overflow-hidden rounded-full">
        {/* Decorative glow behind the pill, using plain blur (like the
            FAQ cards' glow) instead of a box-shadow — a box-shadow's blur
            falloff is harsher and gets clipped to a hard edge by this
            wrapper's overflow-hidden, which read as a rough/banded glow
            rather than a smooth one. */}
        {/* <div
          className="pointer-events-none absolute left-[28%] top-1/2 h-[200%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/60 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-[8%] top-1/2 h-[180%] w-[18%] -translate-x-1/2 -translate-y-1/2 rotate-[-20.54deg] rounded-full bg-primary-700/60 blur-2xl"
          aria-hidden
        /> */}

        <form
          onSubmit={handleSubmit}
          className="relative z-10 flex w-full items-center justify-between gap-2 rounded-full border border-white/9 bg-[rgba(137,137,137,0.05)] p-2 pl-4 backdrop-blur-[75px] sm:p-2.5 sm:pl-6"
        >
          <label className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <img
              alt=""
              className="size-5 shrink-0 sm:size-6"
              src="/footer/icon-mail.svg"
            />
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isBusy}
              className="min-w-0 flex-1 bg-transparent text-base text-accent-50 outline-none placeholder:text-accent-50 disabled:opacity-60 sm:text-base"
            />
          </label>
          <PrimaryButton
            label={buttonLabel}
            disabled={isBusy}
            className="gap-1 py-1.5 pl-3 pr-1.5 sm:gap-2 sm:py-[10px] sm:pl-[17px] sm:pr-[10px]"
          />
        </form>
      </div>

      {status === "error" && error && (
        <p className="px-4 type-small text-[#f08083]">{error}</p>
      )}
    </div>
  );
}
