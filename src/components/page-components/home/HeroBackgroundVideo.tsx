"use client";

import { useEffect, useRef } from "react";
import { observeVisibility } from "@/lib/motion-budget";

export default function HeroBackgroundVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    return observeVisibility(video, (visible) => {
      if (visible) {
        video.play().catch(() => {
          // Autoplay might be blocked, nothing to do — poster/first frame stays.
        });
        return;
      }
      video.pause();
    });
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 z-0 size-full object-cover object-center"
    />
  );
}
