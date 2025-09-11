"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import TagInput from "./ui/TagInput";
import type { PostCreateBody } from "@/types/post";
import { api } from "@/lib/api";
import {
  Save,
  Eye,
  FileText,
  ImageIcon,
  Tag,
  Settings,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import "katex/dist/katex.min.css";
import { MarkdownPreview } from "./markdown-preview";
interface AutoSaveStatus {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved?: Date;
}

export default function PostEditor() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");

  const [activeTab, setActiveTab] = useState("write");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSave, setAutoSave] = useState<AutoSaveStatus>({ status: "idle" });
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  const saveToLocalStorage = useCallback(() => {
    const draftData = {
      title,
      content,
      excerpt,
      coverImage,
      tags,
      status,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("blog-draft", JSON.stringify(draftData));
    setAutoSave({ status: "saved", lastSaved: new Date() });
  }, [title, content, excerpt, coverImage, tags, status]);

  useEffect(() => {
    const savedDraft = localStorage.getItem("blog-draft");
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setTitle(draftData.title || "");
        setContent(draftData.content || "");
        setExcerpt(draftData.excerpt || "");
        setCoverImage(draftData.coverImage || "");
        setTags(draftData.tags || []);
        setStatus(draftData.status || "DRAFT");
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (title || content || excerpt) {
      setAutoSave({ status: "saving" });
      const timeoutId = setTimeout(() => {
        saveToLocalStorage();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [title, content, excerpt, coverImage, tags, saveToLocalStorage]);

  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200));
  }, [content]);

  const handleSubmit = async (publishStatus: "DRAFT" | "PUBLISHED") => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const post: PostCreateBody = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || null,
        coverImage: coverImage.trim() || null,
        tags,
        status: publishStatus,
      };

      await api.createPost(post);

      localStorage.removeItem("blog-draft");

      if (publishStatus === "PUBLISHED") {
        router.push("/blog");
      } else {
        router.push("/admin");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setAutoSave({ status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim().length > 0 && content.trim().length >= 20;

  const AutoSaveIndicator = () => {
    switch (autoSave.status) {
      case "saving":
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3 animate-spin" />
            Saving...
          </div>
        );
      case "saved":
        return (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-3 w-3" />
            Saved {autoSave.lastSaved?.toLocaleTimeString()}
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-3 w-3" />
            Save failed
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-black">Create New Post</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{wordCount} words</span>
                  <span>{readingTime} min read</span>
                  <AutoSaveIndicator />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={status}
                onValueChange={(value: "DRAFT" | "PUBLISHED") =>
                  setStatus(value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => handleSubmit("DRAFT")}
                disabled={!isFormValid || isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>

              <Button
                onClick={() => handleSubmit(status)}
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting
                  ? "Publishing..."
                  : status === "PUBLISHED"
                  ? "Publish"
                  : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Input
                  placeholder="Enter your post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-black border-0 px-0 py-4 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
              </CardContent>
            </Card>

            <Card>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="write"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Write
                    </TabsTrigger>
                    <TabsTrigger
                      value="preview"
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent>
                  <TabsContent value="write" className="mt-0">
                    <Textarea
                      placeholder="Write your post content in Markdown..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-96 font-mono text-base resize-none border-0 px-0 focus-visible:ring-0"
                    />
                  </TabsContent>

                  <TabsContent value="preview" className="mt-0">
                    <div className="min-h-96 prose prose-invert dark:prose-invert max-w-none">
                      <MarkdownPreview
                        content={content || "write something for preview"}
                      />
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Post Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Status
                  </label>
                  <Badge
                    variant={status === "PUBLISHED" ? "default" : "secondary"}
                  >
                    {status}
                  </Badge>
                </div>

                <Separator />

                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Words:</span>
                    <span className="font-medium">{wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reading time:</span>
                    <span className="font-medium">{readingTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Characters:</span>
                    <span className="font-medium">{content.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Excerpt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Write a short excerpt (optional)..."
                  value={excerpt}
                  onChange={(e) => {
                    if (e.target.value.length <= 500)
                      setExcerpt(e.target.value);
                  }}
                  className="h-24 resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {excerpt.length} / 500 characters
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Cover Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter image URL..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
                {coverImage && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image
                      fill
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
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TagInput tags={tags} setTags={setTags} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
