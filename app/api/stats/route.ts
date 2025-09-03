import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [totalPosts, publishedPosts, draftPosts, totalTags] =
      await Promise.all([
        prisma.posts.count(),
        prisma.posts.count({ where: { status: "PUBLISHED" } }),
        prisma.posts.count({ where: { status: "DRAFT" } }),
        prisma.tags.count(),
      ]);

    return NextResponse.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalTags,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
