import { posts } from "@/lib/prisma";

export type PostCreateBody = Omit<
  posts,
  "createdAt" | "updatedAt" | "slug" | "id"
> & { tags: string[] };
