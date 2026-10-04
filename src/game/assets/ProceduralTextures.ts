import Phaser from "phaser";
import { ATTACK_FRAMES, CHAR_FRAME, TEXTURE_KEYS as K, WALK_FRAMES, enemyTextureKey, type EnemyKind } from "./manifest";

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

function detail(c: Ctx, x: number, y: number, r: number, col: string, a = 1) {
  c.save(); c.globalAlpha = a; c.fillStyle = col;
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore();
}
function outline(c: Ctx, draw: () => void) {
  c.save(); c.shadowColor = "rgba(0,0,0,.45)"; c.shadowBlur = 3; draw(); c.restore();
}

function canvasTex(scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx) => void) {
  if (scene.textures.exists(key)) return null;
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) return null;
  draw(tex.getContext());
  tex.refresh();
  return tex;
}

/** Конечность, нарисованная вниз от (x,y) и повёрнутая на angle (0 = вниз, по часовой). */
function limb(c: Ctx, x: number, y: number, len: number, w: number, a: number, color: string, end?: (c: Ctx) => void) {
  c.save();
  c.translate(x, y);
  c.rotate(a);
  c.fillStyle = color;
  c.beginPath();
  c.roundRect(-w / 2, -w / 4, w, len + w / 4, w / 2);
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)";
  c.lineWidth = 1.2;
  c.stroke();
  if (end) {
    c.translate(0, len);
    end(c);
  }
  c.restore();
}

function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

function eye(c: Ctx, x: number, y: number, r: number, color: string) {
  c.save();
  c.shadowColor = color;
  c.shadowBlur = 8;
  c.fillStyle = color;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
  c.restore();
}

const ease = (x: number) => 1 - Math.pow(1 - x, 3);

interface HumanoidStyle {
  skin: string;
  cloth: string;
  pants: string;
  accent: string;
  eyes: string;
  bulk: number;
  hunch: number;
  player?: boolean;
  level: number;
  brute?: boolean;
}

