import { validateTags } from "@/lib/editor.helper";
import React, { useState, KeyboardEvent, useEffect } from "react";

interface ITagStatus {
  valid: string[];
  invalid: string[];
}

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

/**
 * TagInput is a controlled component that accepts tags separated by spaces or Enter.
 * It validates tags on add and shows invalid tags visually.
 * Removes duplicates and trims whitespace.
 */
export default function TagInput({ tags, setTags }: TagInputProps) {
  const [input, setInput] = useState("");
  const [invalidTags, setInvalidTags] = useState<string[]>([]);

  const addTagsFromInput = (rawInput: string) => {
    const splitted = rawInput
      .split(/\s+/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    if (splitted.length === 0) return;

    const combined = [...tags, ...splitted];
    const uniqueTags = Array.from(new Set(combined));

    const { valid, invalid } = validateTags(uniqueTags);

    setTags(valid);
    setInvalidTags(invalid);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (input.trim()) {
        addTagsFromInput(input);
        setInput("");
      }
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      const newTags = tags.slice(0, -1);
      setTags(newTags);
      setInvalidTags((prev) => prev.filter((_, i) => i < newTags.length));
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
    setInvalidTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="w-full max-w-2xl">
      <label className="block mb-2 font-semibold">
        Tags (space or Enter separated)
      </label>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[44px] items-center">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center bg-green-200 text-green-800 rounded-full px-3 py-1 text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-2 text-green-600 hover:text-green-900 font-bold"
              aria-label={`Remove tag ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}
        {invalidTags.map((tag) => (
          <span
            key={tag}
            className="flex items-center bg-red-200 text-red-800 rounded-full px-3 py-1 text-sm font-medium"
            title="Invalid tag format"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-2 text-red-600 hover:text-red-900 font-bold"
              aria-label={`Remove invalid tag ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          className="flex-grow p-1 outline-none text-sm min-w-[120px]"
          placeholder="Add tags..."
          value={input}
          onChange={onChange}
          onKeyDown={onKeyDown}
          spellCheck={false}
          aria-label="Tag input"
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Tags must start with a letter and contain only lowercase letters,
        numbers, and hyphens.
      </p>
    </div>
  );
}
