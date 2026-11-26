import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, hasAccess } from "@/lib/access";

/** Sends visitors without a valid access cookie to the password page. */
export async function proxy(request: NextRequest) {
  if (await hasAccess(request.cookies.get(ACCESS_COOKIE)?.value)) return NextResponse.next();

  const url = request.nextUrl.clone();
  const next = request.nextUrl.pathname + request.nextUrl.search;
  url.pathname = "/enter";
  url.search = next === "/" ? "" : `?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything (pages, their data requests and /public images) except the
  // password page itself, build assets, the icon and robots.txt.
  matcher: ["/((?!enter(?:$|/)|_next/static|_next/image|icon\\.svg|favicon\\.ico|robots\\.txt).*)"],
};
