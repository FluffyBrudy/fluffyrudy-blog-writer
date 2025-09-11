"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  className = "",
}) => {
  return (
    <div
      className={`prose prose-lg prose-slate dark:prose-invert max-w-none ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
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
            <p className="text-pretty leading-relaxed mb-4">{children}</p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-6 italic bg-muted/50 py-4 my-6 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-6">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