/** Гуманоид в профиль (смотрит вправо), ноги в (0,0). */
function drawHumanoid(c: Ctx, s: HumanoidStyle, t: number, attack: number | null) {
  const walk = attack === null;
  const swing = walk ? Math.sin(t) * 0.6 : 0.25;
  const bob = walk ? Math.abs(Math.sin(t)) * 2 : 0;
  const hipY = -30 - bob;
  const tw = 18 * s.bulk;
  const legW = 8 * Math.sqrt(s.bulk);
  const boot = (col: string) => (cc: Ctx) => {
    cc.fillStyle = col;
    cc.beginPath();
    cc.ellipse(3, 1, legW * 0.8, legW * 0.45, 0, 0, TAU);
    cc.fill();
  };

  if (s.level >= 3) {
    const g = c.createRadialGradient(0, -38, 4, 0, -38, 52 * s.bulk);
    g.addColorStop(0, s.eyes + "55");
    g.addColorStop(1, s.eyes + "00");
    c.fillStyle = g;
    c.fillRect(-60, -110, 120, 120);
  }

  // задняя нога
  limb(c, -3, hipY, 28, legW, swing, shade(s.pants, 0.65), boot("#1d1a17"));

  // верх тела (наклон)
  c.save();
  c.translate(0, hipY);
  c.rotate(s.hunch * 0.45 + (attack !== null ? 0.12 * Math.sin(attack * Math.PI) : 0));

  const armBackA = walk ? (s.player ? -swing * 0.7 : -1.35 + Math.sin(t) * 0.15) : s.player ? 0.4 : -1.2;
  limb(c, -2, -24, 22 * Math.sqrt(s.bulk), 7 * s.bulk, armBackA, shade(s.player ? s.cloth : s.skin, 0.65), (cc) => {
    cc.fillStyle = shade(s.skin, 0.7);
    cc.beginPath();
    cc.arc(0, 2, 4 * s.bulk, 0, TAU);
    cc.fill();
  });

  if (s.player) {
    // рюкзак
    c.fillStyle = "#6b4a2b";
    c.beginPath();
    c.roundRect(-tw / 2 - 9, -26, 11, 22, 4);
    c.fill();
    c.fillStyle = "#4e3520";
    c.fillRect(-tw / 2 - 8, -14, 9, 3);
    c.fillStyle = "#8a6a3e";
    c.fillRect(-tw / 2 - 10, -30, 12, 5);
  }

  // торс
  const g = c.createLinearGradient(-tw / 2, -28, tw / 2, 4);
  g.addColorStop(0, shade(s.cloth, 1.25));
  g.addColorStop(1, shade(s.cloth, 0.7));
  c.fillStyle = g;
  c.beginPath();
  c.roundRect(-tw / 2, -28, tw, 32, 6 * s.bulk);
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.4)";
  c.lineWidth = 1.5;
  c.stroke();
  if (s.player) {
    c.fillStyle = "#2a2a22";
    c.fillRect(-tw / 2, -2, tw, 4); // ремень
    c.fillStyle = "#c9a54a";
    c.fillRect(2, -2, 3, 4);
    c.strokeStyle = "#3a2a1a";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-tw / 2 + 2, -26);
    c.lineTo(tw / 2 - 2, -4);
    c.stroke();
  } else {
    // рваный край одежды
    c.fillStyle = shade(s.cloth, 0.55);
    c.beginPath();
    c.moveTo(-tw / 2, 0);
    for (let i = 0; i <= 5; i++) c.lineTo(-tw / 2 + (tw / 5) * i, i % 2 ? 6 : 1);
    c.lineTo(tw / 2, 0);
    c.fill();
    c.fillStyle = shade(s.skin, 0.8);
    c.beginPath();
    c.ellipse(3, -14, 3, 4, 0.3, 0, TAU);
    c.fill();
  }
  if (s.brute) {
    // наплечники с шипами
    c.fillStyle = s.level >= 2 ? "#6f7680" : shade(s.cloth, 0.8);
    c.beginPath();
    c.ellipse(0, -26, tw * 0.55, 8, 0, 0, TAU);
    c.fill();
    c.fillStyle = "#d8d0c0";
    for (let i = -1; i <= 1; i++) {
      c.beginPath();
      c.moveTo(i * 8 - 3, -31);
      c.lineTo(i * 8, -42 - (s.level >= 2 ? 4 : 0));
      c.lineTo(i * 8 + 3, -31);
      c.fill();
    }
  }

  // голова
  const hr = (s.brute ? 8 : 9) * (s.player ? 1 : Math.sqrt(s.bulk) * 0.95);
  const hx = 2 + s.hunch * 8;
  const hy = -30 - hr + s.hunch * 6;
  if (s.player) {
    c.fillStyle = "#b8342a"; // шарф
    c.beginPath();
    c.roundRect(-7, -32, 16, 6, 3);
    c.fill();
    c.fillRect(-9, -30, 5, 12);
  }
  c.fillStyle = s.skin;
  c.beginPath();
  c.arc(hx, hy, hr, 0, TAU);
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.4)";
  c.stroke();
  if (s.player) {
    c.fillStyle = "#2f4a4a"; // шапка
    c.beginPath();
    c.arc(hx, hy - 1, hr + 1, Math.PI * 1.02, Math.PI * 2.02);
    c.fill();
    c.fillRect(hx - hr - 1, hy - 3, hr * 2 + 2, 3);
    c.fillStyle = "#3d2b1f";
    c.fillRect(hx - hr, hy - 1, 5, 6);
    c.fillStyle = "#1a1a1a";
    c.fillRect(hx + 4, hy, 2.5, 2.5);
  } else {
    eye(c, hx + hr * 0.5, hy - 1, s.brute ? 2 : 1.8, s.eyes);
    c.fillStyle = "rgba(0,0,0,0.6)";
    c.fillRect(hx + hr * 0.2, hy + hr * 0.45, hr * 0.7, 2);
    if (s.brute && s.level >= 2) {
      c.fillStyle = "#e8dcc0";
      c.beginPath();
      c.moveTo(hx - 3, hy - hr + 2);
      c.quadraticCurveTo(hx - 10, hy - hr - 10, hx - 2, hy - hr - 14);
      c.quadraticCurveTo(hx - 3, hy - hr - 6, hx + 2, hy - hr + 1);
      c.fill();
    }
  }

  // передняя рука
  const atkA = attack === null ? 0 : 2.4 + ease(attack) * 3.2;
  const armA = attack !== null ? atkA : s.player ? swing * 0.7 : -1.45 + Math.cos(t) * 0.15;
  limb(c, 2, -24, 22 * Math.sqrt(s.bulk), 7 * s.bulk, armA, s.player ? shade(s.cloth, 1.05) : s.skin, (cc) => {
    cc.fillStyle = s.player ? "#d9a679" : shade(s.skin, 0.9);
    cc.beginPath();
    cc.arc(0, 2, (s.brute ? 6 : 3.5) * s.bulk * 0.8, 0, TAU);
    cc.fill();
    if (s.player) {
      // мачете
      cc.fillStyle = "#3a2a1a";
      cc.fillRect(-2, -1, 4, 8);
      const bg = cc.createLinearGradient(-4, 0, 4, 0);
      bg.addColorStop(0, "#f2f5f7");
      bg.addColorStop(1, "#8a949c");
      cc.fillStyle = bg;
      cc.beginPath();
      cc.moveTo(-2, 7);
      cc.lineTo(3, 7);
      cc.lineTo(5, 30);
      cc.quadraticCurveTo(1, 35, -2, 30);
      cc.closePath();
      cc.fill();
    } else {
      cc.strokeStyle = "#f0e8d8";
      cc.lineWidth = 1.2;
      for (let i = -1; i <= 1; i++) {
        cc.beginPath();
        cc.moveTo(i * 2, 4);
        cc.lineTo(i * 3, 9);
        cc.stroke();
      }
    }
  });
  c.restore();

  // передняя нога
  limb(c, 3, hipY, 28, legW, -swing, s.pants, boot("#2a2420"));

  // след удара
  if (attack !== null && attack > 0.3 && attack < 0.95) {
    c.save();
    c.translate(0, hipY - 24);
    c.strokeStyle = s.player ? "rgba(255,250,230,0.75)" : s.eyes + "aa";
    c.lineWidth = 5 * (1 - attack) + 2;
    c.lineCap = "round";
    c.beginPath();
    c.arc(4, 4, 34 * Math.sqrt(s.bulk), -1.6, -1.6 + attack * 2.4);
    c.stroke();
    c.restore();
  }
}

