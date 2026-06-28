import { describe, it, expect } from "vitest";
import {
  addCard,
  deleteCard,
  editCard,
  renameColumn,
  moveCard,
  cardsForColumn,
} from "./useBoard";
import { createInitialState } from "./seed";

describe("seed", () => {
  it("has 5 columns and at least one card each in seeded columns", () => {
    const s = createInitialState();
    expect(s.columns).toHaveLength(5);
    expect(s.cards.length).toBeGreaterThan(0);
    for (const card of s.cards) {
      expect(s.columns.some((c) => c.id === card.columnId)).toBe(true);
    }
  });
});

describe("addCard", () => {
  it("appends a card to the target column", () => {
    const s = createInitialState();
    const next = addCard(s, "todo", "New task", "Some detail");
    expect(next.cards).toHaveLength(s.cards.length + 1);
    const added = cardsForColumn(next, "todo").at(-1)!;
    expect(added.title).toBe("New task");
    expect(added.description).toBe("Some detail");
    expect(added.columnId).toBe("todo");
  });

  it("assigns unique ids", () => {
    let s = createInitialState();
    s = addCard(s, "todo", "A", "");
    s = addCard(s, "todo", "B", "");
    const ids = s.cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("does not mutate the original state", () => {
    const s = createInitialState();
    const before = s.cards.length;
    addCard(s, "todo", "X", "");
    expect(s.cards).toHaveLength(before);
  });
});

describe("deleteCard", () => {
  it("removes the card", () => {
    const s = createInitialState();
    const target = s.cards[0].id;
    const next = deleteCard(s, target);
    expect(next.cards.find((c) => c.id === target)).toBeUndefined();
    expect(next.cards).toHaveLength(s.cards.length - 1);
  });

  it("is a no-op for unknown id", () => {
    const s = createInitialState();
    const next = deleteCard(s, "nope");
    expect(next.cards).toHaveLength(s.cards.length);
  });
});

describe("editCard", () => {
  it("updates title and description of the matching card only", () => {
    const s = createInitialState();
    const target = s.cards[0];
    const next = editCard(s, target.id, "New title", "New desc");
    const edited = next.cards.find((c) => c.id === target.id)!;
    expect(edited.title).toBe("New title");
    expect(edited.description).toBe("New desc");
    // Other cards untouched.
    expect(next.cards[1]).toEqual(s.cards[1]);
    // Column membership unchanged.
    expect(edited.columnId).toBe(target.columnId);
  });
});

describe("renameColumn", () => {
  it("renames the matching column only", () => {
    const s = createInitialState();
    const next = renameColumn(s, "todo", "Up Next");
    expect(next.columns.find((c) => c.id === "todo")!.title).toBe("Up Next");
    expect(next.columns.find((c) => c.id === "backlog")!.title).toBe("Backlog");
  });
});

describe("moveCard", () => {
  it("moves a card to another column when dropped on the column", () => {
    const s = createInitialState();
    const card = cardsForColumn(s, "backlog")[0];
    const next = moveCard(s, card.id, "done");
    expect(next.cards.find((c) => c.id === card.id)!.columnId).toBe("done");
    expect(cardsForColumn(next, "done").at(-1)!.id).toBe(card.id);
  });

  it("reorders within a column when dropped on another card", () => {
    let s = createInitialState();
    s = addCard(s, "todo", "first", "");
    s = addCard(s, "todo", "second", "");
    const col = cardsForColumn(s, "todo");
    const a = col[col.length - 1]; // second
    const b = col[col.length - 2]; // first
    const next = moveCard(s, a.id, b.id);
    const order = cardsForColumn(next, "todo").map((c) => c.title);
    expect(order.indexOf("second")).toBeLessThan(order.indexOf("first"));
  });

  it("moves across columns when dropped on a card in another column", () => {
    const s = createInitialState();
    const fromCard = cardsForColumn(s, "backlog")[0];
    const toCard = cardsForColumn(s, "review")[0];
    const next = moveCard(s, fromCard.id, toCard.id);
    expect(next.cards.find((c) => c.id === fromCard.id)!.columnId).toBe(
      "review",
    );
  });

  it("is a no-op when source equals target", () => {
    const s = createInitialState();
    const id = s.cards[0].id;
    const next = moveCard(s, id, id);
    expect(next).toBe(s);
  });

  it("ignores unknown active id", () => {
    const s = createInitialState();
    const next = moveCard(s, "nope", "done");
    expect(next).toBe(s);
  });
});
