import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  publicRoutes: ["/","/login"],
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