/** Четвероногий «бегун» в профиль. */
function drawCrawler(c: Ctx, body: string, eyes: string, level: number, t: number, attack: number | null) {
  const walk = attack === null;
  const lunge = attack !== null ? Math.sin(attack * Math.PI) * 10 : 0;
  const bob = walk ? Math.abs(Math.sin(t * 2)) * 2 : 0;
  const by = -22 - bob;
  const leg = (x: number, phase: number, col: string) => {
    const a = walk ? Math.sin(t + phase) * 0.7 : -0.5;
    limb(c, x, by + 4, 20, 5, a, col, (cc) => {
      cc.fillStyle = "#1c1612";
      cc.fillRect(-2, 0, 6, 3);
    });
  };
  const dark = shade(body, 0.6);
  drawLevelBadges(c, level, -18, -48, eyes);
  leg(-14 + lunge * 0.3, Math.PI, dark);
  leg(12 + lunge, 0, dark);
  c.save();
  c.translate(lunge, 0);
  // хвост
  c.strokeStyle = dark;
  c.lineWidth = 4;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(-24, by - 2);
  c.quadraticCurveTo(-36, by - 12 + Math.sin(t) * 4, -42, by - 4);
  c.stroke();
  const g = c.createLinearGradient(0, by - 12, 0, by + 10);
  g.addColorStop(0, shade(body, 1.3));
  g.addColorStop(1, shade(body, 0.65));
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, by, 27, 10, -0.08, 0, TAU);
  c.fill();
  c.strokeStyle = "rgba(0,0,0,0.4)";
  c.lineWidth = 1.5;
  c.stroke();
  // рёбра
  c.strokeStyle = shade(body, 0.5);
  c.lineWidth = 1.5;
  for (let i = -2; i <= 2; i++) {
    c.beginPath();
    c.moveTo(i * 6, by - 2);
    c.lineTo(i * 6 - 2, by + 6);
    c.stroke();
  }
  // шипы
  c.fillStyle = level >= 2 ? "#e9e0c8" : shade(body, 0.5);
  const spikes = 3 + level * 2;
  for (let i = 0; i < spikes; i++) {
    const x = -20 + (i * 40) / spikes;
    c.beginPath();
    c.moveTo(x - 3, by - 8);
    c.lineTo(x, by - 16 - level * 2);
    c.lineTo(x + 3, by - 8);
    c.fill();
  }
  // голова
  const jaw = attack !== null ? Math.sin(attack * Math.PI) * 0.7 : 0.1;
  c.fillStyle = shade(body, 1.1);
  c.beginPath();
  c.ellipse(28, by - 4, 11, 8, 0.2, 0, TAU);
  c.fill();
  c.save();
  c.translate(30, by + 1);
  c.rotate(jaw);
  c.fillStyle = dark;
  c.beginPath();
  c.ellipse(5, 2, 9, 3.5, 0, 0, TAU);
  c.fill();
  c.restore();
  c.fillStyle = "#f4ecd8";
  for (let i = 0; i < 3; i++) c.fillRect(31 + i * 3, by + 1, 1.5, 3);
  eye(c, 33, by - 7, 2, eyes);
  if (level >= 3) eye(c, 28, by - 9, 1.5, eyes);
  c.restore();
  leg(-10 + lunge * 0.3, 0, body);
  leg(16 + lunge, Math.PI, body);
}

