"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Card as CardType, Column as ColumnType } from "@/lib/types";
import Card from "./Card";
import AddCardForm from "./AddCardForm";

type ColumnProps = {
  column: ColumnType;
  cards: CardType[];
  onRename: (columnId: string, title: string) => void;
  onAddCard: (columnId: string, title: string, description: string) => void;
  onDeleteCard: (cardId: string) => void;
};

export default function Column({
  column,
  cards,
  onRename,
  onAddCard,
  onDeleteCard,
}: ColumnProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(column.title);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  function commit() {
    const trimmed = title.trim();
    if (trimmed) {
      onRename(column.id, trimmed);
    } else {
      setTitle(column.title);
    }
    setEditing(false);
  }

  return (
    <section
      className={`flex h-full w-72 shrink-0 flex-col rounded-xl transition-colors ${
        isOver ? "bg-accent/5 ring-2 ring-accent/40" : "bg-surface/60"
      }`}
    >
      <header className="flex items-center justify-between px-3 pb-2 pt-3">
        {editing ? (
          <input
            autoFocus
            aria-label="Column title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setTitle(column.title);
                setEditing(false);
              }
            }}
            className="w-full rounded border border-accent bg-surface px-1 py-0.5 text-sm font-semibold text-foreground outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 rounded px-1 py-0.5 text-sm font-semibold text-foreground transition hover:bg-border/50"
          >
            {column.title}
            <span className="rounded-full bg-border px-1.5 text-xs font-medium text-muted">
              {cards.length}
            </span>
          </button>
        )}
      </header>

      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2"
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <Card key={card.id} card={card} onDelete={onDeleteCard} />
          ))}
        </SortableContext>
      </div>

      <div className="px-2 pb-2">
        <AddCardForm onAdd={(t, d) => onAddCard(column.id, t, d)} />
      </div>
    </section>
  );
}
