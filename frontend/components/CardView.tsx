import type { Card as CardType } from "@/lib/types";

/** Static card presentation used inside the drag overlay. */
export default function CardView({ card }: { card: CardType }) {
  return (
    <div className="rotate-2 cursor-grabbing rounded-lg border border-accent bg-surface p-3 shadow-lg">
      <h3 className="text-sm font-medium text-foreground">{card.title}</h3>
      {card.description && (
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {card.description}
        </p>
      )}
    </div>
  );
}
