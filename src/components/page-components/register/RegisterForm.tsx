"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import AuthShell from "@/components/page-components/auth/AuthShell";
import {
  CardHead,
  Checkbox,
  Field,
  FormError,
  LINK,
  PillLink,
  SubmitButton,
  SwitchLine,
} from "@/components/page-components/auth/fields";
import { Check } from "@/components/page-components/concepts/shared";
import { authErrorMessage, callAuthRoute } from "@/lib/auth/client";
import { missingPasswordRules } from "@/lib/auth/password";
import { safeRedirect } from "@/lib/auth/redirect";
import PasswordHint from "@/components/page-components/auth/PasswordHint";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type EmailStatus = "idle" | "checking" | "available" | "taken" | "error";

type AccountType = "individual" | "company";

const STEPS = [
  { title: "Create your account" },
  { title: "Log in and confirm your email", body: "We email you a short code the first time." },
  { title: "Choose your course", body: "Start straight away, on any device." },
];

const TYPES: { key: AccountType; label: string }[] = [
  { key: "individual", label: "Just me" },
  { key: "company", label: "My company" },
];

export default function RegisterForm() {
  // Read directly from `window.location` (rather than `useSearchParams`) so
  // this form doesn't need a `useSearchParams`-forced Suspense boundary
  // around it — see the matching comment in LoginForm for why that made the
  // form appear noticeably late on a hard refresh.
  const [redirect, setRedirect] = useState<string | null>(null);
  useEffect(() => {
    // One-time sync from an external system (the URL) on mount — see the
    // matching comment in LoginForm.
    // Only a same-site path survives — see src/lib/auth/redirect.ts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRedirect(
      safeRedirect(new URLSearchParams(window.location.search).get("redirect"), null),
    );
  }, []);
  const loginHref = redirect
    ? `/login?redirect=${encodeURIComponent(redirect)}`
    : "/login";
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [form, setForm] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  // Advisory pre-flight only (see src/app/api/auth/check-email/route.ts) —
  // register still enforces uniqueness itself with a 409. `lastCheck` holds
  // the most recent answer, so an email that hasn't changed isn't re-checked
  // and one edited then changed back gets its answer back. `currentEmail` is
  // what's in the field right now: an async check compares against it,
  // since `form` inside checkEmail is the render it started from.
  const lastCheck = useRef<{ email: string; status: EmailStatus } | null>(null);
  const currentEmail = useRef("");

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
      if (key === "email") {
        const email = String(value).trim();
        currentEmail.current = email;
        setEmailStatus(
          lastCheck.current?.email === email ? lastCheck.current.status : "idle",
        );
      }
    };

  const passwordMissing = missingPasswordRules(form.password);

  const hasRequiredFields =
    Boolean(form.firstName.trim()) &&
    Boolean(form.lastName.trim()) &&
    Boolean(form.email.trim()) &&
    Boolean(form.password) &&
    Boolean(form.confirmPassword) &&
    (accountType !== "company" || Boolean(form.companyName.trim()));

  // Shown as soon as both are filled, not only on submit.
  const mismatch =
    Boolean(form.confirmPassword) && form.password !== form.confirmPassword
      ? "These passwords don’t match."
      : null;

  async function checkEmail() {
    const email = form.email.trim();
    if (!EMAIL_REGEX.test(email) || email === lastCheck.current?.email) return;

    setEmailStatus("checking");
    const result = await callAuthRoute(
      `/api/auth/check-email?email=${encodeURIComponent(email)}`,
    );
    // A failed check isn't remembered, so the next blur tries again.
    const status: EmailStatus = !result.ok
      ? "error"
      : result.data.exists
        ? "taken"
        : "available";
    if (status !== "error") lastCheck.current = { email, status };

    // The field may have changed while this was in flight — only apply the
    // answer if it's still for the email currently typed.
    if (email === currentEmail.current) setEmailStatus(status);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (emailStatus === "taken") {
      setError("An account with this email already exists.");
      return;
    }

    if (passwordMissing.length > 0) {
      setError(`Your password still needs ${passwordMissing.join(", ")}.`);
      return;
    }

    setIsSubmitting(true);

    const endpoint =
      accountType === "company"
        ? "/api/auth/register-company"
        : "/api/auth/register";
    const email = form.email.trim();
    const body =
      accountType === "company"
        ? {
            companyName: form.companyName.trim(),
            email,
            firstName: form.firstName,
            lastName: form.lastName,
            password: form.password,
          }
        : {
            email,
            firstName: form.firstName,
            lastName: form.lastName,
            password: form.password,
          };

    const result = await callAuthRoute(endpoint, body);

    if (!result.ok) {
      setError(authErrorMessage(result, "Something went wrong. Please try again."));
      setIsSubmitting(false);
      return;
    }

    setRegistered(true);
    setIsSubmitting(false);
  }

  const emailHint =
    emailStatus === "checking" ? (
      "Checking this email…"
    ) : emailStatus === "available" ? (
      <span className="inline-flex items-center gap-1.5 text-[#0c7a5e]">
        <Check size={11} /> This email is free to use.
      </span>
    ) : emailStatus === "error" ? (
      "We couldn’t check this email just now. You can still carry on."
    ) : undefined;

  return (
    <AuthShell
      crumb="Register"
      title={["Start learning", "in minutes."]}
      subtitle="Create an account for yourself, or one for your company and its team."
      steps={STEPS}
      current={registered ? 1 : 0}
      stage={registered ? "done" : "form"}
    >
      {registered ? (
        <div className="flex flex-col gap-8">
          <span className="grid size-12 place-items-center rounded-full bg-[#1ee9b5] text-[#06180b]">
            <Check size={16} />
          </span>
          <CardHead title={`Your account is ready${form.firstName.trim() ? `, ${form.firstName.trim()}` : ""}.`}>
            Log in to continue. The first time, we&apos;ll email a short code to{" "}
            <strong className="font-medium text-[#06180b]">{form.email.trim()}</strong> to check it&apos;s you.
          </CardHead>
          <PillLink href={loginHref}>Log in</PillLink>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <CardHead title="Create your account" />

          {/* Who the account is for; the mint fill glides to the pick. */}
          <div role="radiogroup" aria-label="Account for" className="grid grid-cols-2 rounded-full border border-[#06180b]/10 bg-[#f7f6f1] p-1">
            {TYPES.map((t) => {
              const on = accountType === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setAccountType(t.key)}
                  className={`relative h-11 cursor-pointer rounded-full type-small font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#0c7a5e] ${on ? "text-white" : "text-[#06180b]/70 hover:text-[#06180b]"}`}
                >
                  {on && (
                    <motion.span
                      layoutId="account-type"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-[#06180b]"
                      transition={{ type: "spring", stiffness: 420, damping: 38 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-5">
            <AnimatePresence initial={false}>
              {accountType === "company" && (
                <motion.div
                  key="company"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="-mb-5 overflow-hidden"
                >
                  <div className="pb-5">
                    <Field
                      id="register-company"
                      label="Company name"
                      autoComplete="organization"
                      placeholder="Your company’s name"
                      value={form.companyName}
                      onChange={update("companyName")}
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="register-first"
                label="First name"
                autoComplete="given-name"
                value={form.firstName}
                onChange={update("firstName")}
                required
              />
              <Field
                id="register-last"
                label="Last name"
                autoComplete="family-name"
                value={form.lastName}
                onChange={update("lastName")}
                required
              />
            </div>

            <Field
              id="register-email"
              label={accountType === "company" ? "Work email" : "Email address"}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={update("email")}
              onBlur={checkEmail}
              required
              error={
                emailStatus === "taken" ? (
                  <>
                    There&apos;s already an account with this email.{" "}
                    <Link href={loginHref} className="font-medium underline underline-offset-4">
                      Log in instead
                    </Link>
                  </>
                ) : undefined
              }
              hint={emailHint}
            />

            <Field
              id="register-password"
              label="Password"
              password
              autoComplete="new-password"
              placeholder="Choose a password"
              value={form.password}
              onChange={update("password")}
              required
              hint={<PasswordHint value={form.password} />}
            />
            <Field
              id="register-confirm"
              label="Confirm password"
              password
              autoComplete="new-password"
              placeholder="Type it again"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              required
              error={mismatch}
            />
          </div>

          <div className="mt-6">
            <Checkbox checked={form.agree} onChange={update("agree")} required>
              I agree to the{" "}
              <Link href="/refund-policy" className={LINK}>
                Refund Policy
              </Link>{" "}
              and{" "}
              <Link href="/cookies-policy" className={LINK}>
                Cookies Policy
              </Link>
              .
            </Checkbox>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <FormError>{error}</FormError>
            <SubmitButton busy={isSubmitting} disabled={isSubmitting || !form.agree || !hasRequiredFields}>
              {isSubmitting ? "Creating your account…" : "Create account"}
            </SubmitButton>
          </div>

          <SwitchLine>
            Already have an account?{" "}
            <Link href={loginHref} className={LINK}>
              Log in
            </Link>
          </SwitchLine>
        </form>
      )}
    </AuthShell>
  );
}
