import { unstable_cache } from "next/cache";
import { fetchAPI } from "./fetch-api";
import { getCmsURL } from "./get-url";

const BASE_URL = getCmsURL();

async function fetchNavigation() {
  const path = "/api/navigation?website_id=48";
  const url = new URL(path, BASE_URL);

  return await fetchAPI(url.href, { method: "GET" });
}

export const getNavigation = unstable_cache(fetchNavigation, ["navigation-data"], {
  revalidate: 300,
  tags: ["navigation"],
});

async function fetchFooter() {
  const path = "/api/navigation/48/footer";
  const url = new URL(path, BASE_URL);

  return await fetchAPI(url.href, { method: "GET" });
}

export const getFooter = unstable_cache(fetchFooter, ["footer-data"], {
  revalidate: 300,
  tags: ["footer"],
});

async function fetchHomePage() {
  const path = "/api/pages/302";
  const url = new URL(path, BASE_URL);

  return await fetchAPI(url.href, { method: "GET" });
}

export const getHomePage = unstable_cache(fetchHomePage, ["home-page-data"], {
  revalidate: 300,
  tags: ["home-page"],
});

async function fetchCoursesPage() {
  const path = "/api/pages/307";
  const url = new URL(path, BASE_URL);

  return await fetchAPI(url.href, { method: "GET" });
}

export const getCoursesPage = unstable_cache(
  fetchCoursesPage,
  ["courses-page-data"],
  { revalidate: 300, tags: ["courses-page"] },
);

async function fetchAboutPage() {
  const path = "/api/pages/313";
  const url = new URL(path, BASE_URL);

  return await fetchAPI(url.href, { method: "GET" });
}

export const getAboutPage = unstable_cache(fetchAboutPage, ["about-page-data"], {
  revalidate: 300,
  tags: ["about-page"],
});

async function fetchContactPage() {
  const path = "/api/pages/317";
  const url = new URL(path, BASE_URL);

  return await fetchAPI(url.href, { method: "GET" });
}

export const getContactPage = unstable_cache(
  fetchContactPage,
  ["contact-page-data"],
  { revalidate: 300, tags: ["contact-page"] },
);

async function fetchSupportHubPage() {
  const path = "/api/pages/318";
  const url = new URL(path, BASE_URL);

  return await fetchAPI(url.href, { method: "GET" });
}

export const getSupportHubPage = unstable_cache(
  fetchSupportHubPage,
  ["support-hub-page-data"],
  { revalidate: 300, tags: ["support-hub-page"] },
);

async function fetchCookiesPolicyPage() {
  const path = "/api/pages/328";
  const url = new URL(path, BASE_URL);

  return await fetchAPI(url.href, { method: "GET" });
}

export const getCookiesPolicyPage = unstable_cache(
  fetchCookiesPolicyPage,
  ["cookies-policy-page-data"],
  { revalidate: 300, tags: ["cookies-policy-page"] },
);

async function fetchRefundPolicyPage() {
  const path = "/api/pages/329";
  const url = new URL(path, BASE_URL);

  return await fetchAPI(url.href, { method: "GET" });
}

export const getRefundPolicyPage = unstable_cache(
  fetchRefundPolicyPage,
  ["refund-policy-page-data"],
  { revalidate: 300, tags: ["refund-policy-page"] },
);
