import * as Phaser from "phaser";
import { ATTACK_FRAMES, CHAR_FRAME, TEXTURE_KEYS as K, WALK_FRAMES, enemyTextureKey, type EnemyKind } from "../assets/manifest";
import { generateIsland } from "../assets/ProceduralTextures";
import { WORLD_SIZE } from "../config";
import { Platform } from "../platform/yandex";

const ISLAND_R = 1160;
const WALK_R = 1080;
type Sprite = Phaser.Physics.Arcade.Sprite;

const STATS: Record<EnemyKind, { hp: number; speed: number; dmg: number; range: number; cd: number; blood: number[] }> = {
  walker: { hp: 45, speed: 75, dmg: 8, range: 60, cd: 1100, blood: [0x9be36a, 0x5a8a3a] },
  runner: { hp: 25, speed: 165, dmg: 5, range: 55, cd: 800, blood: [0xffb03d, 0xc0502a] },
  brute: { hp: 150, speed: 48, dmg: 20, range: 80, cd: 1600, blood: [0xff5a3d, 0x8a2020] },
};

interface Enemy {
  s: Sprite;
  shadow: Phaser.GameObjects.Image;
  kind: EnemyKind;
  level: number;
  hp: number;
  maxHp: number;
  last: number;
  busy: boolean;
  awakened: boolean;
  memory: number;
  pacifiedUntil: number;
}

function ensureAnims(scene: Phaser.Scene, key: string) {
  if (scene.anims.exists(`${key}_walk`)) return;
  const fr = (a: number, n: number) => Array.from({ length: n }, (_, i) => ({ key, frame: a + i }));
  scene.anims.create({ key: `${key}_walk`, frames: fr(0, WALK_FRAMES), frameRate: 12, repeat: -1 });
  scene.anims.create({ key: `${key}_attack`, frames: fr(WALK_FRAMES, ATTACK_FRAMES), frameRate: 18 });
}

export class GameScene extends Phaser.Scene {
  private player!: Sprite;
  private pShadow!: Phaser.GameObjects.Image;
  private enemies: Enemy[] = [];
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private keys!: Record<"W" | "A" | "S" | "D" | "UP" | "DOWN" | "LEFT" | "RIGHT" | "SPACE" | "J", Phaser.Input.Keyboard.Key>;
  private center = new Phaser.Math.Vector2(WORLD_SIZE / 2, WORLD_SIZE / 2);
  private hp = 100;
  private lastAttack = 0;
  private invuln = 0;
  private attacking = false;
  private wave = 0;
  private kills = 0;
  private over = false;
  private hit!: Phaser.GameObjects.Particles.ParticleEmitter;
  private bars!: Phaser.GameObjects.Graphics;
  private resources = { wood: 0, stone: 0, food: 0, coins: 0 };
  private hunger = 100;
  private day = 1;
  private dayTime = 0;
  private campLevel = 1;
  private weaponLevel = 1;
  private quest = { type: "gather", target: 10, progress: 0 } as { type: string; target: number; progress: number };
  private pickups!: Phaser.Physics.Arcade.Group;
  private pickupLabels: Phaser.GameObjects.Text[] = [];
  private farmLevel = 1;
  private workshopLevel = 1;
  private wallLevel = 1;
  private towerLevel = 1;
  private nightOverlay!: Phaser.GameObjects.Rectangle;
  private buildings: Phaser.GameObjects.GameObject[] = [];
  private lastFarmTick = 0;
  private lastTowerShot = 0;
  private chests: Phaser.GameObjects.Container[] = [];
  private discoveredZones = new Set<string>();
  private workshopCrafts = 0;
  private memory = { steps: 0, rescues: 0, scars: 0, echoes: 0 };
  private lastMemoryAction = "";
  private worldMood = 0;
  private echoGroup!: Phaser.GameObjects.Group;
  private lastWorldPulse = 0;

  constructor() {
    super("Game");
  }

