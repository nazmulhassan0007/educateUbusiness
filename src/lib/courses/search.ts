/**
 * One definition of "matches" for course search, shared by the hero
 * dropdown (HeroCourseSearch) and the /courses explorer — they search the
 * same catalogue, and two different answers to the same query is worse than
 * either behaviour on its own.
 *
 * Both used to do `[fields].join(" ").toLowerCase().includes(query)`, which
 * got two ordinary queries wrong:
 *
 * - Multi-word queries only matched when those words sat next to each other,
 *   in that order. "safety fire" or "cyber awareness training" found nothing
 *   even though every word is right there in the course.
 * - Punctuation counted. Categories are written "Health & Safety", so the
 *   obvious query "health and safety" — or even "health safety" — matched
 *   nothing at all.
 *
 * So both sides are reduced to lowercase words with `&` spelled out as
 * "and", and a course matches when *every* query word appears somewhere in
 * it. Scoring then decides the order: a hit in the title counts for more
 * than one in the category, which counts for more than one in the
 * description, so "management" puts "Effective People Management" above a
 * course that only mentions managers in passing.
 *
 * Whole-catalogue scan, no index: the catalogue is a handful of courses the
 * page already holds in memory. If it ever grows past the low hundreds this
 * should move to the backend as a query parameter instead.
 */

/** What a match in each field is worth, before bonuses. */
const FIELD_WEIGHTS = {
  title: 10,
  category: 6,
  keywords: 4,
  description: 2,
} as const;

/** A word that starts a word beats one buried inside a longer one. */
const WORD_START_BONUS = 3;
const PHRASE_IN_TITLE_START = 50;
const PHRASE_IN_TITLE = 25;
const PHRASE_ANYWHERE = 10;

export type SearchableCourse = {
  title?: string | null;
  description?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  keywords?: string[] | string | null;
  /** Anything else the card puts in front of the reader, e.g. "CPD Certified". */
  extra?: string | null;
};

export type CourseSearchIndex = {
  title: string;
  category: string;
  keywords: string;
  description: string;
  all: string;
};

/**
 * Lowercase words only. `&` becomes "and" on both sides of the comparison,
 * so "Health & Safety" is reachable by typing it either way, and every other
 * punctuation mark becomes a word break — which is also what lets a category
 * *slug* ("health-safety") answer a query typed as words.
 */
export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

/** The words a query has to find. Empty when the query is only punctuation. */
export function tokenizeSearchQuery(query: string): string[] {
  const normalized = normalizeSearchText(query);
  return normalized ? normalized.split(" ") : [];
}

/** The backend's `tags` are null for every course today and the non-null
 *  shape isn't pinned down, so accept a list or a single string. */
export function toKeywordList(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value];
  return undefined;
}

/**
 * Normalises a course once, so typing doesn't re-normalise the whole
 * catalogue on every keystroke. Callers should memoise the result against
 * the course list.
 */
export function buildCourseSearchIndex(
  course: SearchableCourse,
): CourseSearchIndex {
  const title = normalizeSearchText(course.title ?? "");
  const category = normalizeSearchText(
    [course.categoryName, course.categorySlug].filter(Boolean).join(" "),
  );
  const keywords = normalizeSearchText(
    [
      Array.isArray(course.keywords)
        ? course.keywords.join(" ")
        : (course.keywords ?? ""),
      course.extra ?? "",
    ]
      .filter(Boolean)
      .join(" "),
  );
  const description = normalizeSearchText(course.description ?? "");

  return {
    title,
    category,
    keywords,
    description,
    all: [title, category, keywords, description].filter(Boolean).join(" "),
  };
}

function startsAWord(haystack: string, token: string): boolean {
  return new RegExp(`(^| )${token}`).test(haystack);
}

/**
 * How well a course answers the query — 0 when it doesn't. Every word has to
 * land somewhere: "fire safety london" must not return the fire safety
 * course just because two of its three words match.
 */
export function scoreCourseSearch(
  index: CourseSearchIndex,
  tokens: string[],
): number {
  if (tokens.length === 0) return 0;

  let score = 0;
  for (const token of tokens) {
    let weight = 0;
    if (index.title.includes(token)) weight = FIELD_WEIGHTS.title;
    else if (index.category.includes(token)) weight = FIELD_WEIGHTS.category;
    else if (index.keywords.includes(token)) weight = FIELD_WEIGHTS.keywords;
    else if (index.description.includes(token))
      weight = FIELD_WEIGHTS.description;

    if (weight === 0) return 0;
    if (startsAWord(index.all, token)) weight += WORD_START_BONUS;
    score += weight;
  }

  // A course that contains the query as a phrase is what the reader meant;
  // one that merely contains all the same words scattered about is a
  // fallback, and should rank as one.
  const phrase = tokens.join(" ");
  if (index.title.startsWith(phrase)) score += PHRASE_IN_TITLE_START;
  else if (index.title.includes(phrase)) score += PHRASE_IN_TITLE;
  else if (index.all.includes(phrase)) score += PHRASE_ANYWHERE;

  return score;
}

/** Match-only form, for callers that keep their own ordering. */
export function matchesCourseSearch(
  index: CourseSearchIndex,
  tokens: string[],
): boolean {
  return scoreCourseSearch(index, tokens) > 0;
}