function buildCharacter(scene: Phaser.Scene, key: string, scale: number, draw: (c: Ctx, t: number, atk: number | null) => void) {
  const F = CHAR_FRAME;
  const n = WALK_FRAMES + ATTACK_FRAMES;
  const tex = canvasTex(scene, key, F * n, F, (c) => {
    for (let i = 0; i < n; i++) {
      c.save();
      c.translate(i * F + F / 2, F - 12);
      c.scale(scale, scale);
      if (i < WALK_FRAMES) draw(c, (i / WALK_FRAMES) * TAU, null);
      else draw(c, 0, (i - WALK_FRAMES) / (ATTACK_FRAMES - 1));
      c.restore();
    }
  });
  if (tex) for (let i = 0; i < n; i++) tex.add(i, 0, i * F, 0, F, F);
}

const ENEMY_PALETTES: Record<EnemyKind, { skin: string; cloth: string; eyes: string }[]> = {
  walker: [
    { skin: "#86a86c", cloth: "#55607a", eyes: "#ffe066" },
    { skin: "#6fa092", cloth: "#7a4a36", eyes: "#ff8a3d" },
    { skin: "#9a78b4", cloth: "#2e2a3c", eyes: "#ff3d7a" },
  ],
  runner: [
    { skin: "#c98a44", cloth: "", eyes: "#fff2a0" },
    { skin: "#b8543c", cloth: "", eyes: "#ffb03d" },
    { skin: "#5e4492", cloth: "", eyes: "#7affe1" },
  ],
  brute: [
    { skin: "#8f6f5c", cloth: "#3d4a38", eyes: "#ffcc55" },
    { skin: "#6d7c8c", cloth: "#4a3a2e", eyes: "#ff7a3d" },
    { skin: "#a8443c", cloth: "#2a1e1e", eyes: "#ffd23d" },
  ],
};

function drawLevelBadges(c: Ctx, level: number, x: number, y: number, color: string) {
  c.save();
  c.fillStyle = color; c.globalAlpha = 0.9;
  for (let i=0;i<level;i++) {
    c.beginPath(); c.moveTo(x + i*8, y); c.lineTo(x+4+i*8,y-6); c.lineTo(x+8+i*8,y); c.lineTo(x+4+i*8,y+4); c.closePath(); c.fill();
  }
  c.restore();
}

