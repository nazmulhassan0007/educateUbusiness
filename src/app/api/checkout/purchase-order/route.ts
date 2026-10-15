import { NextResponse } from "next/server";
import { authApi } from "@/lib/auth/backend";
import { getAuthToken } from "@/lib/auth/server";
import { getCourseBySlug } from "@/lib/courses/loaders";

// Step 2 of the purchase-order flow — no Stripe/card involved at all, so
// unlike the card purchase types this calls the backend directly and
// synchronously from the browser's own request (no webhook hand-off
// needed, since there's no payment to wait for).
export async function POST(request: Request) {
  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json(
      { error: "You must be logged in to check out." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    items: Array<{ slug: string; quantity: number }>;
    companyId: string;
    purchaseOrderReference: string;
    purchaseOrderDocumentUrl: string;
    couponCode?: string | null;
  };

  // The client only ever knows a course by slug — courseId is resolved
  // here from the real course record, the same way /api/checkout does for
  // the card-payment purchase types.
  const courseResults = await Promise.all(
    body.items.map((item) => getCourseBySlug(item.slug).catch(() => null)),
  );
  const missingIndex = courseResults.findIndex((result) => !result?.data);
  if (missingIndex !== -1) {
    return NextResponse.json(
      { error: `Course "${body.items[missingIndex].slug}" could not be found.` },
      { status: 400 },
    );
  }

  const result = await authApi("/api/checkout", {
    method: "POST",
    token,
    body: {
      purchaseType: "company_po",
      items: body.items.map((item, index) => ({
        courseId: courseResults[index]!.data!.id,
        quantity: item.quantity,
      })),
      companyId: body.companyId,
      purchaseOrderReference: body.purchaseOrderReference,
      purchaseOrderDocumentUrl: body.purchaseOrderDocumentUrl,
      // A coupon rides along on company_po exactly as it does on the card
      // purchase types. No Stripe charge is being built here, so the
      // backend is the only thing that needs it — and it defers the
      // redemption until the PO is actually paid.
      ...(body.couponCode ? { couponCode: body.couponCode } : {}),
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json({ data: result.data }, { status: result.status });
}
