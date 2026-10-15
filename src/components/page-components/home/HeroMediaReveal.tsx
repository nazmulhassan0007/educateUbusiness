"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

gsap.registerPlugin(ScrollTrigger);

export default function HeroMediaReveal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const imageBoxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=1500",
          scrub: 1,
          pin: pinRef.current,
        },
      });

      tl.fromTo(
        imageBoxRef.current,
        { width: "70%", borderRadius: 20 },
        { width: "92%", borderRadius: 20, duration: 1, ease: "none" }
      ).to(imageBoxRef.current, {
        width: "100%",
        height: "100vh",
        borderRadius: 0,
        duration: 1,
        ease: "none",
      });

      tl.to(
        cardRef.current,
        { opacity: 0, y: 40, duration: 0.6, ease: "none" },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative bg-surface-dark">
      <div
        ref={pinRef}
        className="flex h-screen flex-col items-center justify-center gap-8 overflow-hidden"
      >
        <div
          ref={imageBoxRef}
          className="relative aspect-[991/449] w-[70%] max-w-[991px] overflow-hidden"
        >
          <div
            className="pointer-events-none absolute -left-16 -top-16 hidden h-64 w-96 rounded-full bg-primary-700 blur-3xl mix-blend-overlay lg:block"
            aria-hidden
          />
          <Image
            alt="Student learning online with educateU"
            src="/hero/video-poster.png"
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>

        <div
          ref={cardRef}
          className="relative w-full max-w-[585px] overflow-hidden rounded-[30px]"
        >
          <BackgroundGradientAnimation
            gradientBackgroundStart="rgb(6, 24, 11)"
            gradientBackgroundEnd="rgb(8, 33, 15)"
            blendingValue="screen"
            firstColor="245, 166, 35"
            secondColor="30, 233, 181"
            thirdColor="245, 166, 35"
            fourthColor="30, 233, 181"
            fifthColor="245, 166, 35"
            size="180px"
            spread={70}
            interactive={false}
            containerClassName="absolute inset-0 h-full w-full"
          />

          <div className="relative z-10 flex h-full flex-col justify-between gap-24 rounded-[30px] border border-white/9 bg-[rgba(137,137,137,0.05)] p-8 backdrop-blur-[75px] lg:min-h-[449px]">
            <img alt="" className="h-6 w-8" src="/hero/icon-quote.svg" />
            <div className="flex flex-col gap-6 text-primary-50">
              <p className="type-body">
                Cyber threats are increasing daily, and this course gave me
                the foundational knowledge I needed to protect sensitive data.
                It was well-structured and easy to follow, even for a
                beginner like me.
              </p>
              <div className="flex flex-col gap-1">
                <p className="type-h4">Sophia L.</p>
                <p className="type-small opacity-70">CEO od Sophia Group LLC</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
