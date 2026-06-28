"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType } from "@/lib/types";

type CardProps = {
  card: CardType;
  onDelete: (cardId: string) => void;
  onEdit: (cardId: string, title: string, description: string) => void;
};

export default function Card({ card, onDelete, onEdit }: CardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: "card", card }, disabled: editing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  function save(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onEdit(card.id, trimmed, description.trim());
    setEditing(false);
  }

  function cancel() {
    setTitle(card.title);
    setDescription(card.description);
    setEditing(false);
  }

  if (editing) {
    return (
      <form
        onSubmit={save}
        className="rounded-lg border border-accent bg-surface p-2 shadow-sm"
      >
        <input
          autoFocus
          aria-label="Edit card title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border-none bg-transparent px-1 py-1 text-sm font-medium text-foreground outline-none"
        />
        <textarea
          aria-label="Edit card description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full resize-none rounded border-none bg-transparent px-1 py-1 text-xs text-muted outline-none"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            Save
          </button>
          <button
            type="button"
            onClick={cancel}
            className="rounded-md px-2 py-1.5 text-sm text-muted transition hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative cursor-grab touch-none rounded-lg border border-border bg-surface p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing"
    >
      <div className="absolute right-2 top-2 hidden items-center gap-1 group-hover:flex">
        <button
          type="button"
          aria-label="Edit card"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setEditing(true)}
          className="flex h-6 w-6 items-center justify-center rounded text-muted transition hover:bg-border/60 hover:text-foreground"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Delete card"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(card.id)}
          className="flex h-6 w-6 items-center justify-center rounded text-muted transition hover:bg-rose-50 hover:text-danger"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          </svg>
        </button>
      </div>
      <h3 className="pr-12 text-sm font-medium text-foreground">{card.title}</h3>
      {card.description && (
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {card.description}
        </p>
      )}
    </div>
  );
}
