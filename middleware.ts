import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  // Add publicRoutes to allow access to public pages without authentication
  publicRoutes: ["/", "/api/webhook"]
});
 
export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!.+\\.[\\w]+$|_next).*)",
    // Include root route
    "/",
    // Include api routes
    "/(api|trpc)(.*)"
  ]
};