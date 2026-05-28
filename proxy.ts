import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "admin_session";

// Public admin routes — never require authentication
const PUBLIC_ADMIN_PATHS = ["/admin/login"];

function secret(): Uint8Array {
  return new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET ?? "");
}

function unauthorized(isApi: boolean, url: URL): NextResponse {
  if (isApi) {
    return new NextResponse(
      JSON.stringify({ error: "Não autorizado.", code: "UNAUTHORIZED" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  return NextResponse.redirect(new URL("/admin/login", url));
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/admin");

  // Allow public admin paths through without any auth check
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Gate all other /admin/* and /api/admin/* routes
  if (pathname.startsWith("/admin") || isApi) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return unauthorized(isApi, request.nextUrl);

    try {
      const { payload } = await jwtVerify(token, secret());
      if (payload.isAdmin !== true) throw new Error("not admin");
    } catch {
      return unauthorized(isApi, request.nextUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
