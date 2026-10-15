import type { CartItem } from "@/store/cart-store";

export type SeatEntry = { firstName: string; lastName: string; email: string };

// Keyed by course slug. Only Group-tier items (2–5 learners) collect seats
// at checkout — Enterprise/company purchases just reserve an unassigned
// licence pool, assigned by a company admin afterward (outside checkout),
// so they never appear here.
export type AllocationState = Record<string, SeatEntry[]>;

const EMPTY_SEAT: SeatEntry = { firstName: "", lastName: "", email: "" };

export function createEmptyAllocation(quantity: number): SeatEntry[] {
  return Array.from({ length: quantity }, () => ({ ...EMPTY_SEAT }));
}

// Only Group-tier purchases collect named seats at checkout.
export function needsAllocation(items: CartItem[]): boolean {
  return items.some((item) => item.purchaseType === "group");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Two seats on the SAME course can't share an email, since that would be
// two allocated slots resolving to one person.
function hasDuplicateEmails(seats: SeatEntry[]): boolean {
  const emails = seats
    .map((seat) => seat.email.trim().toLowerCase())
    .filter(Boolean);
  return new Set(emails).size !== emails.length;
}

export function isItemAllocationComplete(seats: SeatEntry[]): boolean {
  if (hasDuplicateEmails(seats)) return false;
  return seats.every(
    (seat) =>
      seat.firstName.trim() &&
      seat.lastName.trim() &&
      EMAIL_RE.test(seat.email.trim()),
  );
}

export function isAllocationComplete(
  items: CartItem[],
  allocations: AllocationState,
): boolean {
  return items
    .filter((item) => item.purchaseType === "group")
    .every((item) => {
      const seats = allocations[item.course.slug];
      return seats ? isItemAllocationComplete(seats) : false;
    });
}
