import * as Phaser from "phaser";
import { TEXTURE_KEYS as K } from "../assets/manifest";

type Hud = { hp: number; maxHp: number; wave: number; kills: number; alive: number; over: boolean; wood?: number; stone?: number; food?: number; coins?: number; hunger?: number; day?: number; campLevel?: number; weaponLevel?: number; quest?: { type: string; target: number; progress: number } };
const FONT = { fontFamily: "Georgia, serif", color: "#efe2b8", stroke: "#0a0f18", strokeThickness: 4 };

/** HUD, сенсорный джойстик и кнопка атаки. */
export class UIScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Graphics;
  private info!: Phaser.GameObjects.Text;
  private overBox!: Phaser.GameObjects.Container;
  private menuBox!: Phaser.GameObjects.Container;
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
    this.info = this.add.text(24, 84, "", { ...FONT, fontFamily: "sans-serif", fontSize: "17px" });
    const menuBtn = this.add.rectangle(W - 58, 34, 92, 42, 0x172838, 0.95).setStrokeStyle(2, 0xd8b66a, 0.8).setInteractive();
    this.add.text(menuBtn.x, menuBtn.y, "МЕНЮ", { ...FONT, fontFamily: "sans-serif", fontSize: "15px" }).setOrigin(0.5);
    menuBtn.on("pointerdown", () => this.menuBox.setVisible(!this.menuBox.visible));
    const actions = [
      ["Еда", W - 250, H - 62, "eat"], ["Лагерь", W - 180, H - 62, "build"], ["Оружие", W - 105, H - 62, "upgrade"], ["Крафт", W - 320, H - 120, "craft"],
    ];
    for (const [label, x, y, action] of actions as [string, number, number, string][]) {
      const b = this.add.rectangle(x, y, 86, 42, 0x172838, 0.9).setStrokeStyle(2, 0xd8b66a, 0.7).setInteractive();
      this.add.text(x, y, label, { fontFamily: "sans-serif", fontSize: "13px", color: "#efe2b8" }).setOrigin(0.5);
      b.on("pointerdown", () => { const i = this.input_() as any; i[action] = true; });
    }
    this.add.text(W - 20, H - 14, "Джойстик — движение · Удар — атака · Меню — база", { fontFamily: "sans-serif", fontSize: "14px", color: "#9fb4bf" }).setOrigin(1, 1);

    // Полноценное меню управления базой и прогрессией.
    const mbg = this.add.rectangle(0, 0, 430, 500, 0x0a1420, 0.96).setStrokeStyle(3, 0xd8b66a, 0.85);
    const mtitle = this.add.text(0, -225, "ЛАГЕРЬ", { ...FONT, fontSize: "30px" }).setOrigin(0.5);
    const mdesc = this.add.text(0, -188, "Строй, улучшай и готовься к ночи", { fontFamily: "sans-serif", fontSize: "16px", color: "#b7c5c9" }).setOrigin(0.5);
    const menuItems: Array<[string,string,number]> = [
      ["Построить лагерь", "build", 0],
      ["Улучшить оружие", "upgrade", 1],
      ["Собрать еду", "eat", 2],
      ["Крафт мастерской", "craft", 3],
      ["Улучшить ферму", "farm", 4],
      ["Улучшить мастерскую", "workshop", 5],
      ["Улучшить стену", "wall", 6],
      ["Улучшить башню", "tower", 7],
      ["Закрыть", "close", 8],
    ];
    const menuButtons: Phaser.GameObjects.GameObject[] = [mbg, mtitle, mdesc];
    menuItems.forEach(([label, action, idx]) => {
      const y = -105 + idx * 40;
      const b = this.add.rectangle(0, y, 300, 46, 0x172838, 1).setStrokeStyle(2, 0x6f8792, 0.8).setInteractive();
      const t = this.add.text(0, y, label, { fontFamily: "sans-serif", fontSize: "17px", color: "#efe2b8" }).setOrigin(0.5);
      b.on("pointerdown", () => {
        if (action === "close") { this.menuBox.setVisible(false); return; }
        const i = this.input_() as any;
        i[action] = true;
        this.menuBox.setVisible(false);
      });
      menuButtons.push(b, t);
    });
    this.menuBox = this.add.container(W / 2, H / 2, menuButtons).setDepth(200).setVisible(false);

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
    const q = h.quest ? ` · Задание: ${h.quest.progress}/${h.quest.target}` : "";
    this.info.setText(`HP ${h.hp}   ·   Голод ${Math.round(h.hunger ?? 100)}%   ·   День ${h.day ?? 1}\nДерево ${h.wood ?? 0}  Камень ${h.stone ?? 0}  Еда ${h.food ?? 0}  Монеты ${h.coins ?? 0}   ·   Лагерь ${h.campLevel ?? 1}  Оружие ${h.weaponLevel ?? 1}${q}`);
    if (h.over && !this.overBox.visible) {
      (this.overBox.getData("stats") as Phaser.GameObjects.Text).setText(`Волна ${h.wave} · Убито врагов: ${h.kills}`);
      this.overBox.setVisible(true);
    }
  }
}