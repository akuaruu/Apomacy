import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type UserRole = "admin" | "kasir" | "member";

function isRoute(pathname: string, route: string) {
    return pathname === route || pathname.startsWith(`${route}/`);
}

function getRedirectPath(role: UserRole) {
    if (role === "admin") return "/admin";
    if (role === "kasir") return "/kasir";

    return "/katalog";
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const token = request.cookies.get("apomacy_token")?.value;
    const roleCookie = request.cookies.get("apomacy_role")?.value;

    const normalizedRole = roleCookie?.trim().toLowerCase();

    const role: UserRole | null =
        normalizedRole === "admin" ||
            normalizedRole === "kasir" ||
            normalizedRole === "member"
            ? normalizedRole
            : null;

    const isLoginRoute = isRoute(pathname, "/login");

    const isAdminRoute = isRoute(pathname, "/admin");
    const isKasirRoute = isRoute(pathname, "/kasir");

    const isKatalogRoute = isRoute(pathname, "/katalog");
    const isKeranjangRoute = isRoute(pathname, "/keranjang");

    const isStaffRoute = isAdminRoute || isKasirRoute;
    const isMemberRoute = isKatalogRoute || isKeranjangRoute;

    if (!token) {
        if (isStaffRoute || isKeranjangRoute) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        return NextResponse.next();
    }

    // Token ada, tetapi role tidak valid atau tidak tersedia.
    if (!role) {
        const response = NextResponse.redirect(
            new URL("/login", request.url)
        );

        response.cookies.delete("apomacy_token");
        response.cookies.delete("apomacy_role");

        return response;
    }

    if (isLoginRoute) {
        return NextResponse.redirect(
            new URL(getRedirectPath(role), request.url)
        );
    }

    if (role === "member") {
        if (isAdminRoute || isKasirRoute) {
            return NextResponse.redirect(
                new URL("/katalog", request.url)
            );
        }

        return NextResponse.next();
    }

    if (role === "admin") {
        if (isKasirRoute || isMemberRoute) {
            return NextResponse.redirect(
                new URL("/admin", request.url)
            );
        }

        return NextResponse.next();
    }

    if (role === "kasir") {
        if (isAdminRoute || isMemberRoute) {
            return NextResponse.redirect(
                new URL("/kasir", request.url)
            );
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/login",
        "/login/:path*",

        "/admin",
        "/admin/:path*",

        "/kasir",
        "/kasir/:path*",

        "/katalog",
        "/katalog/:path*",

        "/keranjang",
        "/keranjang/:path*",
    ],
};