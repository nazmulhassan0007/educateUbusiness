import { getCoursesApiURL } from "@/lib/courses/get-url";

// Same backend host the courses API lives on (see src/lib/courses/get-url.ts)
// — the external API reference documents auth, courses, and checkout as one
// service under the same base URL.
const BASE_URL = getCoursesApiURL();

type BackendSuccess<T> = { ok: true; status: number; data: T };
type BackendFailure = {
  ok: false;
  status: number;
  message: string;
  errors?: string[];
};

// Deliberately doesn't reuse src/lib/cms/fetch-api.ts's fetchAPI(): that
// helper throws away the status code on failure, but auth call sites need
// to tell a 401 (bad password / expired token) apart from a 409 (email
// taken) or 400 (validation) to route each to the right UI state.
export async function authApi<T = unknown>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown; token?: string | null } = {
    method: "GET",
  },
): Promise<BackendSuccess<T> | BackendFailure> {
  const url = new URL(path, BASE_URL);
  let response: Response;
  try {
    response = await fetch(url.href, {
      method: init.method,
      headers: {
        "Content-Type": "application/json",
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      },
      ...(init.body ? { body: JSON.stringify(init.body) } : {}),
      cache: "no-store",
    });
  } catch (error) {
    // Backend unreachable (down, DNS, timeout). Returned as an ordinary
    // failure so every route answers with JSON the forms can show — a throw
    // here used to crash the route into an empty 500 that left the form
    // stuck on its busy state. 503 is ≥500, so the Stripe webhook still
    // treats it as retryable.
    console.error(`[authApi] ${init.method} ${path} could not reach the backend:`, error);
    return {
      ok: false,
      status: 503,
      message: "We couldn't reach the server. Please try again in a moment.",
    };
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: json?.message || response.statusText,
      errors: json?.errors,
    };
  }

  return { ok: true, status: response.status, data: (json?.data ?? json) as T };
}
