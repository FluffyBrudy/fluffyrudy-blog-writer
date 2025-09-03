import prisma from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { EStatus } from "@/app/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as EStatus | null;
    const tag = searchParams.get("tag");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    const where: any = {};
    if (status) where.status = status;
    if (tag) {
      where.tags = {
        some: { name: tag },
      };
    }

    const posts = await prisma.posts.findMany({
      where,
      include: {
        tags: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.posts.count({ where });

    return NextResponse.json({
      posts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
