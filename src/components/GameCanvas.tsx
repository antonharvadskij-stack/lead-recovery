import { useEffect, useRef } from "react";
import type Phaser from "phaser";

/** Монтирует Phaser только в браузере (динамический импорт — без SSR). */
export default function GameCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let game: Phaser.Game | null = null;
    let cancelled = false;
    (async () => {
      const [{ default: P }, { createGameConfig }] = await Promise.all([import("phaser"), import("@/game/config")]);
      if (cancelled || !ref.current) return;
      game = new P.Game(createGameConfig(ref.current));
    })();
    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, []);
  return <div ref={ref} className="h-full w-full" />;
}