export function generatePlaceholderTextures(scene: Phaser.Scene) {
  buildCharacter(scene, K.player, 1.2, (c, t, a) =>
    drawHumanoid(c, { skin: "#d9a679", cloth: "#5f6b3a", pants: "#3b4252", accent: "#b8342a", eyes: "#000", bulk: 1, hunch: 0, player: true, level: 1 }, t, a),
  );
  (Object.keys(ENEMY_PALETTES) as EnemyKind[]).forEach((kind) => {
    ENEMY_PALETTES[kind].forEach((p, i) => {
      const level = i + 1;
      const key = enemyTextureKey(kind, level);
      if (kind === "runner") buildCharacter(scene, key, 1.1, (c, t, a) => drawCrawler(c, p.skin, p.eyes, level, t, a));
      else
        buildCharacter(scene, key, kind === "brute" ? 1.15 : 1.15, (c, t, a) =>
          drawHumanoid(
            c,
            { ...p, pants: shade(p.cloth, 0.8), accent: p.eyes, bulk: kind === "brute" ? 1.7 : 1, hunch: kind === "brute" ? 0.35 : 0.55, level, brute: kind === "brute" },
            t,
            a,
          ),
        );
    });
  });

  canvasTex(scene, K.shadow, 64, 24, (c) => {
    const g = c.createRadialGradient(32, 12, 2, 32, 12, 30);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.scale(1, 0.4);
    c.beginPath();
    c.arc(32, 30, 30, 0, TAU);
    c.fill();
  });
  canvasTex(scene, K.particle, 16, 16, (c) => {
    const g = c.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 16, 16);
  });
  canvasTex(scene, K.glow, 256, 256, (c) => {
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(0.4, "rgba(255,255,255,0.3)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
  });
  canvasTex(scene, K.water, 192, 192, (c) => {
    c.fillStyle = "#0f3346";
    c.fillRect(0, 0, 192, 192);
    c.strokeStyle = "rgba(120,190,210,0.18)";
    c.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      const y = 10 + i * 19;
      c.beginPath();
      c.moveTo(0, y);
      c.bezierCurveTo(48, y - 8, 144, y + 8, 192, y);
      c.stroke();
    }
  });
  canvasTex(scene, K.tree, 220, 260, (c) => {
    // layered trunk with roots and bark highlights
    c.shadowColor = "rgba(0,0,0,.35)"; c.shadowBlur = 8;
    c.fillStyle = "#4a3222";
    c.beginPath();
    c.moveTo(80, 205);
    c.lineTo(84, 120);
    c.lineTo(96, 120);
    c.lineTo(102, 205);
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = "rgba(35,22,14,.55)"; c.lineWidth = 3;
    c.beginPath(); c.moveTo(86,205); c.lineTo(88,130); c.moveTo(98,205); c.lineTo(96,125); c.stroke();
    c.strokeStyle = "rgba(180,125,70,.35)"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(90,195); c.lineTo(92,140); c.stroke();
    // отдельные листья и световые пятна
    const blobs: [number, number, number, string][] = [
      [90, 110, 62, "#1f3d26"],
      [60, 95, 44, "#25492c"],
      [122, 92, 46, "#25492c"],
      [90, 68, 50, "#2e5a33"],
      [100, 52, 30, "#3c7040"],
      [72, 60, 24, "#3c7040"],
    ];
    for (const [x, y, r, col] of blobs) {
      const g = c.createRadialGradient(x + r * 0.3, y - r * 0.4, r * 0.1, x, y, r);
      g.addColorStop(0, shade(col, 1.5));
      g.addColorStop(1, col);
      c.fillStyle = g;
      c.beginPath();
      c.arc(x, y, r, 0, TAU);
      c.fill();
      c.fillStyle = "rgba(190,225,120,.16)"; c.beginPath(); c.arc(x-r*.28,y-r*.3,r*.28,0,TAU); c.fill();
    }
    // atmospheric canopy highlights and foreground leaf clusters for depth
    for (let i=0;i<34;i++){ const a=i*TAU/34; const x=90+Math.cos(a)*58; const y=92+Math.sin(a)*48; const rr=7+(i%4)*2; const grad=c.createRadialGradient(x-2,y-3,1,x,y,rr); grad.addColorStop(0,i%3?"#5d9148":"#79aa55"); grad.addColorStop(1,i%2?"#244a2a":"#315f31"); c.fillStyle=grad; c.beginPath(); c.ellipse(x,y,rr,rr*.58,a,0,TAU); c.fill(); }
  });
  canvasTex(scene, K.rock, 110, 78, (c) => {
    const g = c.createLinearGradient(20, 5, 70, 60);
    g.addColorStop(0, "#9aa0a6");
    g.addColorStop(1, "#4b5157");
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(8, 56);
    c.lineTo(14, 26);
    c.lineTo(36, 8);
    c.lineTo(64, 14);
    c.lineTo(82, 40);
    c.lineTo(78, 58);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(30,35,38,.55)"; c.lineWidth = 2; c.stroke();
    c.fillStyle = "rgba(90,130,70,0.6)";
    c.beginPath();
    c.ellipse(38, 14, 14, 5, -0.2, 0, TAU);
    c.fill();
  });
  canvasTex(scene, K.bush, 100, 70, (c) => {
    c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 6;
    for (const [x, y, r] of [
      [24, 34, 18],
      [50, 30, 20],
      [38, 22, 16],
    ] as const) {
      const g = c.createRadialGradient(x + 4, y - 6, 2, x, y, r);
      g.addColorStop(0, "#5c9a4c");
      g.addColorStop(1, "#2c5228");
      c.fillStyle = g;
      c.beginPath();
      c.arc(x, y, r, 0, TAU);
      c.fill();
      c.fillStyle = "rgba(180,225,120,.22)"; c.beginPath(); c.arc(x-4,y-5,r*.25,0,TAU); c.fill();
    }
    c.shadowBlur = 0;
    c.strokeStyle = "rgba(25,55,25,.5)"; c.lineWidth = 2; c.beginPath(); c.moveTo(10,52); c.quadraticCurveTo(48,62,90,48); c.stroke();
  });
  canvasTex(scene, K.campfire, 80, 50, (c) => {
    const glow = c.createRadialGradient(40,24,2,40,24,38); glow.addColorStop(0,"rgba(255,210,90,.32)"); glow.addColorStop(1,"rgba(255,120,30,0)"); c.fillStyle=glow; c.fillRect(0,0,80,50);
    c.fillStyle = "#555a5e";
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU;
      c.beginPath();
      c.ellipse(40 + Math.cos(a) * 28, 28 + Math.sin(a) * 13, 7, 5, 0, 0, TAU);
      c.fill();
    }
    c.strokeStyle = "#4a3020";
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(24, 34);
    c.lineTo(56, 22);
    c.moveTo(24, 22);
    c.lineTo(56, 34);
    c.stroke();
  });
  canvasTex(scene, K.vignette, 1280, 720, (c) => {
    const g = c.createRadialGradient(640, 360, 200, 640, 360, 820);
    g.addColorStop(0, "rgba(10,14,40,0)");
    g.addColorStop(1, "rgba(4,6,22,0.82)");
    c.fillStyle = g;
    c.fillRect(0, 0, 1280, 720);
  });
}

