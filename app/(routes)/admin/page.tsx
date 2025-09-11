"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";
import type { posts, tags } from "@prisma/client";
import {
  MoreHorizontal,
  Plus,
  Search,
  FileText,
  Eye,
  TrendingUp,
  Edit,
  Trash2,
  Globe,
  FileX,
  Tag,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";

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

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalTags: number;
}

export default function AdminDashboard() {
  const [postsData, setPostsData] = useState<PostsResponse | null>(null);
  const [allTags, setAllTags] = useState<
    (tags & { _count: { posts: number } })[]
  >([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalTags: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingTag, setEditingTag] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsResponse = await api.getStats();
        setStats(statsResponse.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        const postsResponse = await api.getPosts({
          limit: 50,
          includeContent: false,
        });
        setPostsData(postsResponse.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, []);

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

  const handleDeletePost = async (postId: number) => {
    try {
      await api.deletePost(postId);

      const postsResponse = await api.getPosts({
        limit: 50,
        includeContent: false,
      });
      setPostsData(postsResponse.data);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleStatusChange = async (
    postId: number,
    newStatus: "PUBLISHED" | "DRAFT"
  ) => {
    try {
      const fullPostResponse = await api.getPost(postId);
      const fullPost = fullPostResponse.data;

      if (!fullPost) return;

      await api.updatePost(postId, {
        title: fullPost.title,
        content: fullPost.content || "",
        excerpt: fullPost.excerpt,
        coverImage: fullPost.coverImage,
        status: newStatus,
        tags: fullPost.tags.map((t) => t.name),
      });

      const postsResponse = await api.getPosts({
        limit: 50,
        includeContent: false,
      });
      setPostsData(postsResponse.data);
    } catch (error) {
      console.error("Error updating post status:", error);
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    try {
      await api.deleteTag(tagId);

      const [tagsResponse, statsResponse] = await Promise.all([
        api.getTags(),
        api.getStats(),
      ]);
      setAllTags(tagsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  const handleUpdateTag = async (tagId: number, newName: string) => {
    try {
      await api.updateTag(tagId, newName);
      setEditingTag(null);

      const tagsResponse = await api.getTags();
      setAllTags(tagsResponse.data);
    } catch (error) {
      console.error("Error updating tag:", error);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      await api.createTag(newTagName);
      setNewTagName("");

      const [tagsResponse, statsResponse] = await Promise.all([
        api.getTags(),
        api.getStats(),
      ]);
      setAllTags(tagsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  const filteredPosts =
    postsData?.posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || post.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-balance">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your blog posts, tags, and content
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/blog">
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  View Blog
                </Button>
              </Link>
              <Link href="/editor">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Posts
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPosts}</div>
                  <p className="text-xs text-muted-foreground">
                    All posts in your blog
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Published
                  </CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.publishedPosts}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Live on your blog
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                  <FileX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.draftPosts}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Work in progress
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tags</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTags}</div>
                  <p className="text-xs text-muted-foreground">
                    Content categories
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Posts Management</CardTitle>
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted rounded animate-pulse"
                  ></div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first blog post to get started"}
                </p>
                <Link href="/editor">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-balance">
                            {post.title}
                          </div>
                          {post.excerpt && (
                            <div className="text-sm w-[0.5] text-muted-foreground text-pretty line-clamp-2">
                              {post.excerpt}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            post.status === "PUBLISHED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(post.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(post.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/blog/${post.slug}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Post
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/edit/${post.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Post
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(
                                  post.id,
                                  post.status === "PUBLISHED"
                                    ? "DRAFT"
                                    : "PUBLISHED"
                                )
                              }
                            >
                              {post.status === "PUBLISHED" ? (
                                <>
                                  <FileX className="mr-2 h-4 w-4" />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <Globe className="mr-2 h-4 w-4" />
                                  Publish
                                </>
                              )}
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Post
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Post
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;
                                    {post.title}&quot;? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePost(post.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags Management
              </CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="New tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                  className="w-48"
                />
                <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tagsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-muted rounded animate-pulse"
                  ></div>
                ))}
              </div>
            ) : allTags.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No tags created yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first tag to organize your content
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allTags.map((tag) => (
                  <Card
                    key={tag.id}
                    className="group hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {editingTag?.id === tag.id ? (
                            <div className="space-y-2">
                              <Input
                                value={editingTag.name}
                                onChange={(e) =>
                                  setEditingTag({
                                    ...editingTag,
                                    name: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleUpdateTag(tag.id, editingTag.name);
                                  } else if (e.key === "Escape") {
                                    setEditingTag(null);
                                  }
                                }}
                                className="text-sm"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateTag(tag.id, editingTag.name)
                                  }
                                  disabled={!editingTag.name.trim()}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingTag(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="font-medium text-balance">
                                #{tag.name}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {tag._count.posts} post
                                {tag._count.posts !== 1 ? "s" : ""}
                              </div>
                            </>
                          )}
                        </div>
                        {editingTag?.id !== tag.id && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setEditingTag({ id: tag.id, name: tag.name })
                              }
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {tag._count.posts === 0 ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Tag
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the tag
                                      &quot;{tag.name}&quot;? This action cannot
                                      be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteTag(tag.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled
                                className="text-muted-foreground cursor-not-allowed"
                                title={`Cannot delete: ${
                                  tag._count.posts
                                } post${
                                  tag._count.posts !== 1 ? "s" : ""
                                } using this tag`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Content Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Average tags per post
                  </span>
                  <span className="font-medium">
                    {stats.totalPosts > 0
                      ? (
                          allTags.reduce(
                            (sum, tag) => sum + tag._count.posts,
                            0
                          ) / stats.totalPosts
                        ).toFixed(1)
                      : "0"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Most used tags
                  </span>
                  <span className="font-medium">
                    {allTags.length > 0
                      ? Math.max(...allTags.map((t) => t._count.posts))
                      : 0}{" "}
                    posts
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Unused tags
                  </span>
                  <span className="font-medium text-orange-600">
                    {allTags.filter((t) => t._count.posts === 0).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {post.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(post.updatedAt)}
                      </div>
                    </div>
                    <Badge
                      variant={
                        post.status === "PUBLISHED" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {post.status}
                    </Badge>
                  </div>
                ))}
                {filteredPosts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
