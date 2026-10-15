import { Fragment } from "react";
import Link from "next/link";
import Bounded from "@/components/layout/bounded/Bounded";
import SplitTextReveal from "@/components/shared/animation/SplitTextReveal";
import { htmlToLines } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Shared dark hero band used at the top of interior pages (Contact us, etc.):
 * a breadcrumb trail, a large title, and an optional supporting line.
 * The final crumb is rendered as the current page (muted, non-link).
 */
export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  className?: string;
  children?: React.ReactNode;
}) {
  const titleLines = htmlToLines(title);

  return (
    <section
      className={`bg-surface-dark py-15 md:pb-10 md:pt-25 2xl:pt-25 ${className}`}
    >
      <Bounded className="flex flex-col items-start gap-3 text-center md:items-center">
        <div className="flex flex-col items-start gap-2 md:items-center ">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb">
              <ol className="font-sans flex flex-wrap items-center justify-start gap-2 type-small font-light md:justify-center">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <li key={crumb.label} className="flex items-center gap-2">
                      {crumb.href && !isLast ? (
                        <Link
                          href={crumb.href}
                          className="flex items-center gap-1.5 text-primary-500 transition-colors hover:text-primary-50"
                        >
                          {index === 0 && <HomeIcon />}
                          {crumb.label}
                        </Link>
                      ) : (
                        <span
                          className="flex items-center gap-1.5 text-on-dark"
                          aria-current={isLast ? "page" : undefined}
                        >
                          {index === 0 && <HomeIcon />}
                          {crumb.label}
                        </span>
                      )}
                      {!isLast && <ChevronIcon />}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}

          <SplitTextReveal
            as="h1"
            className="font-title type-h1 max-w-6xl text-left font-semibold text-on-dark md:text-center"
          >
            {titleLines.map((line, index) => (
              <Fragment key={index}>
                {index > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </SplitTextReveal>
        </div>

        {subtitle && (
          <SplitTextReveal
            as="p"
            delay={0.3}
            className="type-lead max-w-2xl text-left text-accent-50 md:text-center xl:max-w-220"
          >
            {subtitle}
          </SplitTextReveal>
        )}

        {children}
      </Bounded>
    </section>
  );
}

// Inlined from Figma's `home-03` export (node 896:11220) — exact path data,
// rendered as SVG to avoid an <img> request/lint warning for a tiny icon.
function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 22.0001 20.75"
      fill="none"
      className="h-[21px] w-[22px] text-primary-500"
    >
      <path
        d="M8.00006 19.75V12.35C8.00006 11.7899 8.00006 11.5099 8.10906 11.296C8.20493 11.1078 8.35791 10.9549 8.54607 10.859C8.75998 10.75 9.04001 10.75 9.60006 10.75H12.4001C12.9601 10.75 13.2401 10.75 13.4541 10.859C13.6422 10.9549 13.7952 11.1078 13.8911 11.296C14.0001 11.5099 14.0001 11.7899 14.0001 12.35V19.75M1.00006 8.25L10.0401 1.47C10.3843 1.21181 10.5565 1.08271 10.7455 1.03294C10.9124 0.989018 11.0878 0.989018 11.2546 1.03295C11.4437 1.08271 11.6158 1.21181 11.9601 1.47L21.0001 8.25M3.00006 6.75V16.55C3.00006 17.6701 3.00006 18.2302 3.21805 18.658C3.4098 19.0343 3.71576 19.3403 4.09208 19.532C4.51991 19.75 5.07996 19.75 6.20006 19.75H15.8001C16.9202 19.75 17.4802 19.75 17.908 19.532C18.2844 19.3403 18.5903 19.0343 18.7821 18.658C19.0001 18.2302 19.0001 17.6701 19.0001 16.55V6.75L12.9201 2.19C12.2315 1.67361 11.8873 1.41542 11.5092 1.31589C11.1755 1.22804 10.8247 1.22804 10.4909 1.31589C10.1128 1.41542 9.76858 1.67361 9.08006 2.19L3.00006 6.75Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Inlined from Figma's `chevron-right` export (node 896:11222).
function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 9 16"
      fill="none"
      className="h-4 w-[9px] text-primary-500"
    >
      <path
        d="M1 15L8 8L1 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