  create() {
    this.enemies = [];
    this.hp = 100;
    this.wave = 0;
    this.kills = 0;
    this.over = false;
    this.attacking = false;
    this.resources = { wood: 0, stone: 0, food: 0, coins: 0 };
    this.hunger = 100;
    this.day = 1;
    this.dayTime = 0;
    this.campLevel = 1;
    this.weaponLevel = 1;
    this.quest = { type: "gather", target: 10, progress: 0 };
    this.farmLevel = 1; this.workshopLevel = 1; this.wallLevel = 1; this.towerLevel = 1;
    this.lastFarmTick = 0; this.lastTowerShot = 0;
    this.chests = []; this.discoveredZones = new Set<string>(); this.workshopCrafts = 0;
    this.memory = { steps: 0, rescues: 0, scars: 0, echoes: 0 }; this.lastMemoryAction = ""; this.worldMood = 0; this.lastWorldPulse = 0;
    const S = WORLD_SIZE;
    const rng = new Phaser.Math.RandomDataGenerator(["neverending"]);
    generateIsland(this, ISLAND_R, () => rng.frac());

    const water = this.add.tileSprite(S / 2, S / 2, S * 1.6, S * 1.6, K.water).setDepth(-20);
    this.tweens.add({ targets: water, tilePositionX: 128, duration: 9000, repeat: -1 });
    this.add.image(S / 2, S / 2, K.island).setScale(2).setDepth(-10);

    this.physics.world.setBounds(0, 0, S, S);
    const obstacles = this.physics.add.staticGroup();
    const decor = (key: string, x: number, y: number, r: number, solid: boolean) => {
      this.add.image(x, y + 4, K.shadow).setScale(r / 18, r / 22).setDepth(y - 1);
      const img = this.add.image(x, y, key).setOrigin(0.5, 0.92).setDepth(y);
      if (solid) {
        const b = obstacles.create(x, y - 6, undefined) as Phaser.Physics.Arcade.Sprite;
        b.setVisible(false).setCircle(r).setOffset(-r + 16, -r + 16).refreshBody();
      }
      return img;
    };
    for (let i = 0; i < 62; i++) {
      const a = rng.frac() * Math.PI * 2;
      const d = 230 + Math.sqrt(rng.frac()) * 820;
      const x = S / 2 + Math.cos(a) * d;
      const y = S / 2 + Math.sin(a) * d;
      const t = rng.frac();
      if (t < 0.45) decor(K.tree, x, y, 22, true);
      else if (t < 0.7) decor(K.rock, x, y, 26, true);
      else decor(K.bush, x, y, 20, false);
    }

    // База: ферма, мастерская, стена и сторожевая башня вокруг лагеря.
    this.createBaseBuildings(S / 2, S / 2);
    this.nightOverlay = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x07152b, 0)
      .setScrollFactor(0).setDepth(9000).setInteractive(false);

    this.createExplorationZones(S / 2, S / 2, rng);

