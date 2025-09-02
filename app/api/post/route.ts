import { type NextRequest, type NextResponse } from "next/server";

async function POST(request: NextRequest) {
  const body = await request.json();
}
