import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
});

const { pathname } = req.nextUrl;

const isWorkerAuthPage = pathname.startsWith("/worker/sign-in") || pathname.startsWith("/worker/sign-up");
const isEnterpriseAuthPage = pathname.startsWith("/enterprise/sign-in") || pathname.startsWith("/enterprise/sign-up");
const isAuthPage = isWorkerAuthPage || isEnterpriseAuthPage;

const isWorkerRoute = pathname.startsWith("/worker/dashboard");
const isEnterpriseRoute = pathname.startsWith("/enterprise/dashboard");
const isAdminRoute = pathname.startsWith("/admin/dashboard");

const isProtectedRoute = isWorkerRoute || isEnterpriseRoute || isAdminRoute;

if (!token && isProtectedRoute) {
    if (isEnterpriseRoute) {
    return NextResponse.redirect(new URL("/enterprise/sign-in", req.url));
    }
    if (isAdminRoute) {
    return NextResponse.redirect(new URL("/admin/sign-in", req.url));
    }
    return NextResponse.redirect(new URL("/worker/sign-in", req.url));
}

if (token && isAuthPage) {
    const userRole = token.role as string;
    
    if (userRole === "Institution") {
    return NextResponse.redirect(new URL("/enterprise/dashboard", req.url));
    }
    if (userRole === "Admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/worker/dashboard", req.url));
}

if (token && isProtectedRoute) {
    const userRole = token.role as string;

    if (isWorkerRoute && userRole !== "Travailleur") {
    return NextResponse.redirect(new URL("/enterprise/dashboard", req.url));
    }

    if (isEnterpriseRoute && userRole !== "Institution") {
    return NextResponse.redirect(new URL("/worker/dashboard", req.url));
    }

    if (isAdminRoute && userRole !== "Admin") {
    return NextResponse.redirect(new URL("/worker/dashboard", req.url));
    }
}

return NextResponse.next();
}

export const config = {
matcher: ["/worker/:path*", "/enterprise/:path*", "/admin/:path*"],
};