import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login"];

export default authMiddleware({
    afterAuth: (auth, req) => {
        // Check if the current route is a public route
        const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

        // If the user is not authenticated and the route is not public, redirect to /login
        if (!auth.userId && !isPublicRoute) {
            const loginUrl = new URL("/login", req.url);
            return NextResponse.redirect(loginUrl);
        }

        // If the user is authenticated or the route is public, proceed to the requested route
        return NextResponse.next();
    },
    publicRoutes,
    ignoredRoutes: [
        "/((?!api|trpc))(_next.*|.+.[w]+$)", 
        "/api/gemini/intent",
        "/api/webhook",
    ],
});

export const config = {
    matcher: [
        // Skip Next.js internals and static files
        "/((?!.+\\.[\\w]+$|_next).*)",
        // Include api routes
        "/(api|trpc)(.*)"
    ]
};