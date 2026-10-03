import * as Phaser from "phaser";
import { TEXTURE_KEYS as K } from "../assets/manifest";

type Hud = { hp: number; maxHp: number; wave: number; kills: number; alive: number; over: boolean; wood?: number; stone?: number; food?: number; coins?: number; hunger?: number; sanity?: number; day?: number; campLevel?: number; weaponLevel?: number; quest?: { type: string; target: number; progress: number } };
const FONT = { fontFamily: "Georgia, serif", color: "#efe2b8", stroke: "#0a0f18", strokeThickness: 4 };

/** HUD, сенсорный джойстик и кнопка атаки. */
export class UIScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Graphics;
  private info!: Phaser.GameObjects.Text;
  private overBox!: Phaser.GameObjects.Container;
  private menuBox!: Phaser.GameObjects.Container;
  private contextBtn!: Phaser.GameObjects.Container;
  private joyBase!: Phaser.GameObjects.Arc;
  private joyKnob!: Phaser.GameObjects.Arc;
  private joyId: number | null = null;
  private joyOrigin = new Phaser.Math.Vector2();

  constructor() {
    super("UI");
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.add.image(W / 2, H / 2, K.vignette).setDepth(0);
    this.add.text(24, 16, "NEVERENDING", { ...FONT, fontSize: "28px" }).setDepth(10);
    this.hpBar = this.add.graphics().setDepth(10);
    this.info = this.add.text(24, 84, "", { ...FONT, fontFamily: "sans-serif", fontSize: "16px" }).setDepth(10);

    // Боевые действия находятся в отдельной нижней панели: кнопки никогда не перекрываются.
    const combatY = Math.max(110, H - 150);
    this.contextBtn = this.add.container(W - 285, combatY).setSize(210, 62).setDepth(250).setInteractive({ useHandCursor: false });
    const cb=this.add.rectangle(0,0,210,62,0x152b31,.96).setStrokeStyle(3,0xd8b66a,.85).setInteractive({ useHandCursor: false });
    const ct2=this.add.text(0,-7,"",{...FONT,fontFamily:"sans-serif",fontSize:"17px",align:"center"}).setOrigin(.5);
    const hint=this.add.text(0,17,"",{fontFamily:"sans-serif",fontSize:"11px",color:"#a9c3c7"}).setOrigin(.5);
    this.contextBtn.add([cb,ct2,hint]); this.contextBtn.setData("button",cb); this.contextBtn.setData("label",ct2); this.contextBtn.setData("hint",hint);
    const triggerContext = () => { const i = this.input_(); i.context = true; };
    this.contextBtn.on("pointerdown", triggerContext);
    cb.on("pointerdown", triggerContext);

    this.joyBase=this.add.circle(0,0,60,0xffffff,.08).setStrokeStyle(3,0xffffff,.3).setVisible(false).setDepth(200);
    this.joyKnob=this.add.circle(0,0,26,0xffffff,.3).setVisible(false).setDepth(201);
    const atk=this.add.circle(W-82,combatY,58,0xb8342a,.55).setStrokeStyle(4,0xffd27a,.7).setInteractive({ useHandCursor: false }).setDepth(250);
    this.add.text(atk.x,atk.y,"Удар",{...FONT,fontFamily:"sans-serif",fontSize:"20px"}).setOrigin(.5).setDepth(251);
    atk.on("pointerdown",()=>{ this.input_().attack=true; });

    this.input.setTopOnly(false);
    this.input.on("pointerdown",(p:Phaser.Input.Pointer)=>{
      if(p.x<W*.5&&this.joyId===null){this.joyId=p.id;this.joyOrigin.set(p.x,p.y);this.joyBase.setPosition(p.x,p.y).setVisible(true);this.joyKnob.setPosition(p.x,p.y).setVisible(true);}
    });
    this.input.on("pointermove",(p:Phaser.Input.Pointer)=>{
      if(p.id!==this.joyId)return; const v=new Phaser.Math.Vector2(p.x-this.joyOrigin.x,p.y-this.joyOrigin.y); if(v.length()>60)v.setLength(60);
      this.joyKnob.setPosition(this.joyOrigin.x+v.x,this.joyOrigin.y+v.y); const i=this.input_(); i.x=v.x/60;i.y=v.y/60;
    });
    const release=(p:Phaser.Input.Pointer)=>{if(p.id!==this.joyId)return;this.joyId=null;this.joyBase.setVisible(false);this.joyKnob.setVisible(false);const i=this.input_();i.x=0;i.y=0;};
    this.input.on("pointerup",release); this.input.on("pointerupoutside",release);

    const bg=this.add.rectangle(0,0,W,H,0x05060f,.7).setOrigin(0);
    const title2=this.add.text(W/2,H/2-70,"Вы погибли",{...FONT,fontSize:"64px",color:"#ff8a6a"}).setOrigin(.5);
    const stats2=this.add.text(W/2,H/2,"",{...FONT,fontFamily:"sans-serif",fontSize:"22px"}).setOrigin(.5);
    const btn=this.add.rectangle(W/2,H/2+80,240,64,0xb8342a).setStrokeStyle(3,0xffd27a).setInteractive();
    const btnT=this.add.text(btn.x,btn.y,"Заново",{...FONT,fontFamily:"sans-serif",fontSize:"26px"}).setOrigin(.5);
    btn.on("pointerdown",()=>{this.overBox.setVisible(false);this.scene.get("Game").scene.restart();});
    this.overBox=this.add.container(0,0,[bg,title2,stats2,btn,btnT]).setVisible(false).setDepth(400); this.overBox.setData("stats",stats2);
    // Пересчитываем боевую панель при повороте/изменении размера экрана.
    this.scale.on("resize", (size: Phaser.Structs.Size) => {
      const w = size.width, h = size.height, y = Math.max(110, h - 150);
      this.contextBtn.setPosition(Math.max(125, w - 285), y);
      atk.setPosition(Math.max(82, w - 82), y);
      if (w < 560) {
        this.contextBtn.setPosition(Math.max(120, w - 125), Math.max(105, h - 220));
        atk.setPosition(Math.max(70, w - 70), Math.max(95, h - 115));
      }
    });
    this.events.once("shutdown",()=>{});
  }

  private input_() {
    let i = this.registry.get("input") as { x: number; y: number; attack: boolean; context: boolean } | undefined;
    if (!i) {
      i = { x: 0, y: 0, attack: false, context: false };
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
    this.info.setText(`HP ${Math.round(h.hp)}   ·   Голод ${Math.round(h.hunger ?? 100)}   ·   Рассудок ${Math.round(h.sanity ?? 100)}   ·   День ${h.day ?? 1}`);
    if (h.over && !this.overBox.visible) {
      (this.overBox.getData("stats") as Phaser.GameObjects.Text).setText(`Волна ${h.wave} · Убито врагов: ${h.kills}`);
      this.overBox.setVisible(true);
    }
  }
}