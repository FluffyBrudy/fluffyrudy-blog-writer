import { HttpStatusCode } from "axios";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  const host = request.headers.get("host") ?? "";

  const allowed = (process.env.ALLOW_ORIGIN ?? "")
    .split(/[;,]/)
    .map((o) => o.trim())
    .filter(Boolean);

  const selfOrigin = request.nextUrl.origin;

  const isAllowed =
    (allowed.includes("self") && origin === selfOrigin) ||
    allowed.includes(origin);

  if (request.method === "OPTIONS") {
    const acrMethod =
      request.headers.get("access-control-request-method") ?? "";
    const acrHeaders =
      request.headers.get("access-control-request-headers") ?? "";

    if (!origin) {
      return new NextResponse(null, { status: 204 });
    }

    if (!isAllowed) {
      return new NextResponse(null, {
        status: 403,
        headers: {
          Vary: "Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
        },
      });
    }

    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods":
          acrMethod || "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers":
          acrHeaders || "Content-Type, Authorization, api-key",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
      },
    });
  }

  const apiKey = request.headers.get("api-key");
  if (request.method === "GET" || request.method === "HEAD") {
    const response = NextResponse.next();
    if (isAllowed && origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    response.headers.append("Vary", "Origin");
    return response;
  }

  try {
    const blogApi = process.env.BLOG_API_KEY;
    if (!blogApi)
      return NextResponse.json(
        { error: "Internal server error(intentional)" },
        { status: 500 }
      );
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
                Vary: "Origin",
              }
            : {
                Vary: "Origin",
              },
        }
      );
    }

    const response = NextResponse.next();
    if (isAllowed && origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    response.headers.append("Vary", "Origin");
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
              Vary: "Origin",
            }
          : {
              Vary: "Origin",
            },
      }
    );
  }
}

export const config = {
  matcher: ["/:path*"],
};
