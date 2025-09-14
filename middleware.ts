// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const publicPaths = ["/sign-in", "/sign-up"];
  const token = req.cookies.get("access_token");
  console.log("Middleware token:", token);

  if (token) {
    if (publicPaths.includes(pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      console.log(`Redirecting authenticated user from ${pathname} to /`);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!token && !publicPaths.includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    console.log(`No token, redirecting unauthenticated user from ${pathname} to /sign-in`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/achievements", 
    "/reading",
    "/scheduleTracker",
    "/trackProgress",
    "/weeklyFeedback",
  ],
};