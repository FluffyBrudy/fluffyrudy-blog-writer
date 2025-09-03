import type { posts, tags } from "@prisma/client";
import type { PostCreateBody } from "@/types/post";
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";

interface PostsResponse {
  posts: (posts & { tags: tags[] })[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface StatsResponse {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalTags: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: "",
    });

    this.client.interceptors.request.use((config) => {
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        return {
          data: response.data,
          status: response.status,
          statusText: response.statusText,
        } as unknown as AxiosResponse;
      },
      (err) => {
        const e = err as AxiosError;
        return Promise.reject({ error: e.response?.data });
      }
    );
  }

  async createPost(post: PostCreateBody) {
    const response = await this.client.post<posts & { tags: tags[] }>(
      "/api/post",
      post
    );
    return response;
  }

  async getPosts(params?: {
    status?: string;
    tag?: string;
    limit?: number;
    offset?: number;
    includeContent?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.tag) searchParams.set("tag", params.tag);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());
    if (params?.includeContent) searchParams.set("includeContent", "true");

    const response = await this.client.get<PostsResponse>(
      `/api/posts?${searchParams.toString()}`
    );
    return response;
  }

  async getPost(id: number) {
    const response = await this.client.get<posts & { tags: tags[] }>(
      `/api/posts/${id}`
    );
    return response;
  }

  async getPostBySlug(slug: string) {
    const response = await this.client.get<posts & { tags: tags[] }>(
      `/api/posts/slug/${slug}`
    );
    return response;
  }

  async updatePost(id: number, post: PostCreateBody) {
    const response = await this.client.put<posts & { tags: tags[] }>(
      `/api/posts/${id}`,
      post
    );
    return response;
  }

  async deletePost(id: number) {
    const response = await this.client.delete(`/api/posts/${id}`);
    return response;
  }

  async getTags() {
    const response = await this.client.get<
      (tags & { _count: { posts: number } })[]
    >("/api/tags");
    return response;
  }

  async createTag(name: string) {
    const response = await this.client.post<tags>("/api/tags", { name });
    return response;
  }

  async getStats() {
    const response = await this.client.get<StatsResponse>("/api/stats");
    return response;
  }
}

export const api = new ApiClient();
