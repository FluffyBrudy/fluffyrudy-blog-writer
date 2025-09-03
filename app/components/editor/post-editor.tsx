"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TagInput from "./ui/TagInput";
import { PostCreateBody } from "@/types/post";
import { api } from "@/lib/api";

interface TitleStepProps {
  title: string;
  setTitle: (title: string) => void;
}

function TitleStep({ title, setTitle }: TitleStepProps) {
  return (
    <div className="max-w-2xl">
      <Input
        placeholder="Enter blog title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-xl font-medium py-6"
      />
    </div>
  );
}

interface ContentStepProps {
  content: string;
  setContent: (content: string) => void;
}

function ContentStep({ content, setContent }: ContentStepProps) {
  return (
    <div className="grid grid-cols-2 gap-4 h-[calc(100vh-120px)]">
      <Textarea
        placeholder="Write your blog content in Markdown..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-full resize-none font-mono text-base p-4 border rounded-lg"
      />
      <article className="prose prose-slate dark:prose-invert w-full h-full p-6 border rounded-lg overflow-y-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content || "*Start writing...*"}
        </ReactMarkdown>
      </article>
    </div>
  );
}

interface ExcerptStepProps {
  excerpt: string;
  setExcerpt: (excerpt: string) => void;
}

function ExcerptStep({ excerpt, setExcerpt }: ExcerptStepProps) {
  return (
    <div className="max-w-2xl">
      <Textarea
        placeholder="Enter a short excerpt (max 500 characters)..."
        value={excerpt}
        onChange={(e) => {
          if (e.target.value.length <= 500) setExcerpt(e.target.value);
        }}
        className="w-full h-32 resize-none p-4 border rounded-lg"
      />
      <p className="text-sm text-slate-500 mt-1">
        {excerpt.length} / 500 characters
      </p>
    </div>
  );
}

interface CoverImageStepProps {
  coverImage: string;
  setCoverImage: (coverImage: string) => void;
}

function CoverImageStep({ coverImage, setCoverImage }: CoverImageStepProps) {
  return (
    <div className="max-w-2xl flex flex-col gap-4">
      <Input
        placeholder="Enter cover image URL..."
        value={coverImage}
        onChange={(e) => setCoverImage(e.target.value)}
        className="p-3"
      />
      {coverImage && (
        <img
          src={coverImage}
          alt="Cover preview"
          className="max-w-full max-h-60 object-contain rounded-md border"
        />
      )}
    </div>
  );
}

interface TagsStepProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

function TagsStep({ tags, setTags }: TagsStepProps) {
  return (
    <div className="max-w-2xl">
      <TagInput tags={tags} setTags={setTags} />
    </div>
  );
}

interface ReviewStepProps {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
}

function ReviewStep({
  title,
  content,
  excerpt,
  coverImage,
  tags,
}: ReviewStepProps) {
  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold">{title || "(No title yet)"}</h2>
      {coverImage && (
        <img
          src={coverImage}
          alt="Cover"
          className="max-w-full max-h-60 object-contain rounded-md border"
        />
      )}
      {excerpt && (
        <p className="italic text-slate-600 dark:text-slate-400 border-l-4 border-slate-300 pl-4">
          {excerpt}
        </p>
      )}
      <article className="prose prose-slate dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content || "(No content yet)"}
        </ReactMarkdown>
      </article>
      <div className="flex gap-2 flex-wrap">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full text-sm"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function BlogEditorWizard() {
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const next = () => setStep((s) => Math.min(s + 1, 6));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const handleSubmit = async () => {
    const post: PostCreateBody = {
      title,
      content,
      excerpt,
      coverImage,
      tags,
      status: "DRAFT",
    };
    const response = await api.createPost(post);
  };

  return (
    <main className="w-full min-h-screen flex flex-col">
      <header className="sticky top-0 bg-white dark:bg-slate-900 border-b px-6 py-4 flex items-center justify-between z-10">
        <h1 className="text-lg font-semibold">
          {step === 1 && "Step 1: Add Title"}
          {step === 2 && "Step 2: Write Content"}
          {step === 3 && "Step 3: Add Excerpt"}
          {step === 4 && "Step 4: Add Cover Image"}
          {step === 5 && "Step 5: Add Tags"}
          {step === 6 && "Step 6: Review & Submit"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" disabled={step === 1} onClick={back}>
            Back
          </Button>
          {step < 6 ? (
            <Button
              onClick={next}
              disabled={
                (step === 1 && title.trim().length === 0) ||
                (step === 2 && content.trim().length < 20)
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Post
            </Button>
          )}
        </div>
      </header>

      <section className="flex-1 p-6 overflow-auto">
        {step === 1 && <TitleStep title={title} setTitle={setTitle} />}
        {step === 2 && (
          <ContentStep content={content} setContent={setContent} />
        )}
        {step === 3 && (
          <ExcerptStep excerpt={excerpt} setExcerpt={setExcerpt} />
        )}
        {step === 4 && (
          <CoverImageStep
            coverImage={coverImage}
            setCoverImage={setCoverImage}
          />
        )}
        {step === 5 && <TagsStep tags={tags} setTags={setTags} />}
        {step === 6 && (
          <ReviewStep
            title={title}
            content={content}
            excerpt={excerpt}
            coverImage={coverImage}
            tags={tags}
          />
        )}
      </section>
    </main>
  );
}
