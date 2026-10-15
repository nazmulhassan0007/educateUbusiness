import { cache } from "react";
import { fetchAPI } from "@/lib/cms/fetch-api";

// ---------------------------------------------------------------------------
// Course/bundle data is deliberately NOT stored in Next's Data Cache.
//
// These loaders used `unstable_cache(..., { revalidate: 300 })`. That cache
// lives on Vercel and, per Next's own docs, persists "across requests and
// deployments" — so a course edited in the backend kept showing the old
// version even after a redeploy. Worse, the window expiring doesn't make it
// fresh: the first visit afterwards is still served the stale copy while the
// refresh happens behind it, so on a low-traffic site an update took two
// visits, minutes apart, to appear. Locally it always looked instant because
// the dev server's cache is dropped on every restart, which is exactly why
// the two environments disagreed.
//
// React's `cache()` replaces it: it dedupes repeated calls **within a single
// render** (e.g. generateMetadata and the page itself both asking for the
// same course, or /api/checkout pricing several cart lines), and nothing is
// shared between requests. Every visitor gets what the backend has right
// now, with no cache to invalidate and nothing to configure in Vercel.
//
// The cost is one backend call per page render. If that ever becomes a load
// problem, wrap these in `unstable_cache` again with a short window
// (30-60s) — but expect the stale-first-visit behaviour to come back with
// it. CMS content (src/lib/cms/loaders.ts) is still cached for 5 minutes;
// it changes far less often than the catalogue.
// ---------------------------------------------------------------------------
import { getCoursesApiURL } from "./get-url";

const BASE_URL = getCoursesApiURL();

export type ApiImage = {
  url: string;
  width: number;
  height: number;
};

export type ApiCourse = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  thumbnailImage: ApiImage | null;
  hasCertificate: boolean;
  certificateType: string | null;
  certificateExpireDays: number | null;
  isCompliance: boolean;
  deliveryMode: string | null;
  durationLabel: string | null;
  rating: string | null;
  reviewCount: number;
  price: string;
  discountedPrice: string | null;
  cpdHours: string | null;
  groupPlanPrice: string | null;
  enterprisePlanPrice: string | null;
  offerPrice: string | null;
  offerStartsAt: string | null;
  offerEndsAt: string | null;
  // Free-form keywords from the backend. `null` for every course in the
  // catalogue today and the non-null shape isn't pinned down, so readers go
  // through `toKeywordList` (src/lib/courses/search.ts) rather than assuming
  // one — the field is in the payload and is exactly what course search is
  // meant to look at once it's filled in.
  tags: string[] | string | null;
  category: { id: string; name: string; slug: string };
};

export type ApiCourseCategory = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
};

async function fetchCourseCategories() {
  const path = "/api/course-categories";
  const url = new URL(path, BASE_URL);

  return await fetchAPI(url.href, { method: "GET" });
}

export const getCourseCategories = cache(fetchCourseCategories);

export type ApiCourseHighlight = {
  id: string;
  text: string;
  displayOrder: number;
};

export type ApiCourseLesson = {
  id: string;
  title: string;
  contentType: string;
  contentUrl: string | null;
  displayOrder: number;
};

export type ApiCourseModule = {
  id: string;
  title: string;
  description: string | null;
  displayOrder: number;
  lessons: ApiCourseLesson[];
};

export type ApiCourseFaq = {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
};

export type ApiCourseAtAGlanceItem = {
  id: string;
  label: string;
  value: string;
  displayOrder: number;
};

export type ApiRelatedCourse = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  thumbnailImage: ApiImage | null;
  hasCertificate: boolean;
  certificateType: string | null;
  certificateExpireDays: number | null;
  isCompliance: boolean;
  deliveryMode: string | null;
  durationLabel: string | null;
  rating: string | null;
  reviewCount: number;
  price: string;
  discountedPrice: string | null;
  cpdHours: string | null;
  offerPrice: string | null;
  offerStartsAt: string | null;
  offerEndsAt: string | null;
  category: { id: string; name: string; slug: string };
};

// Only the fields the course page reads; the payload also carries the
// questions, which the page has no use for.
export type ApiCourseAssessment = {
  id: string;
  type: string;
  title: string;
  passThreshold: number | null;
};

