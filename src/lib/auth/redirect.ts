// `?redirect=` comes straight from the URL, so anyone can craft a login link
// whose redirect points off-site. Only a same-site path is honoured:
// it must start with a single "/" — "//evil.com" and "/\evil.com" are both
// read by browsers as another host. Whitespace and control characters are
// refused outright, since browsers strip them ("/\t/evil.com" → "//evil.com").
export function safeRedirect<T extends string | null = string>(
  value: string | null | undefined,
  fallback: T = "/" as T,
): string | T {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\") ||
    /[\s\x00-\x1f\x7f]/.test(value)
  ) {
    return fallback;
  }
  return value;
}
