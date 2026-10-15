import Bounded from "@/components/layout/bounded/Bounded";
import PrimaryButton from "@/components/shared/buttons/PrimaryButton";

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center bg-surface-dark py-24">
      <Bounded className="flex flex-col items-center gap-6 text-center">
        <p className="font-title text-[100px] font-semibold leading-none text-primary-500 sm:text-[140px]">
          404
        </p>
        <div className="flex flex-col items-center gap-3 text-on-dark">
          <h1 className="font-title type-h1 font-semibold">
            Page not found
          </h1>
          <p className="max-w-md type-lead">
            The page you&apos;re looking for doesn&apos;t exist or may have
            been moved.
          </p>
        </div>
        <PrimaryButton label="Back to Home" href="/" />
      </Bounded>
    </section>
  );
}
