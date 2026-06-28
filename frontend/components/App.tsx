"use client";

import { useEffect, useState } from "react";
import { getMe, logout } from "@/lib/api";
import { useBoard } from "@/lib/useBoard";
import Board from "./Board";
import Chat from "./Chat";
import Login from "./Login";

type AuthState = "loading" | "out" | "in";

export default function App() {
  const [auth, setAuth] = useState<AuthState>("loading");

  useEffect(() => {
    getMe().then((user) => setAuth(user ? "in" : "out"));
  }, []);

  async function handleLogout() {
    await logout();
    setAuth("out");
  }

  if (auth === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (auth === "out") {
    return <Login onSuccess={() => setAuth("in")} />;
  }

  return <BoardView onLogout={handleLogout} />;
}

function BoardView({ onLogout }: { onLogout: () => void }) {
  const board = useBoard();

  return (
    <main className="flex h-screen">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold text-foreground">
            Kanban Board
          </h1>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted transition hover:text-foreground"
          >
            Log out
          </button>
        </header>
        <div className="min-h-0 flex-1">
          <Board board={board} />
        </div>
      </div>
      <Chat onBoardUpdate={board.setBoard} />
    </main>
  );
}
