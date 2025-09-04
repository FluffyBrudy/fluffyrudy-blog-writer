import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isProduction =
    process.env.USER_ENV === "production" ||
    process.env.NODE_ENV === "production";

  if (isProduction) {
    const blockedMethods = ["POST", "PUT", "DELETE"];

    if (blockedMethods.includes(request.method)) {
      NextResponse.json("you dont have permission", { status: 405 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
