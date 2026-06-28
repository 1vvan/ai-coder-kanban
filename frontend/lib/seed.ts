import type { BoardState } from "./types";

export const COLUMN_IDS = [
  "backlog",
  "todo",
  "in-progress",
  "review",
  "done",
] as const;

export function createInitialState(): BoardState {
  return {
    columns: [
      { id: "backlog", title: "Backlog" },
      { id: "todo", title: "To Do" },
      { id: "in-progress", title: "In Progress" },
      { id: "review", title: "Review" },
      { id: "done", title: "Done" },
    ],
    cards: [
      {
        id: "c1",
        columnId: "backlog",
        title: "Research competitors",
        description: "Survey similar tools and note key features.",
      },
      {
        id: "c2",
        columnId: "backlog",
        title: "Define MVP scope",
        description: "List the minimum features needed for launch.",
      },
      {
        id: "c3",
        columnId: "todo",
        title: "Design board layout",
        description: "Sketch the columns and card structure.",
      },
      {
        id: "c4",
        columnId: "in-progress",
        title: "Set up project",
        description: "Scaffold the app and install dependencies.",
      },
      {
        id: "c5",
        columnId: "review",
        title: "Color palette",
        description: "Review the indigo and slate theme.",
      },
      {
        id: "c6",
        columnId: "done",
        title: "Pick a framework",
        description: "Decided on Next.js with the App Router.",
      },
    ],
  };
}
