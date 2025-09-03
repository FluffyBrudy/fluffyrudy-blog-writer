import { type posts } from "@prisma/client";

export type PostCreateBody = Omit<
  posts,
  "createdAt" | "updatedAt" | "slug" | "id"
> & { tags: string[] };
