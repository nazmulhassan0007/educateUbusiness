import Bounded from "@/components/layout/bounded/Bounded";
import {
  LogoCocaCola,
  LogoOpenAI,
  LogoPallet,
  LogoCausal,
  LogoPlain,
  LogoPassionfroot,
  LogoDopt,
} from "./trusted-logos";

// each logo keeps its own real aspect ratio (via viewBox) - only width is set
// (responsively), height is derived automatically by the browser. Sized so
// exactly one full set of 7 fills the bounded width (1600px) at 1920 screens,
// matching the Figma spacing (100px logos, 120px gaps) at that breakpoint.
const LOGOS = [
  { Component: LogoCocaCola, alt: "Coca-Cola" },
  { Component: LogoOpenAI, alt: "OpenAI" },
  { Component: LogoPallet, alt: "Pallet" },
  { Component: LogoCausal, alt: "Causal" },
  { Component: LogoPlain, alt: "Plain" },
  { Component: LogoPassionfroot, alt: "passionfroot" },
  { Component: LogoDopt, alt: "DOPT" },
];

export type TrustedByBrand = {
  logo: {
    url: string;
    alt: string;
  };
};

export type TrustedByContent = {
  title: string;
  sub_title: string;
  brands: TrustedByBrand[];
};

const DEFAULT_TITLE = "Trusted by Industry Leaders";
const DEFAULT_SUB_TITLE =
  "Our BCS-accredited professional certificates and CPD courses are already trusted by teams at organisations like these.";

const LOGO_CLASSNAME = "h-auto w-25 shrink-0 sm:w-14 lg:w-20 4xl:w-25";
// `pr-*` mirrors the `gap-*` values exactly — it stands in for the "gap"
// that would otherwise sit between this track and the next one, so each
// track is a self-contained, evenly-spaced repeating unit. That's what
// lets the -50% marquee shift below land exactly back on the starting
// layout instead of jumping by half a gap every loop.
const TRACK_CLASSNAME =
  "flex flex-nowrap shrink-0 items-center gap-10 pr-6 sm:gap-12 sm:pr-12 lg:gap-16 lg:pr-16 4xl:gap-30 4xl:pr-30";

// Used when the CMS section is missing/has no brands yet — the same
// hand-authored logos this section always used.
function LogoTrack({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className={TRACK_CLASSNAME} aria-hidden={ariaHidden}>
      {LOGOS.map((logo) => (
        <logo.Component
          key={logo.alt}
          role={ariaHidden ? undefined : "img"}
          aria-label={ariaHidden ? undefined : logo.alt}
          className={LOGO_CLASSNAME}
        />
      ))}
    </div>
  );
}

// Used once the CMS provides real brand logos (remote SVG URLs).
function BrandLogoTrack({
  brands,
  ariaHidden = false,
}: {
  brands: TrustedByBrand[];
  ariaHidden?: boolean;
}) {
  return (
    <div className={TRACK_CLASSNAME} aria-hidden={ariaHidden}>
      {brands.map((brand, index) => (
        // eslint-disable-next-line @next/next/no-img-element -- remote CMS asset, not a local/optimizable file
        <img
          key={`${brand.logo.url}-${index}`}
          src={brand.logo.url}
          alt={ariaHidden ? "" : brand.logo.alt}
          className={LOGO_CLASSNAME}
        />
      ))}
    </div>
  );
}

export default function TrustedBy({
  data,
}: {
  data?: Partial<TrustedByContent>;
}) {
  const title = data?.title || DEFAULT_TITLE;
  const subTitle = data?.sub_title || DEFAULT_SUB_TITLE;
  const brands = data?.brands;
  const hasBrands = Boolean(brands && brands.length > 0);

  return (
    <section className="bg-surface-dark py-12.5 lg:py-[60px]">
      <Bounded className="flex flex-col items-center gap-8 lg:gap-[43px]">
        <div className="flex flex-col items-center gap-4 text-center text-surface-light">
          <h2 className="type-h2 font-title font-medium">
            {title}
          </h2>
          {/* <p className="type-lead max-w-3xl">
            {subTitle}
          </p> */}
        </div>

        <div className="w-full overflow-hidden">
          {/* 4 copies (not 2): logo/gap sizing only has breakpoints at
              base/sm/lg/4xl, so between lg and 4xl a single set can be
              noticeably narrower than the (still-growing) container width.
              With only 2 copies that leaves a bare gap once the loop wraps
              past that set — 4 keeps total content comfortably wider than
              2x the container at every breakpoint. Keep in sync with the
              -25% in the `marquee` keyframes (globals.css). */}
          <div className="flex w-max flex-nowrap items-center animate-marquee py-[24px]">
            {hasBrands ? (
              <>
                <BrandLogoTrack brands={brands!} />
                <BrandLogoTrack brands={brands!} ariaHidden />
                <BrandLogoTrack brands={brands!} ariaHidden />
                <BrandLogoTrack brands={brands!} ariaHidden />
              </>
            ) : (
              <>
                <LogoTrack />
                <LogoTrack ariaHidden />
                <LogoTrack ariaHidden />
                <LogoTrack ariaHidden />
              </>
            )}
          </div>
        </div>
      </Bounded>
    </section>
  );
}
