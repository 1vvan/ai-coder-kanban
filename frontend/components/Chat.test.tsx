import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Chat from "./Chat";
import * as api from "@/lib/api";

vi.mock("@/lib/api");

const board = { columns: [], cards: [] };

beforeEach(() => {
  vi.mocked(api.fetchChatHistory).mockResolvedValue([]);
});

describe("Chat", () => {
  it("renders history on mount", async () => {
    vi.mocked(api.fetchChatHistory).mockResolvedValue([
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello!" },
    ]);
    render(<Chat onBoardUpdate={() => {}} />);
    expect(await screen.findByText("hello!")).toBeInTheDocument();
  });

  it("sends a message and shows the reply", async () => {
    vi.mocked(api.sendChat).mockResolvedValue({ reply: "Done!", board });
    render(<Chat onBoardUpdate={() => {}} />);

    fireEvent.change(screen.getByLabelText("Chat message"), {
      target: { value: "add a card" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("add a card")).toBeInTheDocument();
    expect(await screen.findByText("Done!")).toBeInTheDocument();
  });

  it("calls onBoardUpdate with the returned board", async () => {
    const updated = {
      columns: [{ id: "todo", title: "To Do" }],
      cards: [],
    };
    vi.mocked(api.sendChat).mockResolvedValue({
      reply: "ok",
      board: updated,
    });
    const onBoardUpdate = vi.fn();
    render(<Chat onBoardUpdate={onBoardUpdate} />);

    fireEvent.change(screen.getByLabelText("Chat message"), {
      target: { value: "do it" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(onBoardUpdate).toHaveBeenCalledWith(updated));
  });
});
