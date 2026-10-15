import { Check } from "@/components/page-components/concepts/shared";
import { PASSWORD_RULES } from "@/lib/auth/password";

/**
 * The backend's password rule, as a hint under a new-password field: each
 * part turns green once it's met, so the rule is never a surprise on submit.
 */
export default function PasswordHint({ value }: { value: string }) {
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      <span>Use</span>
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <span key={rule.label} className={`inline-flex items-center gap-1 ${met ? "text-[#0c7a5e]" : ""}`}>
            {met && <Check size={9} />}
            {rule.label}
            <span className="sr-only">{met ? " (done)" : " (needed)"}</span>
          </span>
        );
      })}
    </span>
  );
}
