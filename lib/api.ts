import { posts, tags } from "@/app/generated/prisma";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

class ApiClient {
  private client: AxiosInstance;
  private endpoints = {
    create: "/api/post",
    get: "/api/post/:id",
  };
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

  async createPost(
    post: Omit<posts, "createdAt" | "updatedAt" | "slug" | "id">
  ) {
    const response = await this.client.post<posts & { tags: tags[] }>(
      this.endpoints.create,
      post
    );
    return response;
  }

  async updatePost(id: posts["id"]) {}
}

export const api = new ApiClient();
