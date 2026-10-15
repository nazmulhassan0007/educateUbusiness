import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authApi } from "@/lib/auth/backend";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";

export type Memberships = {
  individual: { portal: string };
  companies: Array<{
    companyId: string;
    companyName: string;
    status: string;
    isCompanyAdmin: boolean;
    roleName: string;
  }>;
};

export async function GET() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const result = await authApi<Memberships>("/api/auth/memberships", {
    method: "GET",
    token,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json({ data: result.data });
}
