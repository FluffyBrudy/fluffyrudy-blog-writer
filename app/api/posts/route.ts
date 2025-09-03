import prisma from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";
import type { EStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as EStatus | null;
    const tag = searchParams.get("tag");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const offset = Number.parseInt(searchParams.get("offset") || "0");
    const includeContent = searchParams.get("includeContent") === "true";

    const where: { status?: EStatus; tags?: { some?: { name?: string } } } = {};
    if (status) where.status = status;
    if (tag) {
      where.tags = {
        some: { name: tag },
      };
    }

    const tags = tag ? { some: { name: tag } } : undefined;
    const posts = await prisma.posts.findMany({
      where: {
        status: status || undefined,
        tags,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        content: includeContent,
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
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
