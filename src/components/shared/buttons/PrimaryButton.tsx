import Link from "next/link";
import { FlipText } from "@/components/shared/animation/FlipText";
import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  // Solid mint pill, dark text — the default CTA style.
  primary: {
    wrapper: "bg-primary text-primary-950",
    fill: "bg-primary-950",
    hoverText: "md:group-hover:text-white",
  },
  // Outlined pill matching the hero's secondary "Watch Demo" CTA colors.
  outline: {
    wrapper: "border border-accent-500 bg-transparent text-accent-500",
    fill: "bg-primary-500",
    hoverText: "md:group-hover:text-primary-950",
  },
  // Outlined pill matching the "Preview Course" CTA colors.
  outlinePrimary: {
    wrapper: "border border-primary-500 bg-transparent text-primary-500",
    fill: "bg-primary-500",
    hoverText: "md:group-hover:text-primary-950",
  },
} as const;

export default function PrimaryButton({
  label,
  href,
  onClick,
  icon = "/footer/icon-arrow-up-right.svg",
  className = "",
  variant = "primary",
  disabled = false,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: string;
  className?: string;
  variant?: keyof typeof VARIANT_STYLES;
  disabled?: boolean;
}) {
  const styles = VARIANT_STYLES[variant];
  const classes = cn(
    "group relative flex shrink-0 cursor-pointer items-center gap-2 rounded-full py-[10px] pl-[17px] pr-[10px] type-button",
    styles.wrapper,
    disabled && "cursor-not-allowed opacity-60",
    className,
  );
  const content = (
    <>
      <span
        className={`relative z-10 whitespace-nowrap transition-colors duration-500 ${styles.hoverText}`}
      >
        <FlipText>{label}</FlipText>
      </span>
      {/* Sweep-to-fill circle: only correct once the icon is pinned to the
          button's actual right edge, which only happens once there's no
          extra width being distributed elsewhere (auto-width button) —
          true from `md` up, where a real mouse/hover is also expected.
          Below `md`, buttons are commonly full-width with the label+icon
          centered as a group, so this positioning would be wrong, and
          hover doesn't apply on touch anyway. */}
      <div
        className={`absolute right-[10px] top-1/2 hidden h-[37px] w-[37px] -translate-y-1/2 rounded-full md:block ${styles.fill} transition-all ease-in-out group-hover:h-[calc(100%-8px)] group-hover:right-[4px] group-hover:w-[calc(100%-8px)] group-hover:duration-1000`}
        style={{
          transitionProperty: "height, width, right",
          transitionDuration: "350ms",
          transitionDelay: "0ms, 350ms, 350ms",
        }}
      />
      <span className="relative z-10 flex size-[37px] shrink-0 items-center justify-center rounded-full">
        {/* Below `md`: a small circle nested directly behind the icon, so
            it stays aligned wherever the icon actually sits (e.g. centered
            in a full-width mobile pill) instead of a fixed edge offset. */}
        <div
          className={`absolute inset-0 rounded-full md:hidden ${styles.fill} transition-all duration-300 ease-in-out group-hover:-inset-1.5`}
        />
        <img
          alt=""
          className="relative size-5 transition-transform duration-500 md:group-hover:scale-110"
          src={icon}
        />
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={classes}
      >
        {content}
      </button>
    );
  }

  return (
    <button type="submit" disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
