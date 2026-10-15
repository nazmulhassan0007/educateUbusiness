"use client";

import PrimaryButton from "@/components/shared/buttons/PrimaryButton";
import type { Course } from "@/components/shared/course-card/CourseCard";
import { useCartStore } from "@/store/cart-store";

export default function OfferAddToCartButton({
  course,
  className,
}: {
  course: Course;
  className?: string;
}) {
  const addItem = useCartStore((state) => state.addItem);

  const handleClick = () => addItem(course);

  return (
    <PrimaryButton
      label="Add to Cart"
      onClick={handleClick}
      icon="/offer/icon-cart-mint.svg"
      className={className}
    />
  );
}
