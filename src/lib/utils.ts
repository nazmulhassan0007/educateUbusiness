import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number) {
  return `£${amount}`
}

// Turns a backend code ("company_admin", "pendingApproval") into words
// for people: "Company admin", "Pending approval".
export function humanize(value: string) {
  const words = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return ""
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Like stripHtml, but keeps the CMS rich-text editor's line breaks — each
// block element (<p>, <div>, <li>, heading) or <br> becomes one line —
// instead of flattening everything onto a single line.
export function htmlToLines(html: string | null | undefined): string[] {
  if (!html) return []
  return html
    .replace(/<(p|div|li|h[1-6])[^>]*>/gi, "")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
}

// `new Date("2026-10-14 18:00:00")` works in Chrome but is Invalid Date in
// Safari, which only accepts the ISO "T" separator. Normalise before parsing.
export function parseDate(value: string): Date {
  return new Date(value.replace(/^(\d{4}-\d{2}-\d{2}) (\d)/, "$1T$2"))
}
