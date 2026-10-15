"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/page-components/auth/AuthShell";
import {
  CardHead,
  Checkbox,
  CodeField,
  Field,
  FormError,
  FormNote,
  LINK,
  SubmitButton,
  SwitchLine,
} from "@/components/page-components/auth/fields";
import {
  useAuthStore,
  toProfileMenuUser,
  type MeResponseUser,
} from "@/store/auth-store";
import { authErrorMessage, callAuthRoute } from "@/lib/auth/client";
import { safeRedirect } from "@/lib/auth/redirect";

const STEPS = [
  { title: "Enter your email and password" },
  { title: "Confirm the code we email you", body: "Only the first time you log in." },
  { title: "Carry on learning", body: "Straight back to where you were going." },
];

export default function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  // Read directly from `window.location` (rather than `useSearchParams`) so
  // this form doesn't need a `useSearchParams`-forced Suspense boundary
  // around it — that boundary has no fallback, and since this page is
  // statically prerendered, Next.js bails its *entire* contents to
  // client-side-only rendering, which is what made the form appear
  // noticeably late on a hard refresh. Starting at `null` and filling in
  // after mount keeps the initial render identical between server and
  // client (no hydration mismatch) while letting the rest of the form ship
  // in the static HTML.
  const [redirect, setRedirect] = useState<string | null>(null);
  useEffect(() => {
    // One-time sync from an external system (the URL) on mount — not a
    // derived-state update, so the "adjust state during render" pattern
    // doesn't apply here the way it does elsewhere in this codebase.
    // Only a same-site path survives — see src/lib/auth/redirect.ts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRedirect(
      safeRedirect(new URLSearchParams(window.location.search).get("redirect"), null),
    );
  }, []);
  const registerHref = redirect
    ? `/register?redirect=${encodeURIComponent(redirect)}`
    : "/register";
  const forgotHref = redirect
    ? `/forgot-password?redirect=${encodeURIComponent(redirect)}`
    : "/forgot-password";
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [otp, setOtp] = useState("");
  // "credentials" is email+password; a first-ever login on the backend
  // always requires a follow-up emailed code before it hands back a token.
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({
        ...prev,
        [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
      }));

  const hasCredentials = Boolean(form.email.trim()) && Boolean(form.password);

  // The session cookie is already set by the time this runs. If the
  // follow-up user fetch fails, a full page load lets the navbar pick the
  // user up itself rather than showing them as logged out.
  async function finishLogin() {
    const target = redirect ?? "/";
    const me = await callAuthRoute("/api/auth/me");
    if (!me.ok) {
      window.location.assign(target);
      return;
    }
    setUser(toProfileMenuUser((me.data as { user: MeResponseUser }).user));
    router.push(target);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await callAuthRoute("/api/auth/login", {
      email: form.email.trim(),
      password: form.password,
      remember: form.remember,
    });

    if (!result.ok) {
      setError(authErrorMessage(result, "Something went wrong. Please try again."));
      setIsSubmitting(false);
      return;
    }

    if (result.data.otpRequired) {
      setStep("otp");
      setIsSubmitting(false);
      return;
    }

    await finishLogin();
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await callAuthRoute("/api/auth/verify-otp", {
      email: form.email.trim(),
      password: form.password,
      otp,
      remember: form.remember,
    });

    if (!result.ok) {
      setError(authErrorMessage(result, "Invalid or expired code. Please try again."));
      setIsSubmitting(false);
      return;
    }

    await finishLogin();
  }

  // The doc only documents an error for resending *after* the account is
  // already verified — but calling POST /auth/login again while an OTP is
  // still pending is, empirically, how a resend actually works (confirmed
  // against the live backend: it either re-sends or answers with a
  // short-cooldown 400, "Please wait a moment before requesting another
  // code."). There's no separate resend endpoint.
  async function handleResend() {
    setError(null);
    setResendMessage(null);
    setIsResending(true);

    const result = await callAuthRoute("/api/auth/login", {
      email: form.email.trim(),
      password: form.password,
      remember: form.remember,
    });
    setIsResending(false);

    if (!result.ok) {
      setError(authErrorMessage(result, "Couldn't resend the code. Please try again."));
      return;
    }
    if (result.data.otpRequired) {
      setResendMessage("A new code has been sent.");
    }
  }

  return (
    <AuthShell
      crumb="Log in"
      title={["Welcome back.", "Pick up where you left off."]}
      subtitle="Log in to carry on with your courses on educateU Business."
      steps={STEPS}
      current={step === "otp" ? 1 : 0}
      stage={step}
    >
      {step === "otp" ? (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
          <CardHead title="Check your email">
            We&apos;ve sent a login code to{" "}
            <strong className="font-medium text-[#06180b]">{form.email.trim()}</strong>. Enter it
            below to finish logging in. This is only needed the first time you log in.
          </CardHead>
          <CodeField id="login-otp" label="Login code" value={otp} onChange={setOtp} />
          <FormNote>{resendMessage}</FormNote>
          <FormError>{error}</FormError>
          <SubmitButton busy={isSubmitting} disabled={isSubmitting || !otp.trim()}>
            {isSubmitting ? "Verifying…" : "Verify and log in"}
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
                setStep("credentials");
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
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <CardHead title="Log in" />
          <div className="flex flex-col gap-5">
            <Field
              id="login-email"
              label="Email address"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={update("email")}
              required
            />
            <Field
              id="login-password"
              label="Password"
              password
              autoComplete="current-password"
              placeholder="Your password"
              value={form.password}
              onChange={update("password")}
              required
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <Checkbox checked={form.remember} onChange={update("remember")}>
              Remember me
            </Checkbox>
            <Link href={forgotHref} className={`${LINK} type-small`}>
              Forgotten your password?
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <FormError>{error}</FormError>
            <SubmitButton busy={isSubmitting} disabled={isSubmitting || !hasCredentials}>
              {isSubmitting ? "Logging in…" : "Log in"}
            </SubmitButton>
          </div>

          <SwitchLine>
            New to educateU?{" "}
            <Link href={registerHref} className={LINK}>
              Create an account
            </Link>
          </SwitchLine>
        </form>
      )}
    </AuthShell>
  );
}
