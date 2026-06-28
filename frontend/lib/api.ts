import type { BoardState } from "./types";

export async function getMe(): Promise<string | null> {
  const res = await fetch("/api/me");
  if (!res.ok) return null;
  const data = await res.json();
  return data.username as string;
}

export async function login(
  username: string,
  password: string,
): Promise<boolean> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.ok;
}

export async function logout(): Promise<void> {
  await fetch("/api/logout", { method: "POST" });
}

export async function fetchBoard(): Promise<BoardState> {
  const res = await fetch("/api/board");
  if (!res.ok) throw new Error("Failed to load board");
  return res.json();
}

export async function saveBoard(board: BoardState): Promise<void> {
  const res = await fetch("/api/board", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(board),
  });
  if (!res.ok) throw new Error("Failed to save board");
}
