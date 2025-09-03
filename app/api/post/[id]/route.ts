import prisma from "@/lib/prisma";
import { HttpStatusCode } from "axios";
import { NextResponse, type NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(requset: NextRequest, { params }: RouteParams) {
  try {
    const params_ = await params;
    const id = Number(params_.id);

    const post = prisma.posts.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
