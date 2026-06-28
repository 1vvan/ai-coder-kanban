"use client";

import { useCallback, useState } from "react";
import type { BoardState, Card } from "./types";
import { createInitialState } from "./seed";

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `card-${idCounter}-${idCounter * 7 + 3}`;
}

export function addCard(
  state: BoardState,
  columnId: string,
  title: string,
  description: string,
): BoardState {
  const card: Card = { id: nextId(), columnId, title, description };
  return { ...state, cards: [...state.cards, card] };
}

export function deleteCard(state: BoardState, cardId: string): BoardState {
  return { ...state, cards: state.cards.filter((c) => c.id !== cardId) };
}

export function renameColumn(
  state: BoardState,
  columnId: string,
  title: string,
): BoardState {
  return {
    ...state,
    columns: state.columns.map((col) =>
      col.id === columnId ? { ...col, title } : col,
    ),
  };
}

/**
 * Move a card so it lands at `overId`. `overId` is either another card (drop
 * before it) or a column id (append to that column).
 */
export function moveCard(
  state: BoardState,
  activeId: string,
  overId: string,
): BoardState {
  if (activeId === overId) return state;

  const active = state.cards.find((c) => c.id === activeId);
  if (!active) return state;

  const overColumn = state.columns.find((c) => c.id === overId);
  const overCard = state.cards.find((c) => c.id === overId);
  const targetColumnId = overColumn ? overColumn.id : overCard?.columnId;
  if (!targetColumnId) return state;

  const without = state.cards.filter((c) => c.id !== activeId);
  const moved: Card = { ...active, columnId: targetColumnId };

  if (overColumn) {
    return { ...state, cards: [...without, moved] };
  }

  const index = without.findIndex((c) => c.id === overId);
  const next = [...without];
  next.splice(index, 0, moved);
  return { ...state, cards: next };
}

export function cardsForColumn(state: BoardState, columnId: string): Card[] {
  return state.cards.filter((c) => c.columnId === columnId);
}

export function useBoard() {
  const [state, setState] = useState<BoardState>(createInitialState);

  return {
    state,
    addCard: useCallback(
      (columnId: string, title: string, description: string) =>
        setState((s) => addCard(s, columnId, title, description)),
      [],
    ),
    deleteCard: useCallback(
      (cardId: string) => setState((s) => deleteCard(s, cardId)),
      [],
    ),
    renameColumn: useCallback(
      (columnId: string, title: string) =>
        setState((s) => renameColumn(s, columnId, title)),
      [],
    ),
    moveCard: useCallback(
      (activeId: string, overId: string) =>
        setState((s) => moveCard(s, activeId, overId)),
      [],
    ),
  };
}
