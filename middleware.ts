import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = [
    "/",
    "/api/auth",
    "/worker/sign-in",
    "/worker/sign-up",
    "/enterprise/sign-in",
    "/enterprise/sign-up",
    "/admin/sign-in",
    "/admin/sign-up",
    "/enterprise/forgot-password",
    "/enterprise/reset-password",
    "/worker/forgot-password",
    "/worker/reset-password",
    "/admin/forgot-password",
    "/admin/reset-password",
    "/admin/verify-email",
    "/api/auth/admin/verify-email",
  ];

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protection spéciale pour les routes dashboard
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard")) {
    // Obtenir la session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.redirect(new URL("/worker/sign-in", request.url));
    }

    const userRole = session.user.role;

    // Rediriger vers le bon dashboard selon le rôle
    if (userRole === "Travailleur") {
      return NextResponse.redirect(new URL("/worker/dashboard", request.url));
    } else if (userRole === "Institution") {
      return NextResponse.redirect(
        new URL("/enterprise/dashboard", request.url)
      );
    } else if (userRole === "Admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/worker/sign-in", request.url));
  }

  // Obtenir la session
  const session = await auth();

  // Si pas de session, rediriger vers la page de connexion appropriée
  if (!session?.user) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/sign-in", request.url));
    } else if (pathname.startsWith("/enterprise")) {
      return NextResponse.redirect(new URL("/enterprise/sign-in", request.url));
    } else if (pathname.startsWith("/worker")) {
      return NextResponse.redirect(new URL("/worker/sign-in", request.url));
    }
    return NextResponse.redirect(new URL("/worker/sign-in", request.url));
  }

  const userRole = session.user.role;

  // Protection des routes admin
  if (pathname.startsWith("/admin")) {
    if (userRole !== "Admin") {
      // Rediriger selon le rôle
      if (userRole === "Travailleur") {
        return NextResponse.redirect(new URL("/worker/dashboard", request.url));
      } else if (userRole === "Institution") {
        return NextResponse.redirect(
          new URL("/enterprise/dashboard", request.url)
        );
      }
      return NextResponse.redirect(new URL("/admin/sign-in", request.url));
    }
  }

  // Protection des routes enterprise
  if (pathname.startsWith("/enterprise")) {
    if (userRole !== "Institution") {
      if (userRole === "Travailleur") {
        return NextResponse.redirect(new URL("/worker/dashboard", request.url));
      } else if (userRole === "Admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/enterprise/sign-in", request.url));
    }
  }

  // Protection des routes worker
  if (pathname.startsWith("/worker")) {
    if (userRole !== "Travailleur") {
      if (userRole === "Institution") {
        return NextResponse.redirect(
          new URL("/enterprise/dashboard", request.url)
        );
      } else if (userRole === "Admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/worker/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
