"use client";

import { IoAddOutline, IoRemoveOutline } from "react-icons/io5";

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  variant = "dark",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  variant?: "dark" | "light";
}) {
  const isLight = variant === "light";
  const buttonClass = `flex size-9 shrink-0 items-center justify-center rounded-full border ${
    isLight ? "border-[#cdd1ce] text-[#042018]" : "border-white/9 text-on-dark"
  }`;

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${buttonClass} cursor-pointer transition-opacity disabled:cursor-not-allowed disabled:opacity-35`}
      >
        <IoRemoveOutline className="size-4" />
      </button>
      <span
        aria-live="polite"
        className={`min-w-[2ch] text-center type-body font-medium tabular-nums ${isLight ? "text-[#042018]" : "text-on-dark"}`}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(value + 1)}
        className={`${buttonClass} cursor-pointer`}
      >
        <IoAddOutline className="size-4" />
      </button>
    </div>
  );
}
