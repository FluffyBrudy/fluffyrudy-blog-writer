import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createSlug } from "@/lib/editor.helper";
import prisma from "@/lib/prisma";
import { PostCreateBody } from "@/types/post";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PostCreateBody;
    const { title, content, tags, coverImage, excerpt, status } = body;

    const slug = createSlug(title);
    const response = await prisma.posts.create({
      data: {
        title,
        content,
        status,
        slug,
        excerpt,
        coverImage,
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });

    return NextResponse.json(
      { ...response },
      { status: HttpStatusCode.Created }
    );
  } catch (error) {
    const e = error as {
      meta: PrismaClientKnownRequestError["meta"];
      code: string;
    };
    if (e?.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "Choose other title, post with this title already exists" +
            JSON.stringify(e.meta),
        },
        { status: HttpStatusCode.InternalServerError }
      );
    } else {
      return NextResponse.json(
        {
          error: "Internal server error",
        },
        { status: HttpStatusCode.InternalServerError }
      );
    }
  }
}
