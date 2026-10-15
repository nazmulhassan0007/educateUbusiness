"use client";

import { useRef, useState } from "react";
import PrimaryButton from "@/components/shared/buttons/PrimaryButton";

type Status = "idle" | "sending" | "done" | "error";

/** The confirm step on /newsletter/unsubscribe: one button, then the outcome. */
export default function UnsubscribeConfirm({ email, token }: { email: string; token: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const doneRef = useRef<HTMLHeadingElement>(null);

  const unsubscribe = async () => {
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const query = new URLSearchParams({ email, token }).toString();
      const res = await fetch(`/api/newsletter/unsubscribe?${query}`, { method: "POST" });
      const result = (await res.json()) as { success: boolean; error?: string };
      if (!result.success) {
        setStatus("error");
        setError(result.error ?? "Could not unsubscribe right now. Please try again.");
        return;
      }
      setStatus("done");
      // The button this replaced had focus; hand it to the outcome.
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch {
      setStatus("error");
      setError("Could not unsubscribe right now. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#cdd1ce] bg-[#f7f8f7] p-5 sm:p-6">
      {status === "done" ? (
        <div role="status" className="flex flex-col gap-3">
          <h2 ref={doneRef} tabIndex={-1} className="font-title type-h4 text-[#06180b] outline-none">
            You&rsquo;ve been unsubscribed
          </h2>
          <p className="type-body font-light text-[#42697c]">
            <span className="font-medium text-[#06180b]">{email}</span> won&rsquo;t receive the
            educateU newsletter any more. Changed your mind? Sign up again at the bottom of any page.
          </p>
        </div>
      ) : (
        <>
          <h2 className="font-title type-h4 text-[#06180b]">Unsubscribe from the newsletter?</h2>
          <p className="type-body font-light text-[#42697c]">
            <span className="font-medium text-[#06180b]">{email}</span> will stop receiving
            newsletter emails from educateU. Emails about your account, courses and orders are
            not affected.
          </p>
          <div className="flex flex-col items-start gap-3">
            <PrimaryButton
              label={status === "sending" ? "Unsubscribing…" : "Unsubscribe"}
              onClick={unsubscribe}
              disabled={status === "sending"}
            />
            {status === "error" && (
              <p role="alert" className="type-small text-[#a3341a]">
                {error}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
