import prisma from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const params_ = await params;
    const tagId = Number.parseInt(params_.id);

    if (isNaN(tagId)) {
      return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
    }

    const tagWithPostCount = await prisma.tags.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!tagWithPostCount) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    if (tagWithPostCount._count.posts > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete tag with associated posts",
          postCount: tagWithPostCount._count.posts,
        },
        { status: 400 }
      );
    }

    await prisma.tags.delete({
      where: { id: tagId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const params_ = await params;
    const tagId = Number.parseInt(params_.id);
    const { name } = await request.json();

    if (isNaN(tagId)) {
      return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    const updatedTag = await prisma.tags.update({
      where: { id: tagId },
      data: { name: name.toLowerCase().trim() },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error("Error updating tag:", error);
    return NextResponse.json(
      { error: "Failed to update tag" },
      { status: 500 }
    );
  }
}
