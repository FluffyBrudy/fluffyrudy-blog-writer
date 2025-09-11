import React, { useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { history, undo, redo } from "@codemirror/commands";
import { keymap } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { autocompletion } from "@codemirror/autocomplete";
import type {
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";

const latexCompletions = [
  { label: "\\alpha", type: "keyword", info: "Greek α" },
  { label: "\\beta", type: "keyword", info: "Greek β" },
  { label: "\\times", type: "keyword", info: "Cross product ×" },
  { label: "\\subseteq", type: "keyword", info: "Subset or equal ⊆" },
  { label: "\\mathbb{R}", type: "keyword", info: "Set of real numbers ℝ" },
  { label: "alignedat", type: "keyword", info: "indentation and alignment" },
];

const keymapping = [
  { key: "Mod-z", run: undo },
  { key: "Mod-y", run: redo },
  { key: "Mod-Shift-z", run: redo },
];

const latexCompletionSource = (
  context: CompletionContext
): CompletionResult | null => {
  const word = context.matchBefore(/\\\w*/);
  if (!word) return null;

  return {
    from: word.from,
    options: latexCompletions,
  };
};
type MarkdownEditorProps = {
  content: string;
  onChange: (val: string) => void;
};

export default function MarkdownEditor({
  content,
  onChange,
}: MarkdownEditorProps) {
  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  const theme = localStorage.getItem("theme") === "dark" ? "dark" : "light";

  return (
    <CodeMirror
      value={content}
      height="400px"
      basicSetup={{ lineNumbers: true }}
      extensions={[
        markdown(),
        history(),
        autocompletion({ override: [latexCompletionSource] }),
        keymap.of(keymapping),
      ]}
      onChange={handleChange}
      theme={theme}
      style={{ fontFamily: "monospace", fontSize: 14 }}
    />
  );
}
