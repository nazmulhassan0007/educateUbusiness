// The backend's password rule for both register and reset-password,
// confirmed against the live backend (it isn't in the API reference).
// Checked as the buyer types so the rule is visible up front, rather than
// only surfacing as an error after submit.
export const PASSWORD_RULES = [
  { label: "8+ characters", test: (value: string) => value.length >= 8 },
  { label: "an uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "a lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "a number", test: (value: string) => /\d/.test(value) },
  { label: "a special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export function missingPasswordRules(value: string): string[] {
  return PASSWORD_RULES.filter((rule) => !rule.test(value)).map((rule) => rule.label);
}
