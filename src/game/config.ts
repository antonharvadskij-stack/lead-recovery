import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { GameScene } from "./scenes/GameScene";
import { UIScene } from "./scenes/UIScene";

/** Базовое «дизайн-разрешение» (альбомная ориентация). Phaser масштабирует его под экран. */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
/** Размер мира (остров-арена) в пикселях. */
export const WORLD_SIZE = 2400;

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#0b1a24",
    pixelArt: false,
    antialias: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: { activePointers: 3 },
    physics: { default: "arcade", arcade: { debug: false } },
    scene: [BootScene, PreloadScene, GameScene, UIScene],
  };
}