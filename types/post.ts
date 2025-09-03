import { type posts } from "@/app/generated/prisma";

export type PostCreateBody = Omit<
  posts,
  "createdAt" | "updatedAt" | "slug" | "id"
> & { tags: string[] };
