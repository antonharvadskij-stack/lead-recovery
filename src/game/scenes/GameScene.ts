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
    this.registry.set("input", { x: 0, y: 0, attack: false });
    this.pushHud();
    this.time.delayedCall(800, () => this.nextWave());
    Platform.gameReady();
  }

  private pushHud() {
    this.registry.set("hud", { hp: this.hp, maxHp: 100, wave: this.wave, kills: this.kills, alive: this.enemies.length, over: this.over });
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
    this.enemies.push({ s, shadow, kind, level, hp: maxHp, maxHp, last: 0, busy: false });
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
        if (Math.abs(dy) < 55 && dx * dir > -15 && Math.abs(dx) < 95) this.damageEnemy(e, 20 + Phaser.Math.Between(0, 8), dir);
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
      this.kills++;
      e.s.disableBody(true, false);
      this.tweens.add({ targets: [e.s, e.shadow], alpha: 0, scaleY: 0.2, duration: 300, onComplete: () => { e.s.destroy(); e.shadow.destroy(); } });
      if (this.enemies.length === 0) this.time.delayedCall(2000, () => this.nextWave());
      this.pushHud();
    }
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

  override update() {
    const inp = (this.registry.get("input") ?? { x: 0, y: 0, attack: false }) as { x: number; y: number; attack: boolean };
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
      if (!e.busy) {
        if (this.over) e.s.setVelocity(0, 0);
        else if (dist > st.range) {
          const sp = st.speed * (1 + (e.level - 1) * 0.12);
          e.s.setVelocity((dx / dist) * sp, (dy / dist) * sp);
          e.s.setFlipX(dx < 0);
        } else {
          e.s.setVelocity(0, 0);
          if (now - e.last > st.cd) {
            e.last = now;
            e.busy = true;
            const key = enemyTextureKey(e.kind, e.level);
            e.s.play(`${key}_attack`);
            this.time.delayedCall(200, () => {
              if (e.s.active && Phaser.Math.Distance.Between(e.s.x, e.s.y, this.player.x, this.player.y) < st.range + 15)
                this.hurtPlayer(Math.round(st.dmg * (1 + (e.level - 1) * 0.4)), e.s.x);
            });
            e.s.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
              e.busy = false;
              if (e.s.active) e.s.play(`${key}_walk`);
            });
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