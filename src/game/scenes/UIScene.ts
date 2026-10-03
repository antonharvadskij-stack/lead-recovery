import * as Phaser from "phaser";
import { TEXTURE_KEYS as K } from "../assets/manifest";

type Hud = { hp: number; maxHp: number; wave: number; kills: number; alive: number; over: boolean };
const FONT = { fontFamily: "Georgia, serif", color: "#efe2b8", stroke: "#0a0f18", strokeThickness: 4 };

/** HUD, сенсорный джойстик и кнопка атаки. */
export class UIScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Graphics;
  private info!: Phaser.GameObjects.Text;
  private overBox!: Phaser.GameObjects.Container;
  private joyBase!: Phaser.GameObjects.Arc;
  private joyKnob!: Phaser.GameObjects.Arc;
  private joyId: number | null = null;
  private joyOrigin = new Phaser.Math.Vector2();

  constructor() {
    super("UI");
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.add.image(W / 2, H / 2, K.vignette);
    this.add.text(24, 16, "NEVERENDING", { ...FONT, fontSize: "28px" });
    this.hpBar = this.add.graphics();
    this.info = this.add.text(24, 84, "", { ...FONT, fontFamily: "sans-serif", fontSize: "18px" });
    this.add.text(W - 20, H - 14, "WASD — движение · Пробел — атака", { fontFamily: "sans-serif", fontSize: "14px", color: "#9fb4bf" }).setOrigin(1, 1);

    const waveText = this.add.text(W / 2, H * 0.28, "", { ...FONT, fontSize: "56px" }).setOrigin(0.5).setAlpha(0);
    this.game.events.on("wave", (n: number) => {
      waveText.setText(`Волна ${n}`).setAlpha(1).setScale(1.3);
      this.tweens.add({ targets: waveText, scale: 1, alpha: 0, delay: 900, duration: 700 });
    });
    this.events.once("shutdown", () => this.game.events.off("wave"));

    // сенсорное управление
    this.joyBase = this.add.circle(0, 0, 60, 0xffffff, 0.08).setStrokeStyle(3, 0xffffff, 0.3).setVisible(false);
    this.joyKnob = this.add.circle(0, 0, 26, 0xffffff, 0.3).setVisible(false);
    const atk = this.add.circle(W - 110, H - 120, 58, 0xb8342a, 0.55).setStrokeStyle(4, 0xffd27a, 0.7).setInteractive();
    this.add.text(atk.x, atk.y, "Удар", { ...FONT, fontFamily: "sans-serif", fontSize: "20px" }).setOrigin(0.5);
    atk.on("pointerdown", () => this.input_().attack = true);

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (p.x < W * 0.5 && this.joyId === null) {
        this.joyId = p.id;
        this.joyOrigin.set(p.x, p.y);
        this.joyBase.setPosition(p.x, p.y).setVisible(true);
        this.joyKnob.setPosition(p.x, p.y).setVisible(true);
      } else if (p.x >= W * 0.5 && Phaser.Math.Distance.Between(p.x, p.y, atk.x, atk.y) > 60) this.input_().attack = true;
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (p.id !== this.joyId) return;
      const v = new Phaser.Math.Vector2(p.x - this.joyOrigin.x, p.y - this.joyOrigin.y);
      if (v.length() > 60) v.setLength(60);
      this.joyKnob.setPosition(this.joyOrigin.x + v.x, this.joyOrigin.y + v.y);
      const i = this.input_();
      i.x = v.x / 60;
      i.y = v.y / 60;
    });
    const release = (p: Phaser.Input.Pointer) => {
      if (p.id !== this.joyId) return;
      this.joyId = null;
      this.joyBase.setVisible(false);
      this.joyKnob.setVisible(false);
      const i = this.input_();
      i.x = 0;
      i.y = 0;
    };
    this.input.on("pointerup", release);
    this.input.on("pointerupoutside", release);

    // экран поражения
    const bg = this.add.rectangle(0, 0, W, H, 0x05060f, 0.7).setOrigin(0);
    const title = this.add.text(W / 2, H / 2 - 70, "Вы погибли", { ...FONT, fontSize: "64px", color: "#ff8a6a" }).setOrigin(0.5);
    const stats = this.add.text(W / 2, H / 2, "", { ...FONT, fontFamily: "sans-serif", fontSize: "22px" }).setOrigin(0.5);
    const btn = this.add.rectangle(W / 2, H / 2 + 80, 240, 64, 0xb8342a).setStrokeStyle(3, 0xffd27a).setInteractive({ useHandCursor: true });
    const btnT = this.add.text(btn.x, btn.y, "Заново", { ...FONT, fontFamily: "sans-serif", fontSize: "26px" }).setOrigin(0.5);
    btn.on("pointerdown", () => {
      this.overBox.setVisible(false);
      this.scene.get("Game").scene.restart();
    });
    this.overBox = this.add.container(0, 0, [bg, title, stats, btn, btnT]).setVisible(false).setDepth(100);
    this.overBox.setData("stats", stats);
  }

  private input_() {
    let i = this.registry.get("input") as { x: number; y: number; attack: boolean } | undefined;
    if (!i) {
      i = { x: 0, y: 0, attack: false };
      this.registry.set("input", i);
    }
    return i;
  }

  override update() {
    const h = this.registry.get("hud") as Hud | undefined;
    if (!h) return;
    const g = this.hpBar.clear();
    g.fillStyle(0x000000, 0.55).fillRoundedRect(22, 56, 264, 22, 6);
    g.fillStyle(h.hp > 30 ? 0xd94a3a : 0xff2a2a).fillRoundedRect(25, 59, 258 * (h.hp / h.maxHp), 16, 5);
    this.info.setText(`Здоровье ${h.hp}   ·   Волна ${h.wave}   ·   Убито ${h.kills}   ·   Врагов ${h.alive}`);
    if (h.over && !this.overBox.visible) {
      (this.overBox.getData("stats") as Phaser.GameObjects.Text).setText(`Волна ${h.wave} · Убито врагов: ${h.kills}`);
      this.overBox.setVisible(true);
    }
  }
}