import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const apiKey = request.headers.get("api-key");
  if (request.method === "GET") {
    return NextResponse.next();
  }

  try {
    const blogApi = process.env.BLOG_API_KEY;
    if (blogApi !== apiKey) {
      console.error("invalid api key");
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Auth API request failed:", error);
    return NextResponse.json(
      { error: "Authentication service unavailable" },
      { status: 503 }
    );
  }
}

export const config = {
  matcher: ["/:path*"],
};
