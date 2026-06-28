"use client";

import { useState } from "react";

type AddCardFormProps = {
  onAdd: (title: string, description: string) => void;
};

export default function AddCardForm({ onAdd }: AddCardFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function reset() {
    setTitle("");
    setDescription("");
    setOpen(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, description.trim());
    reset();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-muted transition hover:bg-border/50 hover:text-foreground"
      >
        <span className="text-base leading-none">+</span> Add a card
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-border bg-surface p-2 shadow-sm"
    >
      <input
        autoFocus
        aria-label="Card title"
        placeholder="Card title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded border-none bg-transparent px-1 py-1 text-sm font-medium text-foreground outline-none placeholder:text-muted"
      />
      <textarea
        aria-label="Card description"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="mt-1 w-full resize-none rounded border-none bg-transparent px-1 py-1 text-xs text-muted outline-none placeholder:text-muted"
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="submit"
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          Add card
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-md px-2 py-1.5 text-sm text-muted transition hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
