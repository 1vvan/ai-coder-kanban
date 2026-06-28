"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType } from "@/lib/types";

type CardProps = {
  card: CardType;
  onDelete: (cardId: string) => void;
};

export default function Card({ card, onDelete }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: "card", card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative cursor-grab touch-none rounded-lg border border-border bg-surface p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing"
    >
      <button
        type="button"
        aria-label="Delete card"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onDelete(card.id)}
        className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded text-muted transition hover:bg-rose-50 hover:text-danger group-hover:flex"
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
      <h3 className="pr-6 text-sm font-medium text-foreground">{card.title}</h3>
      {card.description && (
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {card.description}
        </p>
      )}
    </div>
  );
}
