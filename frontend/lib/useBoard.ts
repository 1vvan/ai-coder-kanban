"use client";

import { useCallback, useEffect, useState } from "react";
import type { BoardState, Card } from "./types";
import { fetchBoard, saveBoard } from "./api";

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

export function editCard(
  state: BoardState,
  cardId: string,
  title: string,
  description: string,
): BoardState {
  return {
    ...state,
    cards: state.cards.map((c) =>
      c.id === cardId ? { ...c, title, description } : c,
    ),
  };
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
  const [state, setState] = useState<BoardState | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchBoard()
      .then(setState)
      .catch(() => setError(true));
  }, []);

  // Apply a pure mutation optimistically, then persist. On failure, reload
  // from the server to reconcile.
  const mutate = useCallback((fn: (s: BoardState) => BoardState) => {
    setState((current) => {
      if (!current) return current;
      const next = fn(current);
      saveBoard(next).catch(() => {
        setError(true);
        fetchBoard()
          .then(setState)
          .catch(() => {});
      });
      return next;
    });
  }, []);

  // Replace board state directly (e.g. with a board returned by the AI chat).
  const setBoard = useCallback((board: BoardState) => setState(board), []);

  return {
    state,
    loading: state === null && !error,
    error,
    setBoard,
    addCard: useCallback(
      (columnId: string, title: string, description: string) =>
        mutate((s) => addCard(s, columnId, title, description)),
      [mutate],
    ),
    deleteCard: useCallback(
      (cardId: string) => mutate((s) => deleteCard(s, cardId)),
      [mutate],
    ),
    editCard: useCallback(
      (cardId: string, title: string, description: string) =>
        mutate((s) => editCard(s, cardId, title, description)),
      [mutate],
    ),
    renameColumn: useCallback(
      (columnId: string, title: string) =>
        mutate((s) => renameColumn(s, columnId, title)),
      [mutate],
    ),
    moveCard: useCallback(
      (activeId: string, overId: string) =>
        mutate((s) => moveCard(s, activeId, overId)),
      [mutate],
    ),
  };
}
