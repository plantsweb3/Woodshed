import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/auth-edge";

const PUBLIC_EXACT = new Set([
  "/",
  "/signin",
  "/signup",
  "/terms",
  "/privacy",
  "/setup",
  "/why",
  "/manifest.webmanifest",
  "/favicon.ico",
]);

function isPublic(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (pathname.startsWith("/consent/")) return true;
  if (pathname.startsWith("/api/public")) return true;
  return false;
}

const ADMIN_PREFIX = "/admin";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    if (pathname === "/pending") return NextResponse.redirect(new URL("/signin", req.url));
    const to = new URL("/signin", req.url);
    to.searchParams.set("from", pathname);
    return NextResponse.redirect(to);
  }

  if (pathname === "/pending") {
    if (session.status === "approved") return NextResponse.redirect(new URL("/directory", req.url));
    return NextResponse.next();
  }

  if (session.status === "awaiting_parent_consent") return NextResponse.redirect(new URL("/pending?state=parent", req.url));
  if (session.status === "pending") return NextResponse.redirect(new URL("/pending", req.url));
  if (session.status === "inactive" || session.status === "deleted_pending") {
    const res = NextResponse.redirect(new URL("/signin?inactive=1", req.url));
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (session.role !== "drum_major" && session.role !== "director") {
      return NextResponse.redirect(new URL("/directory", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icons|.*\\..*).*)"],
};
