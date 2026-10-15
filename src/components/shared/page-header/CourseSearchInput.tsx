"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IoIosSearch } from "react-icons/io";

export default function CourseSearchInput({
  placeholder,
}: {
  placeholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      const nextUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(timeout);
    // Only re-run when the debounced value itself changes — including
    // `searchParams`/`router`/`pathname` would re-fire this on every URL
    // update this same effect just made.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <label className="flex w-full max-w-xl items-center gap-3 rounded-full border border-[rgba(27,245,118,0.17)] bg-[rgba(137,137,137,0.05)] px-5 py-4 backdrop-blur-[75px] lg:max-w-2xl">
      <IoIosSearch className="size-6 shrink-0 text-[#d2fbf0]" />
      <input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-cancel-mint w-full bg-transparent text-lg text-[#d2fbf0] placeholder:text-primary-700 focus:outline-none lg:text-xl"
      />
    </label>
  );
}
