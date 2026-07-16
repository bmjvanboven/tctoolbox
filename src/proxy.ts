import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!session;
  const isLoginPage = pathname === "/login";
  const isPublicePage =
    isLoginPage ||
    pathname === "/wachtwoord-vergeten" ||
    pathname === "/wachtwoord-resetten";
  const isAdminRoute = pathname.startsWith("/admin");
  const isPrijsbeheerRoute =
    pathname.startsWith("/admin/tools/reparatieprijzen") ||
    pathname.startsWith("/admin/tools/verkoopprijzen");

  if (!isLoggedIn && !isPublicePage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isPublicePage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isAdminRoute && session?.user.role !== "ADMIN") {
    const magAlsPrijsbeheerder = isPrijsbeheerRoute && session?.user.role === "REPARATIESPECIALIST";
    if (!magAlsPrijsbeheerder) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png|logo-wit.png|logo-tctoolbox-mobiel.png|manifest.json|sw.js|icons).*)"],
};