/** Карта острова: песок, трава, тропинки, пятна. Рисуется в половинном масштабе. */
export function generateIsland(scene: Phaser.Scene, radius: number, rng: () => number) {
  if (scene.textures.exists(K.island)) scene.textures.remove(K.island);
  const half = radius + 80;
  const size = half; // canvas = половина мира острова
  canvasTex(scene, K.island, size, size, (c) => {
    const cx = size / 2;
    const R = (a: number, base: number) => base + Math.sin(a * 3) * 10 + Math.sin(a * 7 + 1) * 6 + Math.sin(a * 13) * 3;
    const blob = (base: number, fill: string | CanvasGradient) => {
      c.fillStyle = fill;
      c.beginPath();
      for (let i = 0; i <= 120; i++) {
        const a = (i / 120) * TAU;
        const r = R(a, base);
        c.lineTo(cx + Math.cos(a) * r, cx + Math.sin(a) * r);
      }
      c.fill();
    };
    const r = radius / 2;
    blob(r + 26, "rgba(160,220,230,0.25)");
    const sand = c.createRadialGradient(cx, cx, r * 0.8, cx, cx, r + 16);
    sand.addColorStop(0, "#d8c28a");
    sand.addColorStop(1, "#b89c62");
    blob(r + 14, sand);
    const grass = c.createRadialGradient(cx - r * 0.3, cx - r * 0.3, 20, cx, cx, r);
    grass.addColorStop(0, "#5c8a45");
    grass.addColorStop(1, "#3d6534");
    blob(r - 18, grass);

    // Реальные визуальные биомы: большие нерегулярные пятна на самой суше.
    const biomePatches = [
      { x: 0, y: -0.62, rx: 0.28, ry: 0.18, col: "rgba(70,95,82,0.58)" },   // болота
      { x: 0.46, y: -0.43, rx: 0.25, ry: 0.22, col: "rgba(34,70,43,0.62)" }, // чёрный лес
      { x: 0.66, y: 0, rx: 0.20, ry: 0.28, col: "rgba(130,120,105,0.60)" },   // берег
      { x: 0.42, y: 0.48, rx: 0.27, ry: 0.20, col: "rgba(105,75,65,0.62)" },  // пустоши
      { x: 0, y: 0.64, rx: 0.30, ry: 0.18, col: "rgba(105,130,65,0.58)" },    // поля
      { x: -0.46, y: 0.45, rx: 0.25, ry: 0.20, col: "rgba(50,78,65,0.62)" },  // гниющее болото
      { x: -0.66, y: 0, rx: 0.20, ry: 0.27, col: "rgba(105,96,110,0.60)" },   // руины
      { x: -0.44, y: -0.44, rx: 0.25, ry: 0.22, col: "rgba(82,55,105,0.60)" },// искажённая роща
    ];
    for (const b of biomePatches) {
      const bx = cx + b.x * r, by = cx + b.y * r;
      c.save();
      c.globalAlpha = 1;
      c.fillStyle = b.col;
      c.beginPath();
      for (let j = 0; j <= 32; j++) {
        const a = j * TAU / 32;
        const wobble = 0.82 + Math.sin(a * 5 + b.x * 9) * 0.10 + Math.sin(a * 9) * 0.06;
        const px = bx + Math.cos(a) * r * b.rx * wobble;
        const py = by + Math.sin(a) * r * b.ry * wobble;
        if (j === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
      c.closePath(); c.fill(); c.restore();

      // Уникальные детали каждого биома: деревья, руины, камни, трещины и болотные пятна.
      const seed = Math.abs(Math.floor((b.x + 1.7) * 1000 + (b.y + 1.3) * 777));
      for (let k = 0; k < 70; k++) {
        const a = ((seed + k * 137) % 628) / 100;
        const rr = (0.16 + ((seed + k * 71) % 76) / 100) * Math.min(r * b.rx, r * b.ry);
        const px = bx + Math.cos(a) * rr, py = by + Math.sin(a) * rr;
        c.save();
        if (b.x > 0.3 && b.y < -0.2) {
          c.fillStyle = "rgba(18,45,25,0.72)"; c.beginPath(); c.arc(px,py,18+k%12,0,TAU); c.fill();
          c.fillStyle = "rgba(8,28,15,0.72)"; c.fillRect(px-5,py-34,10,42);
        } else if (b.x < -0.2 && b.y < -0.2) {
          c.strokeStyle = "rgba(92,58,120,0.82)"; c.lineWidth = 8; c.beginPath(); c.moveTo(px-15,py+20); c.quadraticCurveTo(px+20,py,px-4,py-32); c.stroke();
        } else if (b.x < -0.3 && Math.abs(b.y) < 0.2) {
          c.fillStyle = "rgba(58,55,62,0.82)"; c.fillRect(px-26,py-18,52,36);
          c.fillStyle = "rgba(150,140,125,0.5)"; c.fillRect(px-18,py-10,36,7);
        } else if (b.x > 0.5 && Math.abs(b.y) < 0.2) {
          c.fillStyle = "rgba(70,68,63,0.68)"; c.beginPath(); c.arc(px,py,10+k%10,0,TAU); c.fill();
        } else if (b.y > 0.3 && b.x > 0.15) {
          c.strokeStyle = "rgba(55,40,38,0.68)"; c.lineWidth = 5; c.beginPath(); c.moveTo(px-18,py+9); c.lineTo(px+14,py-12); c.stroke();
        } else if (b.y > 0.3 && b.x < -0.15) {
          c.fillStyle = "rgba(26,63,52,0.62)"; c.beginPath(); c.ellipse(px,py,24,10,k,0,TAU); c.fill();
          c.fillStyle = "rgba(83,112,76,0.5)"; c.beginPath(); c.arc(px+6,py-3,6,0,TAU); c.fill();
        } else if (Math.abs(b.x) < 0.2 && b.y > 0.4) {
          c.strokeStyle = "rgba(84,105,40,0.7)"; c.lineWidth = 3; c.beginPath(); c.moveTo(px,py+14); c.lineTo(px-6,py-14); c.stroke();
        } else {
          c.fillStyle = "rgba(116,142,126,0.42)"; c.beginPath(); c.ellipse(px,py,28,12,0,0,TAU); c.fill();
        }
        c.restore();
      }
    }
    // layered shoreline foam and terrain detail
    c.strokeStyle = "rgba(255,245,205,.18)"; c.lineWidth = 5;
    c.beginPath(); for(let i=0;i<=140;i++){const a=i*TAU/140; const rr=r+9+Math.sin(a*9)*4; c.lineTo(cx+Math.cos(a)*rr,cx+Math.sin(a)*rr);} c.stroke();
    // береговая кромка и крупные пятна рельефа
    c.strokeStyle = "rgba(240,220,160,.32)"; c.lineWidth = 10;
    c.beginPath(); for(let i=0;i<=100;i++){const a=i*TAU/100;const rr=r+2+Math.sin(a*5)*5; c.lineTo(cx+Math.cos(a)*rr,cx+Math.sin(a)*rr);} c.stroke();
    for (let i = 0; i < 260; i++) {
      const a = rng() * TAU;
      const d = Math.sqrt(rng()) * (r - 40);
      const rr = 6 + rng() * 26;
      c.fillStyle = rng() > 0.5 ? "rgba(30,60,25,0.25)" : "rgba(130,170,80,0.18)";
      c.beginPath();
      c.ellipse(cx + Math.cos(a) * d, cx + Math.sin(a) * d, rr, rr * 0.6, rng() * 3, 0, TAU);
      c.fill();
    }
    // тропинки к костру
    c.strokeStyle = "rgba(120,95,60,0.45)";
    c.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const a = i * (TAU / 4) + 0.4;
      c.lineWidth = 14;
      c.beginPath();
      c.moveTo(cx, cx);
      c.quadraticCurveTo(cx + Math.cos(a + 0.4) * r * 0.5, cx + Math.sin(a + 0.4) * r * 0.5, cx + Math.cos(a) * (r - 20), cx + Math.sin(a) * (r - 20));
      c.stroke();
    }
    const dirt = c.createRadialGradient(cx, cx, 0, cx, cx, 70);
    dirt.addColorStop(0, "rgba(110,85,55,0.8)");
    dirt.addColorStop(1, "rgba(110,85,55,0)");
    c.fillStyle = dirt;
    c.fillRect(cx - 70, cx - 70, 140, 140);
    // травинки
    c.strokeStyle = "rgba(150,200,100,0.35)";
    c.lineWidth = 1;
    for (let i = 0; i < 1500; i++) {
      const a = rng() * TAU;
      const d = Math.sqrt(rng()) * (r - 30);
      const x = cx + Math.cos(a) * d;
      const y = cx + Math.sin(a) * d;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + (rng() - 0.5) * 3, y - 3 - rng() * 3);
      c.stroke();
    }
  });
}