    // костёр + свет
    this.add.image(S / 2, S / 2, K.campfire).setDepth(S / 2 - 1);
    const glow = this.add.image(S / 2, S / 2 - 10, K.glow).setScale(3).setTint(0xff9a3d).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.55).setDepth(5000);
    this.tweens.add({ targets: glow, scale: 3.3, alpha: 0.7, duration: 180, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    this.add.particles(S / 2, S / 2 - 8, K.particle, {
      speedY: { min: -90, max: -40 }, speedX: { min: -15, max: 15 }, lifespan: 900, frequency: 40,
      scale: { start: 0.9, end: 0 }, tint: [0xffd27a, 0xff7a2a, 0xff3d1a], blendMode: "ADD",
    }).setDepth(5001);
    this.add.particles(0, 0, K.particle, {
      x: { min: S / 2 - 900, max: S / 2 + 900 }, y: { min: S / 2 - 900, max: S / 2 + 900 },
      lifespan: 4000, frequency: 120, speed: { min: 5, max: 20 }, scale: { start: 0.35, end: 0 },
      alpha: { start: 0.9, end: 0 }, tint: 0xd8ff8a, blendMode: "ADD",
    }).setDepth(5002);

    // игрок
    ensureAnims(this, K.player);
    this.pShadow = this.add.image(0, 0, K.shadow).setScale(0.9, 0.8);
    this.player = this.physics.add.sprite(S / 2 + 120, S / 2 + 60, K.player, 0).setOrigin(0.5, (CHAR_FRAME - 12) / CHAR_FRAME);
    this.player.setCircle(14, CHAR_FRAME / 2 - 14, CHAR_FRAME - 12 - 22);
    this.player.play(`${K.player}_walk`);
    const pGlow = this.add.image(0, 0, K.glow).setScale(1.4).setTint(0xffe0b0).setAlpha(0.18).setBlendMode(Phaser.BlendModes.ADD).setDepth(4999);
    this.events.on("update", () => pGlow.setPosition(this.player.x, this.player.y - 30));

    this.enemyGroup = this.physics.add.group();
    this.echoGroup = this.add.group();
    this.pickups = this.physics.add.group();
    this.physics.add.overlap(this.player, this.pickups, (_p, obj) => this.collectPickup(obj as Phaser.Physics.Arcade.Sprite), undefined, this);
    this.physics.add.collider(this.player, obstacles);
    this.physics.add.collider(this.enemyGroup, obstacles);
    this.physics.add.collider(this.enemyGroup, this.enemyGroup);

    this.hit = this.add.particles(0, 0, K.particle, {
      speed: { min: 80, max: 260 }, lifespan: 450, scale: { start: 0.8, end: 0 }, gravityY: 300, emitting: false,
    }).setDepth(6000);
    this.bars = this.add.graphics().setDepth(6500);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, S, S);
    cam.startFollow(this.player, true, 0.09, 0.09);
    cam.fadeIn(500);

    this.keys = this.input.keyboard!.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,J") as GameScene["keys"];
    this.registry.set("input", { x: 0, y: 0, attack: false, context: false });
    this.pushHud();
    this.time.delayedCall(800, () => this.nextWave());
    Platform.gameReady();
  }

  private pushHud() {
    const context = this.getContextAction();
    this.registry.set("memory", { ...this.memory, mood: this.worldMood, last: this.lastMemoryAction, context });
    this.registry.set("hud", { hp: this.hp, maxHp: 100, wave: this.wave, kills: this.kills, alive: this.enemies.length, over: this.over, wood: this.resources.wood, stone: this.resources.stone, food: this.resources.food, coins: this.resources.coins, hunger: this.hunger, day: this.day, campLevel: this.campLevel, weaponLevel: this.weaponLevel, farmLevel: this.farmLevel, workshopLevel: this.workshopLevel, wallLevel: this.wallLevel, towerLevel: this.towerLevel, quest: this.quest });
  }

  private nextWave() {
    if (this.over) return;
    this.wave++;
    this.game.events.emit("wave", this.wave);
    const n = 4 + this.wave * 2;
    for (let i = 0; i < n; i++) this.time.delayedCall(i * 250, () => this.spawn());
    this.pushHud();
  }

  private spawn() {
    if (this.over) return;
    const r = Math.random();
    const kind: EnemyKind = this.wave >= 3 && r < 0.22 ? "brute" : r < 0.48 ? "runner" : "walker";
    const level = Phaser.Math.Clamp(1 + Math.floor(Math.random() * Math.min(3, 1 + this.wave / 2)), 1, 3);
    const key = enemyTextureKey(kind, level);
    ensureAnims(this, key);
    const a = Math.random() * Math.PI * 2;
    const x = this.center.x + Math.cos(a) * 1030;
    const y = this.center.y + Math.sin(a) * 1030;
    const s = this.physics.add.sprite(x, y, key, 0).setOrigin(0.5, (CHAR_FRAME - 12) / CHAR_FRAME);
    const sc = 1 + (level - 1) * 0.1;
    s.setScale(sc);
    const br = kind === "brute" ? 22 : 13;
    s.setCircle(br, CHAR_FRAME / 2 - br, CHAR_FRAME - 12 - br * 1.6);
    s.play({ key: `${key}_walk`, startFrame: Phaser.Math.Between(0, 7) });
    s.setAlpha(0);
    this.tweens.add({ targets: s, alpha: 1, duration: 400 });
    this.enemyGroup.add(s);
    const st = STATS[kind];
    const maxHp = Math.round(st.hp * (1 + (level - 1) * 0.6));
    const shadow = this.add.image(x, y, K.shadow).setScale(kind === "brute" ? 1.5 : 1, 0.9);
    this.enemies.push({ s, shadow, kind, level, hp: maxHp, maxHp, last: 0, busy: false, awakened: false, memory: 0, pacifiedUntil: 0 });
    this.pushHud();
  }

  private playerAttack() {
    const now = this.time.now;
    if (now - this.lastAttack < 380 || this.over) return;
    this.lastAttack = now;
    this.attacking = true;
    this.player.play(`${K.player}_attack`);
    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.attacking = false;
      this.player.play(`${K.player}_walk`);
    });
    this.time.delayedCall(110, () => {
      const dir = this.player.flipX ? -1 : 1;
      for (const e of [...this.enemies]) {
        const dx = e.s.x - this.player.x;
        const dy = e.s.y - this.player.y;
        if (Math.abs(dy) < 55 && dx * dir > -15 && Math.abs(dx) < 95) this.damageEnemy(e, 20 + this.weaponLevel * 4 + Phaser.Math.Between(0, 8), dir);
      // Первый удар создаёт «связь»: существо запоминает игрока.
      e.awakened = true;
      e.memory += 1;
      e.pacifiedUntil = this.time.now + 2200;
      e.s.setData("awakened", true);
      this.worldMood = Math.max(-10, this.worldMood - 1);
      this.lastMemoryAction = "Ты разбудил существо. Оно запомнило тебя.";
      }
    });
  }

  private damageEnemy(e: Enemy, dmg: number, dir: number) {
    e.hp -= dmg;
    const st = STATS[e.kind];
    this.hit.setParticleTint(st.blood[0]!);
    this.hit.explode(14, e.s.x, e.s.y - 30);
    e.s.setTintFill(0xffffff);
    this.time.delayedCall(70, () => e.s.active && e.s.clearTint());
    e.s.setVelocity(dir * 260, 0);
    e.busy = true;
    this.time.delayedCall(140, () => (e.busy = false));
    this.cameras.main.shake(70, 0.003);
    const t = this.add.text(e.s.x, e.s.y - 70, `${dmg}`, { fontFamily: "sans-serif", fontSize: "22px", fontStyle: "bold", color: "#fff2c0", stroke: "#3a1a0a", strokeThickness: 4 }).setOrigin(0.5).setDepth(7000);
    this.tweens.add({ targets: t, y: t.y - 40, alpha: 0, duration: 600, onComplete: () => t.destroy() });
    if (e.hp <= 0) {
      this.hit.setParticleTint(st.blood[1]!);
      this.hit.explode(26, e.s.x, e.s.y - 20);
      this.enemies = this.enemies.filter((x) => x !== e);
      this.dropLoot(e.s.x, e.s.y, e.kind);
      this.kills++;
      if (this.quest.type === "kill") this.quest.progress = Math.min(this.quest.target, this.quest.progress + 1);
      e.s.disableBody(true, false);
      this.tweens.add({ targets: [e.s, e.shadow], alpha: 0, scaleY: 0.2, duration: 300, onComplete: () => { e.s.destroy(); e.shadow.destroy(); } });
      if (this.enemies.length === 0) this.time.delayedCall(2000, () => this.nextWave());
      if (this.quest.type === "kill" && this.quest.progress >= this.quest.target) {
        this.resources.coins += 50;
        this.quest = { type: "gather", target: 12 + this.day * 3, progress: 0 };
      }
      this.pushHud();
    }
  }

  private getContextAction() {
    const nearbyChest = this.chests.find(c => !c.getData("opened") && Phaser.Math.Distance.Between(c.x, c.y, this.player.x, this.player.y) < 105);
    if (nearbyChest) return { id: "chest", label: "ОСМОТРЕТЬ НАХОДКУ", hint: "Мир оставит это в памяти" };
    const nearbyEnemy = this.enemies.find(e => Phaser.Math.Distance.Between(e.s.x, e.s.y, this.player.x, this.player.y) < 120);
    if (nearbyEnemy) return { id: "observe", label: "НАБЛЮДАТЬ", hint: "Изучи поведение существа" };
    if (Phaser.Math.Distance.Between(this.center.x, this.center.y, this.player.x, this.player.y) < 150)
      return { id: "camp", label: "ОСТАВИТЬ СЛЕД", hint: "Измени состояние мира" };
    return { id: "mark", label: "ЗАПОМНИТЬ МЕСТО", hint: "Оставь здесь память" };
  }

  private contextAction() {
    const a = this.getContextAction();
    if (a.id === "chest") {
      const c = this.chests.find(x => !x.getData("opened") && Phaser.Math.Distance.Between(x.x, x.y, this.player.x, this.player.y) < 105);
      if (c) { this.openChest(c); this.memory.echoes++; this.lastMemoryAction = "Ты забрал находку. Мир это запомнил."; }
    } else if (a.id === "observe") {
      this.memory.steps++;
      this.worldMood += 1;
      this.lastMemoryAction = "Ты наблюдал. Теперь существа могут вести себя иначе.";
    } else if (a.id === "camp") {
      this.memory.rescues++;
      this.worldMood += 2;
      this.lastMemoryAction = "Ты оставил след у костра. Это станет частью истории.";
      const e = this.add.circle(this.player.x, this.player.y - 30, 12, 0xffd36a, 0.8).setDepth(7000);
      this.echoGroup.add(e);
      this.tweens.add({ targets: e, scale: 3.2, alpha: 0, duration: 1000, onComplete: () => e.destroy() });
    } else {
      this.memory.scars++;
      this.worldMood -= 1;
      this.lastMemoryAction = "Место отмечено. Последствия появятся позже.";
      const e = this.add.circle(this.player.x, this.player.y - 20, 9, 0x8fd3ff, 0.7).setDepth(7000);
      this.echoGroup.add(e);
      this.tweens.add({ targets: e, scale: 2.5, alpha: 0, duration: 800, onComplete: () => e.destroy() });
    }
    this.pushHud();
  }

  private createExplorationZones(cx: number, cy: number, rng: Phaser.Math.RandomDataGenerator) {
    const zones = [
      { id: "north", x: cx, y: cy - 760, r: 150, name: "ТУМАННЫЕ БОЛОТА", tint: 0x5f7c75 },
      { id: "east", x: cx + 760, y: cy, r: 155, name: "КАМЕННЫЙ БЕРЕГ", tint: 0x8b8270 },
      { id: "south", x: cx, y: cy + 760, r: 160, name: "ЗАРОСШИЕ ПОЛЯ", tint: 0x708b4e },
      { id: "west", x: cx - 760, y: cy, r: 150, name: "СТАРЫЕ РУИНЫ", tint: 0x6f6875 },
    ];
    for (const z of zones) {
      const g = this.add.graphics().setDepth(-1);
      g.fillStyle(z.tint, 0.16).fillCircle(z.x, z.y, z.r);
      g.lineStyle(3, z.tint, 0.35).strokeCircle(z.x, z.y, z.r);
      this.add.text(z.x, z.y - z.r - 18, z.name, { fontFamily: "sans-serif", fontSize: "16px", color: "#e9dfbd", stroke: "#172017", strokeThickness: 4 }).setOrigin(0.5).setDepth(0);
      for (let i = 0; i < 3; i++) {
        const a = rng.frac() * Math.PI * 2, rr = 35 + rng.frac() * (z.r - 45);
        this.createChest(z.x + Math.cos(a) * rr, z.y + Math.sin(a) * rr, z.id, i);
      }
    }
  }
  private createChest(x: number, y: number, zone: string, index: number) {
    const body = this.add.rectangle(0, 5, 38, 28, 0x6b4227).setStrokeStyle(3, 0xd2a65c);
    const lid = this.add.rectangle(0, -10, 42, 12, 0x9b6230).setStrokeStyle(2, 0xe0c078);
    const lock = this.add.rectangle(0, 1, 7, 10, 0xe0bd54);
    const c = this.add.container(x, y, [body, lid, lock]).setDepth(y + 1).setSize(55, 55).setInteractive();
    c.setData("zone", zone).setData("index", index).setData("opened", false);
    c.on("pointerdown", () => this.openChest(c));
    this.chests.push(c);
  }
  private openChest(c: Phaser.GameObjects.Container) {
    if (c.getData("opened") || this.over) return;
    c.setData("opened", true);
    this.discoveredZones.add(String(c.getData("zone")));
    const reward = 10 + Phaser.Math.Between(5, 20);
    this.resources.coins += reward;
    this.resources.food += Phaser.Math.Between(1, 3);
    this.resources.stone += Phaser.Math.Between(1, 4);
    const lid = c.list[1] as Phaser.GameObjects.Rectangle;
    lid.angle = -28;
    const t = this.add.text(c.x, c.y - 60, "+" + reward + " МОНЕТ", { fontFamily: "sans-serif", fontSize: "17px", fontStyle: "bold", color: "#ffe29a", stroke: "#3b2412", strokeThickness: 4 }).setOrigin(0.5).setDepth(8000);
    this.tweens.add({ targets: t, y: t.y - 35, alpha: 0, duration: 900, onComplete: () => t.destroy() });
    this.pushHud();
  }
  private craftAtWorkshop() {
    const cost = { wood: 8 + this.workshopLevel * 4, stone: 6 + this.workshopLevel * 3 };
    if (this.resources.wood < cost.wood || this.resources.stone < cost.stone) return;
    this.resources.wood -= cost.wood; this.resources.stone -= cost.stone;
    this.workshopCrafts++;
    this.resources.coins += 8 + this.workshopLevel * 3;
    this.pushHud();
  }
  private createBaseBuildings(cx: number, cy: number) {
    const make = (x: number, y: number, type: string) => {
      const g = this.add.graphics().setDepth(y - 2);
      if (type === "farm") {
        g.fillStyle(0x6b4829).fillRect(x - 48, y - 30, 96, 60);
        g.lineStyle(5, 0x9b6a38).strokeRect(x - 48, y - 30, 96, 60);
        for (let i = 0; i < 6; i++) g.fillStyle(0x6fa34b).fillRect(x - 38 + i * 15, y - 18, 7, 38);
      } else if (type === "workshop") {
        g.fillStyle(0x73513a).fillRect(x - 42, y - 34, 84, 68);
        g.fillStyle(0xb04435).fillTriangle(x - 52, y - 34, x, y - 68, x + 52, y - 34);
        g.fillStyle(0x33251c).fillRect(x - 12, y - 8, 24, 42);
        g.fillStyle(0xd8b66a).fillCircle(x + 22, y - 12, 7);
      } else if (type === "wall") {
        g.fillStyle(0x7d848c);
        for (let i = -3; i <= 3; i++) g.fillRect(x + i * 22 - 9, y - 15, 18, 30);
        g.lineStyle(3, 0x4e5962).strokeRect(x - 78, y - 18, 156, 36);
      } else {
        g.fillStyle(0x6e747a).fillRect(x - 14, y - 72, 28, 72);
        g.fillStyle(0x8f969d).fillCircle(x, y - 78, 26);
        g.fillStyle(0xffc75a).fillCircle(x, y - 84, 7);
      }
      this.buildings.push(g);
      return g;
    };
    make(cx - 155, cy + 30, "farm");
    make(cx + 155, cy + 30, "workshop");
    make(cx, cy + 165, "wall");
    make(cx, cy - 150, "tower");
    this.add.text(cx - 155, cy + 65, "ФЕРМА", { fontFamily: "sans-serif", fontSize: "13px", color: "#f0d9a0" }).setOrigin(0.5).setDepth(cy + 70);
    this.add.text(cx + 155, cy + 65, "МАСТЕРСКАЯ", { fontFamily: "sans-serif", fontSize: "13px", color: "#f0d9a0" }).setOrigin(0.5).setDepth(cy + 70);
  }

  private upgradeBuilding(type: "farm" | "workshop" | "wall" | "tower") {
    const level = this[type + "Level"];
    const cost = { wood: 8 + level * 8, stone: 6 + level * 6, coins: 5 + level * 5 };
    if (this.resources.wood < cost.wood || this.resources.stone < cost.stone || this.resources.coins < cost.coins) return;
    this.resources.wood -= cost.wood; this.resources.stone -= cost.stone; this.resources.coins -= cost.coins;
    (this[type + "Level"] as number)++;
    this.pushHud();
  }

  private tickBaseAndNight(delta: number) {
    const dayProgress = (this.dayTime % 120000) / 120000;
    const night = dayProgress > 0.68 || dayProgress < 0.12;
    this.nightOverlay.setAlpha(night ? 0.34 : Math.max(0, (dayProgress - 0.55) * 2.1));
    if (this.time.now - this.lastFarmTick > Math.max(9000, 30000 - this.farmLevel * 2500)) {
      this.lastFarmTick = this.time.now;
      this.resources.food += this.farmLevel;
      this.pushHud();
    }
    if (this.time.now - this.lastTowerShot > Math.max(700, 2400 - this.towerLevel * 180)) {
      const target = this.enemies.find(e => Phaser.Math.Distance.Between(e.s.x, e.s.y, this.center.x, this.center.y) < 420);
      if (target) {
        this.lastTowerShot = this.time.now;
        const line = this.add.line(0, 0, this.center.x, this.center.y - 150, target.s.x, target.s.y - 25, 0xffd36a, 0.9).setOrigin(0).setDepth(8000);
        this.tweens.add({ targets: line, alpha: 0, duration: 180, onComplete: () => line.destroy() });
        this.damageEnemy(target, 8 + this.towerLevel * 3, 0);
      }
    }
  }

  private dropLoot(x: number, y: number, kind: EnemyKind) {
    const count = kind === "brute" ? 3 : 1 + Phaser.Math.Between(0, 1);
    for (let i = 0; i < count; i++) {
      const roll = Math.random();
      const type = roll < 0.42 ? "wood" : roll < 0.72 ? "stone" : roll < 0.92 ? "food" : "coins";
      const color = type === "wood" ? 0x9b6a3c : type === "stone" ? 0x9aa4ad : type === "food" ? 0x7fb84a : 0xe8c45c;
      const s = this.physics.add.sprite(x + Phaser.Math.Between(-24,24), y + Phaser.Math.Between(-18,18), K.particle);
      s.setTint(color).setScale(type === "coins" ? 0.7 : 1.1).setData("type", type).setData("amount", type === "coins" ? Phaser.Math.Between(2,6) : 1);
      this.pickups.add(s);
      this.tweens.add({ targets: s, y: s.y - 18, duration: 300, yoyo: true, ease: "Sine.out" });
      this.time.delayedCall(12000, () => { if (s.active) s.destroy(); });
    }
  }

  private collectPickup(s: Phaser.Physics.Arcade.Sprite) {
    if (!s.active) return;
    const type = s.getData("type") as keyof typeof this.resources;
    const amount = Number(s.getData("amount") || 1);
    this.resources[type] += amount;
    if (this.quest.type === "gather") this.quest.progress = Math.min(this.quest.target, this.quest.progress + amount);
    s.destroy();
    this.pushHud();
    if (this.quest.progress >= this.quest.target) {
      this.resources.coins += 25;
      this.quest = { type: "kill", target: 5 + this.day * 2, progress: 0 };
      this.pushHud();
    }
  }

  private buildCamp() {
    const cost = { wood: 20 + this.campLevel * 10, stone: 12 + this.campLevel * 6 };
    if (this.resources.wood < cost.wood || this.resources.stone < cost.stone) return;
    this.resources.wood -= cost.wood; this.resources.stone -= cost.stone; this.campLevel++;
    this.hp = Math.min(100, this.hp + 20);
    this.hunger = Math.min(100, this.hunger + 15);
    this.pushHud();
  }

  private upgradeWeapon() {
    const cost = 30 + this.weaponLevel * 25;
    if (this.resources.coins < cost || this.weaponLevel >= 8) return;
    this.resources.coins -= cost; this.weaponLevel++;
    this.pushHud();
  }

  private eatFood() {
    if (this.resources.food <= 0 || this.hunger >= 100) return;
    this.resources.food--; this.hunger = Math.min(100, this.hunger + 28); this.pushHud();
  }

  private tickSurvival(delta: number) {
    this.dayTime += delta;
    this.hunger = Math.max(0, this.hunger - delta / 9000);
    if (this.hunger <= 0 && this.time.now > this.invuln) this.hp = Math.max(0, this.hp - delta / 1800);
    if (this.dayTime >= 120000) { this.dayTime = 0; this.day++; this.hunger = Math.max(0, this.hunger - 12); this.pushHud(); }
  }

  private hurtPlayer(dmg: number, fromX: number) {
    if (this.over || this.time.now < this.invuln) return;
    this.invuln = this.time.now + 450;
    this.hp = Math.max(0, this.hp - dmg);
    this.player.setTint(0xff6060);
    this.time.delayedCall(150, () => this.player.clearTint());
    this.hit.setParticleTint(0xd02a2a);
    this.hit.explode(10, this.player.x, this.player.y - 40);
    this.cameras.main.shake(120, 0.008);
    const d = Math.sign(this.player.x - fromX) || 1;
    this.player.x += d * 14;
    if (this.hp <= 0) {
      this.over = true;
      this.player.stop();
      this.player.setVelocity(0, 0);
      this.tweens.add({ targets: this.player, angle: 90 * d, alpha: 0.6, duration: 500 });
      this.cameras.main.zoomTo(1.25, 1200);
    }
    this.pushHud();
  }

  override update(_time: number, delta: number) {
    this.tickSurvival(delta);
    if (Math.abs(this.player.body?.velocity.x ?? 0) + Math.abs(this.player.body?.velocity.y ?? 0) > 5) this.memory.steps += delta / 1000;
    this.tickBaseAndNight(delta);
    const inp = (this.registry.get("input") ?? { x: 0, y: 0, attack: false, build: false, upgrade: false, eat: false }) as { x: number; y: number; attack: boolean; build?: boolean; upgrade?: boolean; eat?: boolean };
    if (inp.build) { inp.build = false; this.buildCamp(); }
    if (inp.upgrade) { inp.upgrade = false; this.upgradeWeapon(); }
    if (inp.eat) { inp.eat = false; this.eatFood(); }
    if ((inp as any).craft) { (inp as any).craft = false; this.craftAtWorkshop(); }
    if ((inp as any).context) { (inp as any).context = false; this.contextAction(); }
    for (const type of ["farm","workshop","wall","tower"] as const) {
      if ((inp as any)[type]) { (inp as any)[type] = false; this.upgradeBuilding(type); }
    }
    const k = this.keys;
    if (!this.over) {
      if (Phaser.Input.Keyboard.JustDown(k.SPACE) || Phaser.Input.Keyboard.JustDown(k.J) || inp.attack) {
        inp.attack = false;
        this.playerAttack();
      }
      const dir = new Phaser.Math.Vector2(
        (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0) + inp.x,
        (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0) + inp.y,
      );
      const len = Math.min(1, dir.length());
      dir.normalize().scale(len * (this.attacking ? 110 : 240));
      this.player.setVelocity(dir.x, dir.y);
      if (Math.abs(dir.x) > 5) this.player.setFlipX(dir.x < 0);
      this.player.anims.timeScale = this.attacking ? 1 : len > 0.05 ? 1 : 0.0001;
      if (!this.attacking && len <= 0.05) this.player.setFrame(0);
    }
    this.clamp(this.player);
    this.player.setDepth(this.player.y);
    this.pShadow.setPosition(this.player.x, this.player.y).setDepth(this.player.y - 1);

    const now = this.time.now;
    this.bars.clear();
    for (const e of this.enemies) {
      const st = STATS[e.kind];
      const dx = this.player.x - e.s.x;
      const dy = this.player.y - e.s.y;
      const dist = Math.hypot(dx, dy);
      // Враги больше НЕ атакуют игрока автоматически.
      // Они преследуют и наблюдают, а урон игрок получает только через явное игровое действие.
      if (!e.busy) {
        if (this.over) {
          e.s.setVelocity(0, 0);
        } else if (e.awakened && this.time.now >= e.pacifiedUntil) {
          // После пробуждения существо начинает преследовать, но его реакция зависит от памяти.
          const sp = st.speed * (1 + (e.level - 1) * 0.12 + Math.min(e.memory, 3) * 0.05);
          if (dist > st.range) {
            e.s.setVelocity((dx / Math.max(dist, 1)) * sp, (dy / Math.max(dist, 1)) * sp);
          } else {
            e.s.setVelocity(0, 0);
          }
          e.s.setFlipX(dx < 0);
        } else if (e.hp < e.maxHp) {
          // Раненое, но ещё не пробуждённое существо также реагирует на игрока.
          const sp = st.speed * (1 + (e.level - 1) * 0.12);
          if (dist > st.range) e.s.setVelocity((dx / Math.max(dist, 1)) * sp, (dy / Math.max(dist, 1)) * sp);
          else e.s.setVelocity(0, 0);
          e.s.setFlipX(dx < 0);
        } else {
          // Нейтральные враги не бегут на игрока сами.
          // Они медленно бродят по своей зоне и начинают преследование
          // только после того, как игрок первым нанесёт им урон.
          const t = now / 1000 + e.s.x * 0.001 + e.s.y * 0.001;
          const wanderX = Math.sin(t * 0.7 + e.level) * 0.35;
          const wanderY = Math.cos(t * 0.53 + e.level * 2) * 0.25;
          const wander = new Phaser.Math.Vector2(wanderX, wanderY);
          if (wander.lengthSq() > 0.01) {
            wander.normalize().scale(st.speed * 0.18);
            e.s.setVelocity(wander.x, wander.y);
            if (Math.abs(wander.x) > 0.02) e.s.setFlipX(wander.x < 0);
          } else {
            e.s.setVelocity(0, 0);
          }
        }
      }
      this.clamp(e.s);
      e.s.setDepth(e.s.y);
      e.shadow.setPosition(e.s.x, e.s.y).setDepth(e.s.y - 1);
      if (e.hp < e.maxHp) {
        const w = 36;
        const y = e.s.y - e.s.displayHeight * 0.78;
        this.bars.fillStyle(0x000000, 0.6).fillRect(e.s.x - w / 2 - 1, y - 1, w + 2, 6);
        this.bars.fillStyle(0xe04040).fillRect(e.s.x - w / 2, y, (w * e.hp) / e.maxHp, 4);
      }
    }
  }

  private clamp(s: Sprite) {
    const off = new Phaser.Math.Vector2(s.x - this.center.x, s.y - this.center.y);
    if (off.length() > WALK_R) {
      off.setLength(WALK_R);
      s.setPosition(this.center.x + off.x, this.center.y + off.y);
    }
  }
}