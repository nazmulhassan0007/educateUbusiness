"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/page-components/auth/AuthShell";
import {
  CardHead,
  CodeField,
  Field,
  FormError,
  FormNote,
  LINK,
  PillLink,
  SubmitButton,
  SwitchLine,
} from "@/components/page-components/auth/fields";
import { Check } from "@/components/page-components/concepts/shared";
import PasswordHint from "@/components/page-components/auth/PasswordHint";
import { authErrorMessage, callAuthRoute } from "@/lib/auth/client";
import { missingPasswordRules } from "@/lib/auth/password";
import { safeRedirect } from "@/lib/auth/redirect";

type Step = "email" | "otp" | "reset" | "done";

const STEPS = [
  { title: "Tell us your email", body: "The one on your educateU account." },
  { title: "Enter the 6-digit code", body: "We email it to you straight away." },
  { title: "Choose a new password" },
];

const STEP_INDEX: Record<Step, number> = { email: 0, otp: 1, reset: 2, done: 3 };

export default function ForgotPasswordForm() {
  // Read directly from `window.location` (rather than `useSearchParams`) so
  // the page needs no Suspense boundary that would render the whole form on
  // the client only — see the matching comment in LoginForm.
  const [redirect, setRedirect] = useState<string | null>(null);
  useEffect(() => {
    // One-time sync from an external system (the URL) on mount. Only a
    // same-site path survives — see src/lib/auth/redirect.ts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRedirect(
      safeRedirect(new URLSearchParams(window.location.search).get("redirect"), null),
    );
  }, []);
  const loginHref = redirect
    ? `/login?redirect=${encodeURIComponent(redirect)}`
    : "/login";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const mismatch =
    Boolean(confirmPassword) && newPassword !== confirmPassword
      ? "These passwords don’t match."
      : null;

  const passwordMissing = missingPasswordRules(newPassword);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await callAuthRoute("/api/auth/forgot-password", {
      email: email.trim(),
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(authErrorMessage(result, "Something went wrong. Please try again."));
      return;
    }

    setStep("otp");
  }

  async function handleResend() {
    setError(null);
    setResendMessage(null);
    setIsResending(true);

    const result = await callAuthRoute("/api/auth/resend-otp", {
      email: email.trim(),
    });
    setIsResending(false);

    if (!result.ok) {
      setError(authErrorMessage(result, "Couldn't resend the code. Please try again."));
      return;
    }

    setResendMessage("A new code has been sent.");
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await callAuthRoute("/api/auth/verify-reset-otp", {
      email: email.trim(),
      otp: otp.trim(),
    });
    setIsSubmitting(false);

    if (!result.ok || !result.data.valid) {
      setError(authErrorMessage(result, "Invalid or expired code. Please try again."));
      return;
    }

    setError(null);
    setResendMessage(null);
    setStep("reset");
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (passwordMissing.length > 0) {
      setError(`Your password still needs ${passwordMissing.join(", ")}.`);
      return;
    }

    setIsSubmitting(true);

    const result = await callAuthRoute("/api/auth/reset-password", {
      email: email.trim(),
      otp: otp.trim(),
      newPassword,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(authErrorMessage(result, "Something went wrong. Please try again."));
      return;
    }

    setStep("done");
  }

  const back = (
    <SwitchLine>
      Remembered it after all?{" "}
      <Link href={loginHref} className={LINK}>
        Log in
      </Link>
    </SwitchLine>
  );

  return (
    <AuthShell
      crumb="Forgotten password"
      title={["Locked out?", "Let’s get you back in."]}
      subtitle="Three short steps, and the reset code comes to the email on your account."
      steps={STEPS}
      current={STEP_INDEX[step]}
      stage={step}
    >
      {step === "done" ? (
        <div className="flex flex-col gap-8">
          <span className="grid size-12 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b]">
            <Check size={16} />
          </span>
          <CardHead title="Your password is reset.">
            Log in with your new password to carry on.
          </CardHead>
          <PillLink href={loginHref}>Log in</PillLink>
        </div>
      ) : step === "otp" ? (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
          <CardHead title="Check your email">
            We&apos;ve sent a 6-digit reset code to{" "}
            <strong className="font-medium text-[#06180b]">{email.trim()}</strong>. Enter it below to continue.
          </CardHead>
          <CodeField id="reset-otp" label="Reset code" value={otp} onChange={setOtp} />
          <FormNote>{resendMessage}</FormNote>
          <FormError>{error}</FormError>
          <SubmitButton busy={isSubmitting} disabled={isSubmitting || !otp.trim()}>
            {isSubmitting ? "Checking…" : "Continue"}
          </SubmitButton>
          <p className="m-0 flex flex-wrap items-center justify-between gap-3 type-small text-[#06180b]/75">
            <span>
              Didn&apos;t get a code?{" "}
              <button type="button" onClick={handleResend} disabled={isResending} className={`${LINK} cursor-pointer disabled:opacity-50`}>
                {isResending ? "Sending…" : "Send it again"}
              </button>
            </span>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError(null);
                setResendMessage(null);
              }}
              className={`${LINK} cursor-pointer`}
            >
              Use a different email
            </button>
          </p>
        </form>
      ) : step === "reset" ? (
        <form onSubmit={handleResetPassword} className="flex flex-col">
          <CardHead title="Set a new password" />
          <div className="flex flex-col gap-5">
            <Field
              id="reset-new"
              label="New password"
              password
              autoComplete="new-password"
              placeholder="Choose a new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
              hint={<PasswordHint value={newPassword} />}
            />
            <Field
              id="reset-confirm"
              label="Confirm new password"
              password
              autoComplete="new-password"
              placeholder="Type it again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
              error={mismatch}
            />
          </div>
          <div className="mt-8 flex flex-col gap-4">
            <FormError>{error}</FormError>
            <SubmitButton busy={isSubmitting} disabled={isSubmitting || !newPassword || !confirmPassword}>
              {isSubmitting ? "Saving…" : "Save new password"}
            </SubmitButton>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRequestCode} className="flex flex-col">
          <CardHead title="Reset your password">
            Enter the email address linked to your account and we&apos;ll send you a code to reset your password.
          </CardHead>
          <Field
            id="reset-email"
            label="Email address"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="mt-8 flex flex-col gap-4">
            <FormError>{error}</FormError>
            <SubmitButton busy={isSubmitting} disabled={isSubmitting || !email.trim()}>
              {isSubmitting ? "Sending…" : "Send me a code"}
            </SubmitButton>
          </div>
          {back}
        </form>
      )}
    </AuthShell>
  );
}
