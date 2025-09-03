"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TagInput from "@/app/components/editor/ui/TagInput";
import { api } from "@/lib/api";
import type { tags, posts } from "@prisma/client";
import type { PostCreateBody } from "@/types/post";
import { ArrowLeft, Save, Eye } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type PostWithTags = posts & { tags: tags[] };

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<PostWithTags | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [postTags, setPostTags] = useState<string[]>([]);

  const postId = Number.parseInt(params.id as string);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.getPost(postId);
        const postData = response.data;

        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content);
        setExcerpt(postData.excerpt || "");
        setCoverImage(postData.coverImage || "");
        setStatus(postData.status);
        setPostTags(postData.tags.map((tag) => tag.name));
      } catch (error) {
        console.error("Error fetching post:", error);
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, router]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const updateData: PostCreateBody = {
        title,
        content,
        excerpt,
        coverImage,
        status,
        tags: postTags,
      };

      await api.updatePost(postId, updateData);
      router.push("/admin");
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-32"></div>
            <div className="h-12 bg-muted rounded w-3/4"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <Link href="/admin">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Admin
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Edit Post</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="mr-2 h-4 w-4" />
                {previewMode ? "Edit" : "Preview"}
              </Button>
              <Button onClick={handleSave} disabled={saving || !title.trim()}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {previewMode ? (
          <div className="max-w-4xl mx-auto">
            <article className="space-y-6">
              <header className="text-center space-y-4">
                <h1 className="text-4xl font-black text-balance">
                  {title || "Untitled Post"}
                </h1>
                {excerpt && (
                  <p className="text-xl text-muted-foreground text-pretty">
                    {excerpt}
                  </p>
                )}
                {postTags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {postTags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {coverImage && (
                <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                  <img
                    src={coverImage || "/placeholder.svg"}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-black mt-8 mb-4 text-balance">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-black mt-6 mb-3 text-balance">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-black mt-5 mb-2 text-balance">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-pretty leading-relaxed mb-4">
                        {children}
                      </p>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary pl-6 italic bg-muted/50 py-4 my-6 rounded-r-lg">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {content || "*No content yet*"}
                </ReactMarkdown>
              </div>
            </article>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Status
                    </label>
                    <Select
                      value={status}
                      onValueChange={(value: "DRAFT" | "PUBLISHED") =>
                        setStatus(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Title</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Enter post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-medium py-3"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Write your post content in Markdown..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-96 font-mono"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Excerpt</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter a short excerpt (optional, max 500 characters)..."
                  value={excerpt}
                  onChange={(e) => {
                    if (e.target.value.length <= 500)
                      setExcerpt(e.target.value);
                  }}
                  className="h-24"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {excerpt.length} / 500 characters
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cover Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter cover image URL..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
                {coverImage && (
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <img
                      src={coverImage || "/placeholder.svg"}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <TagInput tags={postTags} setTags={setPostTags} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
