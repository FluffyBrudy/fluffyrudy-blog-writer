import prisma from "@/lib/prisma";
import { HttpStatusCode } from "axios";
import { useParams } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(requset: NextRequest) {
  try {
    const params = useParams() as { id: string };
    const id = Number(params.id);

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
