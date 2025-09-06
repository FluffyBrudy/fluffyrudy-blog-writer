import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  const host = request.headers.get("host") ?? "";

  const allowed =
    process.env.ALLOW_ORIGIN?.split(";").map((o) => o.trim()) || [];

  const selfOrigin = `${request.nextUrl.protocol}//${host}`;

  const isAllowed =
    (allowed.includes("self") && origin === selfOrigin) ||
    allowed.includes(origin);

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": isAllowed ? origin : "",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, api-key",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  const apiKey = request.headers.get("api-key");
  if (request.method === "GET") {
    const response = NextResponse.next();
    if (isAllowed) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return response;
  }

  try {
    const blogApi = process.env.BLOG_API_KEY;
    if (blogApi !== apiKey) {
      console.error("invalid api key");
      return NextResponse.json(
        { error: "api key is required" },
        {
          status: 401,
          headers: isAllowed
            ? {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Credentials": "true",
              }
            : {},
        }
      );
    }

    const response = NextResponse.next();
    if (isAllowed) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return response;
  } catch (error) {
    console.error("Auth API request failed:", error);
    return NextResponse.json(
      { error: "Authentication service unavailable" },
      {
        status: 503,
        headers: isAllowed
          ? {
              "Access-Control-Allow-Origin": origin,
              "Access-Control-Allow-Credentials": "true",
            }
          : {},
      }
    );
  }
}

export const config = {
  matcher: ["/:path*"],
};
