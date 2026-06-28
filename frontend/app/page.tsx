import Board from "@/components/Board";

export default function Home() {
  return (
    <main className="flex h-screen flex-col">
      <header className="px-6 py-4">
        <h1 className="text-xl font-semibold text-foreground">Kanban Board</h1>
      </header>
      <div className="min-h-0 flex-1">
        <Board />
      </div>
    </main>
  );
}
