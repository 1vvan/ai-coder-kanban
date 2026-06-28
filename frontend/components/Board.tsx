"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useBoard, cardsForColumn } from "@/lib/useBoard";
import type { Card as CardType } from "@/lib/types";
import Column from "./Column";
import CardView from "./CardView";

export default function Board() {
  const {
    state,
    loading,
    error,
    addCard,
    deleteCard,
    editCard,
    renameColumn,
    moveCard,
  } = useBoard();
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    const card = event.active.data.current?.card as CardType | undefined;
    setActiveCard(card ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;
    moveCard(String(active.id), String(over.id));
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted">Loading board...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-danger">Failed to load board. Please refresh.</p>
      </div>
    );
  }

  return (
    <DndContext
      id="board"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveCard(null)}
    >
      <div className="flex h-full gap-4 overflow-x-auto px-6 pb-6">
        {state.columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            cards={cardsForColumn(state, column.id)}
            onRename={renameColumn}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onEditCard={editCard}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCard ? <CardView card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
