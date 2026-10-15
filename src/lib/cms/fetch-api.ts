type NextFetchRequestConfig = {
  revalidate?: number | false;
  tags?: string[];
};

interface FetchAPIOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  authToken?: string;
  body?: Record<string, unknown>;
  next?: NextFetchRequestConfig;
}

export async function fetchAPI(url: string, options: FetchAPIOptions) {
  const { method, authToken, body, next } = options;

  const headers: RequestInit & { next?: NextFetchRequestConfig } = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
    ...(next && { next }),
  };

  // Deliberately doesn't catch: these loaders are wrapped in `unstable_cache`,
  // which only skips caching a call that throws — a *returned* error value
  // gets cached as if it were the successful result for the full revalidate
  // window, turning one transient CMS hiccup into minutes of "no content"
  // for every visitor. Throwing lets the caller (or Next's error handling)
  // react per-request instead.
  const response = await fetch(url, {
    ...headers,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    throw new Error(`CMS request failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || response.statusText);
  }

  return data;
}
