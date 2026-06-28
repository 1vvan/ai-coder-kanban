"use client";

import { useEffect, useRef, useState } from "react";
import {
  fetchChatHistory,
  sendChat,
  type ChatMsg,
} from "@/lib/api";
import type { BoardState } from "@/lib/types";

export default function Chat({
  onBoardUpdate,
}: {
  onBoardUpdate: (board: BoardState) => void;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatHistory().then(setMessages);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    try {
      const { reply, board } = await sendChat(text);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      onBoardUpdate(board);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Something went wrong. Try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-surface">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
        <p className="text-xs text-muted">Ask me to update your board</p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-xs text-muted">
            Try: &ldquo;Add a card to To Do called Plan sprint&rdquo;
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <span
              className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-accent text-white"
                  : "bg-background text-foreground"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
        {sending && <p className="text-xs text-muted">Thinking...</p>}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="border-t border-border p-3">
        <div className="flex gap-2">
          <input
            aria-label="Chat message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message..."
            className="flex-1 rounded-md border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </form>
    </aside>
  );
}
