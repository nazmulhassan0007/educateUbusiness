"use client";

import { useEffect, useState } from "react";
import { parseDate } from "@/lib/utils";

function getTimeParts(msRemaining: number) {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export default function OfferCountdown({ endsAt }: { endsAt: string }) {
  // `null` until mounted — `Date.now()` must never run during the render
  // that produces the SSR HTML, since the server renders at one instant and
  // the client hydrates at a later one; computing "now" in both would give
  // two different values and trip a hydration mismatch.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Ticks on an interval only (no synchronous setState call in the effect
    // body itself) — the countdown appears within 1s of mount rather than
    // instantly, trading a small delay for satisfying
    // react-hooks/set-state-in-effect cleanly.
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = now === null ? null : parseDate(endsAt).getTime() - now;
  const expired = remaining !== null && remaining <= 0;
  const parts = remaining === null ? null : getTimeParts(remaining);

  return (
    <div className="absolute left-1/2 top-0 flex -translate-x-1/2 items-center md:left-auto md:right-0 md:translate-x-0">
      <div className="flex items-center justify-center rounded-bl-lg rounded-tl-lg bg-[#68161a] px-[17px] py-[14px]">
        <p className="whitespace-nowrap type-lead font-semibold text-surface-white">
          {expired ? "🔥 Offer Ended" : "🔥 Offer Ends In"}
        </p>
      </div>
      {!expired && parts && (
        <div className="flex items-center justify-center rounded-tr-[30px] bg-[rgba(104,22,26,0.4)] px-[17px] py-[14px]">
          <p className="whitespace-nowrap type-lead font-semibold text-surface-white">
            {parts.hours}h: {parts.minutes}m: {parts.seconds}s
          </p>
        </div>
      )}
    </div>
  );
}
