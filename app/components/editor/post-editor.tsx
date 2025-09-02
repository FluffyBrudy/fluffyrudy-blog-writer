"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PostEditor() {
  const [content, setContent] = useState<string>("");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <div className="flex flex-col border rounded-2xl shadow bg-card">
        <div className="px-4 py-2 border-b font-semibold text-sm text-muted-foreground">
          Write
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your blog post in Markdown..."
          className="flex-1 resize-none p-4 bg-transparent focus:outline-none font-mono text-sm"
          rows={20}
        />
      </div>

      <div className="flex flex-col border rounded-2xl shadow bg-card">
        <div className="px-4 py-2 border-b font-semibold text-sm text-muted-foreground">
          Preview
        </div>
        <article className="prose prose-slate lg:prose-lg dark:prose-invert max-w-none p-4">
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">
              Start writing to see preview…
            </p>
          )}
        </article>
      </div>
    </div>
  );
}
