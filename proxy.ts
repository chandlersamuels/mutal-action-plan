import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/map/(.*)",
  "/api/client/(.*)",
  "/api/webhooks/(.*)",
  "/api/cron/(.*)",
  "/api/onboarding",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = req.nextUrl;

  if (isPublicRoute(req)) return NextResponse.next();

  if (!userId) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  const orgId = (
    sessionClaims?.publicMetadata as Record<string, string> | undefined
  )?.organizationId;

  // Only redirect away from onboarding if the JWT already has the org
  // (i.e. the user is fully onboarded). New users with a stale JWT are
  // allowed through to /dashboard where the admin layout does a DB check.
  if (orgId && isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
