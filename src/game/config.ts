/** Базовая конфигурация NEVERENDING. Phaser подключается только на клиенте. */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const WORLD_SIZE = 2400;

export function createGameConfig(parent: HTMLElement) {
  return {
    type: 0,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#0b1a24",
    pixelArt: false,
    antialias: true,
    scale: { mode: 3, autoCenter: 1 },
    input: { activePointers: 3 },
    physics: { default: "arcade", arcade: { debug: false } },
    scene: [],
  };
}
