"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PasswordInput({
  className,
  iconClassName = "text-on-dark",
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  iconClassName?: string;
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className="relative w-full">
      <input
        {...props}
        id={id}
        type={visible ? "text" : "password"}
        className={cn(className, "pr-14")}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={id}
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2",
          iconClassName,
        )}
      >
        {visible ? (
          <Eye className="size-5" />
        ) : (
          <EyeOff className="size-5" />
        )}
      </button>
    </div>
  );
}
