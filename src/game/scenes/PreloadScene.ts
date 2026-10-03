import * as Phaser from "phaser";
import { ASSET_MANIFEST } from "../assets/manifest";
import { generatePlaceholderTextures } from "../assets/ProceduralTextures";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload");
  }

  preload() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    this.add.text(cx, cy - 60, "NEVERENDING", { fontFamily: "Georgia, serif", fontSize: "56px", color: "#e8d9a8" }).setOrigin(0.5);
    const label = this.add.text(cx, cy + 50, "Загрузка… 0%", { fontFamily: "sans-serif", fontSize: "20px", color: "#9fb4bf" }).setOrigin(0.5);
    this.add.rectangle(cx, cy + 10, 404, 16).setStrokeStyle(2, 0xe8d9a8);
    const bar = this.add.rectangle(cx - 200, cy + 10, 0, 10, 0xe8d9a8).setOrigin(0, 0.5);

    this.load.on("progress", (p: number) => {
      bar.width = 400 * p;
      label.setText(`Загрузка… ${Math.round(p * 100)}%`);
    });

    for (const a of ASSET_MANIFEST) {
      if (a.type === "image") this.load.image(a.key, a.url);
      else if (a.type === "spritesheet") this.load.spritesheet(a.key, a.url, { frameWidth: a.frameWidth, frameHeight: a.frameHeight });
      else if (a.type === "atlas") this.load.atlas(a.key, a.textureURL, a.atlasURL);
      else if (a.type === "audio") this.load.audio(a.key, a.urls);
    }
  }

  create() {
    generatePlaceholderTextures(this);
    this.scene.start("Game");
    this.scene.launch("UI");
  }
}