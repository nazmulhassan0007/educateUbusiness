export type MotionBudget = "full" | "lite" | "off";

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Caps how much continuous motion this client should run.
 * - `off`: user asked for reduced motion — no decorative loops or scroll-jacking
 * - `lite`: low-power / save-data — native scroll, no cursor trail / extra shaders
 * - `full`: keep the designed motion, but still pause work that is off-screen
 */
export function getMotionBudget(): MotionBudget {
  if (typeof window === "undefined") return "full";
  if (prefersReducedMotion()) return "off";

  const nav = navigator as NavigatorWithHints;
  if (nav.connection?.saveData) return "lite";
  const effectiveType = nav.connection?.effectiveType;
  if (effectiveType === "2g" || effectiveType === "slow-2g") return "lite";
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) return "lite";
  // WebKit (Safari, and every iOS browser) clamps `hardwareConcurrency` to a
  // fixed 4 or 8 against fingerprinting, so "4" there says nothing about the
  // device — trusting it dropped capable Macs/iPhones to `lite`.
  if (
    !isAppleWebKit() &&
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency > 0 &&
    navigator.hardwareConcurrency <= 4
  ) {
    return "lite";
  }
  return "full";
}

/** Safari or any iOS browser (all WebKit) — not Chrome/Edge/Opera on desktop. */
function isAppleWebKit(): boolean {
  const ua = navigator.userAgent;
  return /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg\/|OPR\//.test(ua);
}

export function allowHeavyMotion(): boolean {
  return getMotionBudget() === "full";
}

export function watchMotionBudget(
  onChange: (budget: MotionBudget) => void,
): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handler = () => onChange(getMotionBudget());
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}

/** True while the element intersects the viewport and the tab is visible. */
export function observeVisibility(
  el: Element,
  onChange: (visible: boolean) => void,
  rootMargin = "200px",
): () => void {
  let intersecting = false;
  const emit = () => onChange(intersecting && document.visibilityState === "visible");
  const io = new IntersectionObserver(
    ([entry]) => {
      intersecting = entry.isIntersecting;
      emit();
    },
    { rootMargin },
  );
  io.observe(el);
  document.addEventListener("visibilitychange", emit);
  return () => {
    io.disconnect();
    document.removeEventListener("visibilitychange", emit);
  };
}
