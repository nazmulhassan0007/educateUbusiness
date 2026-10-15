"use client";

import gsap from "gsap";
import { allowHeavyMotion } from "@/lib/motion-budget";

// Matches Navbar.tsx's own `lg:` cutoff for the "CART" label — this is the
// same "desktop" boundary the rest of the navbar already treats as
// authoritative, so the fly animation only ever plays where the cart icon
// it's flying to is actually the full desktop layout.
const DESKTOP_MIN_WIDTH = 1024;
const CART_ICON_ID = "navbar-cart-icon";
const BADGE_SIZE = 44;

// Builds a small circular cart-icon badge (same icon + dark-circle
// treatment as the button's own icon) at `sourceEl`'s position, then arcs
// it over to the navbar's cart icon, shrinking and fading out as it
// arrives — then gives the cart icon a quick bounce. Desktop-only and
// skipped entirely under `allowHeavyMotion() === false` (reduced motion,
// save-data, low-power devices), matching every other GSAP effect in this
// codebase.
export function flyToCart(sourceEl: HTMLElement | null) {
  if (!sourceEl) return;
  if (typeof window === "undefined") return;
  if (window.innerWidth < DESKTOP_MIN_WIDTH) return;
  if (!allowHeavyMotion()) return;

  const cartIcon = document.getElementById(CART_ICON_ID);
  if (!cartIcon) return;

  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = cartIcon.getBoundingClientRect();
  if (sourceRect.width === 0 || sourceRect.height === 0) return;

  const badge = document.createElement("div");
  badge.style.position = "fixed";
  badge.style.left = `${sourceRect.left + sourceRect.width / 2 - BADGE_SIZE / 2}px`;
  badge.style.top = `${sourceRect.top + sourceRect.height / 2 - BADGE_SIZE / 2}px`;
  badge.style.width = `${BADGE_SIZE}px`;
  badge.style.height = `${BADGE_SIZE}px`;
  badge.style.borderRadius = "9999px";
  badge.style.display = "flex";
  badge.style.alignItems = "center";
  badge.style.justifyContent = "center";
  badge.style.backgroundColor = "var(--primary-950, #06180b)";
  badge.style.pointerEvents = "none";
  badge.style.zIndex = "9999";
  badge.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.35)";

  const icon = document.createElement("img");
  icon.src = "/offer/icon-cart-mint.svg";
  icon.alt = "";
  icon.style.width = "20px";
  icon.style.height = "20px";
  badge.appendChild(icon);

  document.body.appendChild(badge);

  const deltaX =
    targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
  const deltaY =
    targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);

  const cleanup = () => badge.remove();

  gsap
    .timeline({ onComplete: cleanup, onInterrupt: cleanup })
    .to(badge, {
      duration: 0.55,
      x: deltaX,
      y: deltaY * 0.35, // arcs upward before dropping into the icon
      scale: 0.85,
      ease: "power2.out",
    })
    .to(badge, {
      duration: 0.3,
      y: deltaY,
      scale: 0.1,
      opacity: 0,
      ease: "power1.in",
    })
    .to(
      cartIcon,
      {
        duration: 0.16,
        scale: 1.25,
        ease: "power1.out",
        yoyo: true,
        repeat: 1,
      },
      "-=0.12",
    );
}
