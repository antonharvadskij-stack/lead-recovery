import { useEffect, useRef } from "react";

export default function GameCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let game: any = null;
    let cancelled = false;
    (async () => {
      const [{ default: P0, ...PhaserNS }, { createGameConfig }, { BootScene }, { PreloadScene }, { GameScene }, { UIScene }] = await Promise.all([
        import("phaser"),
        import("@/game/config"),
        import("@/game/scenes/BootScene"),
        import("@/game/scenes/PreloadScene"),
        import("@/game/scenes/GameScene"),
        import("@/game/scenes/UIScene"),
      ]);
      const P = P0 ?? (PhaserNS as any);
      if (cancelled || !ref.current) return;
      const config: any = createGameConfig(ref.current);
      config.type = P.AUTO;
      config.scale = { mode: P.Scale.FIT, autoCenter: P.Scale.CENTER_BOTH };
      config.scene = [BootScene, PreloadScene, GameScene, UIScene];
      game = new P.Game(config);
    })();
    return () => { cancelled = true; game?.destroy(true); };
  }, []);
  return <div ref={ref} className="h-full w-full" />;
}
