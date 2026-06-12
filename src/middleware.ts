import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ADMIN_ONLY = ["/settings", "/suppliers", "/purchase-orders", "/reports"];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (ADMIN_ONLY.some((path) => pathname.startsWith(path)) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/movements/:path*",
    "/transfers/:path*",
    "/suppliers/:path*",
    "/purchase-orders/:path*",
    "/orders/:path*",
    "/reports/:path*",
    "/alerts/:path*",
    "/scan/:path*",
    "/settings/:path*",
  ],
};
