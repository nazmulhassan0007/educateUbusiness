import { parseDate } from "@/lib/utils";

type OfferFields = {
  offerPrice: string | null;
  offerStartsAt: string | null;
  offerEndsAt: string | null;
};

// A live flash offer overrides every other price for every purchase type:
// `offerPrice` set, `offerEndsAt` still in the future, and — if
// `offerStartsAt` is set — already started. Shared by the course page's
// display price and the server-side checkout amount so the two agree.
export function isOfferActive(course: OfferFields, now = Date.now()): boolean {
  if (!course.offerPrice || !course.offerEndsAt) return false;
  if (parseDate(course.offerEndsAt).getTime() <= now) return false;
  if (course.offerStartsAt && parseDate(course.offerStartsAt).getTime() > now) {
    return false;
  }
  return true;
}
