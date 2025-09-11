"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { posts, tags } from "@prisma/client";
import { Search, Calendar, Clock } from "lucide-react";

type PostWithTags = posts & { tags: tags[] };

interface PostsResponse {
  posts: PostWithTags[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function BlogPage() {
  const [postsData, setPostsData] = useState<PostsResponse | null>(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<
    (tags & { _count: { posts: number } })[]
  >([]);
  const [postsError, setPostsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsResponse = await api.getTags();
        setAllTags(tagsResponse.data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setTagsLoading(false);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        setPostsError(null);
        const postsResponse = await api.getPosts({
          status: "PUBLISHED",
          tag: selectedTag || undefined,
          includeContent: false,
        });
        setPostsData(postsResponse.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPostsError("Failed to load posts");
        setPostsData({
          posts: [],
          pagination: { total: 0, limit: 0, offset: 0, hasMore: false },
        });
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [selectedTag]);

  const filteredPosts = (postsData?.posts || []).filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s+/).length || 0;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime} min read`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-balance">Our Blog</h1>
              <p className="text-muted-foreground mt-2">Sharing is caring</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Link href="/editor">
                <Button>Write Post</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-balance">
              Our Blog
            </h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Teaching other is important for self improvement
            </p>

            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <main className="flex-1">
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Filter by Topic</h3>
                {tagsLoading ? (
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-8 w-20 bg-muted rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedTag === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag(null)}
                    >
                      All Posts
                    </Button>
                    {allTags.map((tag) => (
                      <Button
                        key={tag.id}
                        variant={
                          selectedTag === tag.name ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedTag(tag.name)}
                      >
                        {tag.name} ({tag._count.posts})
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {postsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <div className="h-48 bg-muted rounded-lg animate-pulse"></div>
                      <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : postsError ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2 text-destructive">
                    Error Loading Posts
                  </h3>
                  <p className="text-muted-foreground">{postsError}</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No posts found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedTag
                      ? "Try adjusting your search or filter criteria"
                      : "No published posts available yet"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <CardHeader className="p-0">
                        {post.coverImage && (
                          <div className="relative h-48 overflow-hidden rounded-t-lg">
                            <Image
                              src={post.coverImage || "/placeholder.svg"}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(post.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {getReadingTime(post.content || "")}
                            </div>
                          </div>

                          <h2 className="text-xl font-black text-balance group-hover:text-primary transition-colors">
                            <Link href={`/blog/${post.slug}`}>
                              {post.title}
                            </Link>
                          </h2>

                          {post.excerpt && (
                            <p className="text-muted-foreground text-pretty leading-relaxed">
                              {post.excerpt}
                            </p>
                          )}

                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {post.tags.map((tag) => (
                                <Badge
                                  key={tag.id}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <Link href={`/blog/${post.slug}`}>
                            <Button
                              variant="ghost"
                              className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
                            >
                              Read More →
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </main>

            <aside className="lg:w-80 space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Popular Tags</h3>
                </CardHeader>
                <CardContent>
                  {tagsLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="h-6 bg-muted rounded animate-pulse"
                        ></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allTags.slice(0, 10).map((tag) => (
                        <div
                          key={tag.id}
                          className="flex items-center justify-between"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto justify-start"
                            onClick={() => setSelectedTag(tag.name)}
                          >
                            #{tag.name}
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {tag._count.posts}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
