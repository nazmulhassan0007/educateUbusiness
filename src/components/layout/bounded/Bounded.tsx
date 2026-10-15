import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BoundedProps {
  children: ReactNode;
  className?: string;
}

const Bounded = ({ children, className }: BoundedProps) => {
  return (
    <div
      className={cn(
        "site-container",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Bounded;