export type ApiCourseDetail = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  overviewText: string | null;
  thumbnailImage: ApiImage | null;
  heroImage: ApiImage | null;
  hasCertificate: boolean;
  rating: string | null;
  reviewCount: number;
  price: string;
  discountedPrice: string | null;
  personalPlanPrice: string | null;
  groupPlanPrice: string | null;
  enterprisePlanPrice: string | null;
  // The course API has no Stripe fields of its own (it runs its own
  // checkout/order/licence system, see src/lib/checkout/backend-order.ts) —
  // these stay null. Payment itself is still collected via Stripe, so
  // these Price IDs remain the source of truth for what a course actually
  // charges; only order/enrollment recording moved to the backend.
  stripePriceIdPersonal: string | null;
  stripePriceIdGroup: string | null;
  stripePriceIdEnterprise: string | null;
  stripeProductId: string | null;
  offerPrice: string | null;
  offerStartsAt: string | null;
  offerEndsAt: string | null;
  supportsBulkPurchase: boolean;
  whoIsFor: string | null;
  // One "Audience: what they get" line per type of learner — distinct from
  // the single `whoIsFor` sentence, which At a Glance shows.
  whoThisCourseIsFor: string[];
  whatsIncluded: string[];
  whatYoullLearn: string[];
  flexibleLearningText: string | null;
  courseCertificateText: string | null;
  dedicatedSupportText: string | null;
  studyMethodsText: string | null;
  durationLabel: string | null;
  deliveryMode: string | null;
  credits: string | null;
  certificateType: string | null;
  cpdHours: number | null;
  certificateExpireDays: number | null;
  isCompliance: boolean;
  isContinued: boolean;
  courseExpiresAt: string | null;
  certificateExpiryEnabled: boolean;
  renewalRequired: boolean;
  gracePeriodDays: number | null;
  skillLevel: string | null;
  assessmentText: string | null;
  // Not returned by the API yet — stays empty until it has a field for this.
  atAGlance: ApiCourseAtAGlanceItem[];
  certificateTemplate: string | null;
  status: string;
  category: ApiCourseCategory;
  highlights: ApiCourseHighlight[];
  modules: ApiCourseModule[];
  faqs: ApiCourseFaq[];
  assessments: ApiCourseAssessment[];
  relatedCourses: ApiRelatedCourse[];
  updatedAt: string | null;
};

// ---------------------------------------------------------------------------
// REST-backed course source — GET /api/courses, GET /api/courses/{slug} on
// the backend documented at BASE_URL. Field names already line up with
// ApiCourse/ApiRelatedCourse 1:1; ApiCourseDetail carries a handful of
// internal-only fields (Stripe price/product ids, and some CMS-era content
// fields with no API equivalent yet) that the API doesn't return — those are
// filled in with explicit defaults below rather than left undefined.
// ---------------------------------------------------------------------------

type RestCourseDetail = Omit<
  ApiCourseDetail,
  | "stripePriceIdPersonal"
  | "stripePriceIdGroup"
  | "stripePriceIdEnterprise"
  | "stripeProductId"
  | "atAGlance"
  | "whatsIncluded"
  | "whatYoullLearn"
  | "whoThisCourseIsFor"
> & {
  // The API returns `null` rather than `[]` for a course with none set.
  whatsIncluded: string[] | null;
  whatYoullLearn: string[] | null;
  whoThisCourseIsFor: string[] | null;
};

function toApiCourseDetail(raw: RestCourseDetail): ApiCourseDetail {
  return {
    ...raw,
    stripePriceIdPersonal: null,
    stripePriceIdGroup: null,
    stripePriceIdEnterprise: null,
    stripeProductId: null,
    whatsIncluded: raw.whatsIncluded ?? [],
    whatYoullLearn: raw.whatYoullLearn ?? [],
    whoThisCourseIsFor: raw.whoThisCourseIsFor ?? [],
    assessments: raw.assessments ?? [],
    updatedAt: raw.updatedAt ?? null,
    atAGlance: [],
  };
}

async function fetchCourses() {
  const path = "/api/courses";
  const url = new URL(path, BASE_URL);

  return await fetchAPI(url.href, { method: "GET" });
}

export const getCourses = cache(fetchCourses);

async function fetchCourseBySlug(slug: string) {
  const path = `/api/courses/${slug}`;
  const url = new URL(path, BASE_URL);

  const result = await fetchAPI(url.href, { method: "GET" });
  return {
    ...result,
    data: toApiCourseDetail(result.data as RestCourseDetail),
  };
}

export const getCourseBySlug = cache(fetchCourseBySlug);

export type ApiBundleCourse = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  thumbnailImage: ApiImage | null;
  durationLabel: string;
  deliveryMode: string;
  hasCertificate: boolean;
  price: string;
  category: { id: string; name: string; slug: string };
};

export type ApiBundle = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: ApiImage | null;
  certificationBadge: string;
  ratingStars: number;
  ratingText: string;
  durationLabel: string;
  deliveryMode: string;
  price: string;
  originalPrice: string;
  offerEndsAt: string | null;
  courseCount: number;
  individualTotal: string;
  courses: ApiBundleCourse[];
};

async function fetchBundles() {
  const path = "/api/bundles/";
  const url = new URL(path, BASE_URL);

  return await fetchAPI(url.href, { method: "GET" });
}

export const getBundles = cache(fetchBundles);

async function fetchBundleBySlug(slug: string) {
  const path = `/api/bundles/${slug}`;
  const url = new URL(path, BASE_URL);

  return await fetchAPI(url.href, { method: "GET" });
}

export const getBundleBySlug = cache(fetchBundleBySlug);
