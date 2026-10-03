import { createFileRoute } from "@tanstack/react-router";
import GameCanvas from "@/components/GameCanvas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEVERENDING — выживание на острове" },
      { name: "description", content: "NEVERENDING: выживите на острове-арене против бесконечных волн врагов." },
      { property: "og:title", content: "NEVERENDING — выживание на острове" },
      { property: "og:description", content: "Выживите на острове-арене против бесконечных волн врагов." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="game-root">
      <GameCanvas />
      <div className="rotate-hint">Поверните устройство горизонтально</div>
    </main>
  );
}