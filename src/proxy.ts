import { NextResponse, type NextRequest } from "next/server";

/**
 * admin.mezcalomano.com serves the private /admin area (and the API).
 * Every other path on that host maps into /admin, so admin.mezcalomano.com/
 * shows the dashboard. On mezcalomano.com the /admin area does not exist.
 * Vercel preview URLs and localhost can open /admin directly for testing.
 * giveaway.mezcalomano.com serves the giveaway reveal page (/giveaway) and its API, noindex.
 */
export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase().split(":")[0];
  const { pathname } = request.nextUrl;
  const isAdminHost = host.startsWith("admin.");
  const isGiveawayHost = host.startsWith("giveaway.");
  const isTestHost = host.endsWith(".vercel.app") || host === "localhost" || host === "127.0.0.1";

  if (isAdminHost) {
    let res: NextResponse;
    if (pathname.startsWith("/api/") || pathname.startsWith("/admin")) {
      res = NextResponse.next();
    } else {
      const url = request.nextUrl.clone();
      url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
      res = NextResponse.rewrite(url);
    }
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  if (isGiveawayHost) {
    let res: NextResponse;
    if (pathname.startsWith("/api/giveaway") || pathname.startsWith("/giveaway")) {
      res = NextResponse.next();
    } else if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/giveaway";
      res = NextResponse.rewrite(url);
    } else {
      return new NextResponse("Not found", { status: 404 });
    }
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  if (pathname.startsWith("/giveaway") && !isTestHost) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (pathname.startsWith("/admin") && !isTestHost) {
    return new NextResponse("Not found", { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  // Skip Next internals and files with an extension (images, fonts, robots.txt).
  matcher: ["/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};
