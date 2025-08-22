import { clerkMiddleware } from "@clerk/nextjs/server"

// Protect all routes by default
export default clerkMiddleware()

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
