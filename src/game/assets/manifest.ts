/**
 * Реестр ассетов. Сейчас текстуры генерируются процедурно (ProceduralTextures).
 * Чтобы подключить настоящие ассеты, положите файлы в public/assets и добавьте записи сюда:
 * если ключ совпадает с процедурным, реальный ассет заменит заглушку автоматически.
 * Персонажи: spritesheet 128x128, кадры 0–7 ходьба, 8–12 атака.
 */
export type AssetEntry =
  | { type: "image"; key: string; url: string }
  | { type: "spritesheet"; key: string; url: string; frameWidth: number; frameHeight: number }
  | { type: "atlas"; key: string; textureURL: string; atlasURL: string }
  | { type: "audio"; key: string; urls: string[] };

export type EnemyKind = "walker" | "runner" | "brute";

export const enemyTextureKey = (kind: EnemyKind, level: number) => `enemy_${kind}_${level}`;

export const TEXTURE_KEYS = {
  player: "player",
  island: "island",
  water: "water_tile",
  shadow: "shadow",
  particle: "particle",
  glow: "glow",
  tree: "tree",
  rock: "rock",
  bush: "bush",
  campfire: "campfire",
  vignette: "vignette",
} as const;

export const CHAR_FRAME = 128;
export const WALK_FRAMES = 8;
export const ATTACK_FRAMES = 5;

export const ASSET_MANIFEST: AssetEntry[] = [
  // { type: "spritesheet", key: TEXTURE_KEYS.player, url: "/assets/player.png", frameWidth: 128, frameHeight: 128 },
];