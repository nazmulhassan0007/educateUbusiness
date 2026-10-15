// What the auth forms use to call our own /api/auth/* routes. Never throws:
// a dropped connection or a non-JSON reply comes back as an ordinary
// failure with a message to show, so a form can always leave its busy state.
export type AuthRouteResult = {
  ok: boolean;
  status: number;
  // Each route's own JSON (`error`, `errors`, `otpRequired`, `valid`, …).
  data: Record<string, unknown> & { error?: string; errors?: string[] };
};

const OFFLINE_MESSAGE = "We couldn't reach the server. Check your connection and try again.";

export async function callAuthRoute(
  url: string,
  body?: unknown,
): Promise<AuthRouteResult> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: body === undefined ? "GET" : "POST",
      ...(body === undefined
        ? {}
        : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    });
  } catch {
    return { ok: false, status: 0, data: { error: OFFLINE_MESSAGE } };
  }

  const data = await response.json().catch(() => null);
  if (!data || typeof data !== "object") {
    return {
      ok: false,
      status: response.status,
      data: { error: "Something went wrong. Please try again." },
    };
  }
  return { ok: response.ok, status: response.status, data };
}

/** The most specific message a failed route gave, or `fallback`. */
export function authErrorMessage(result: AuthRouteResult, fallback: string): string {
  return result.data.errors?.[0] ?? result.data.error ?? fallback;
}
