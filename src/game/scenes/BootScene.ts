import Phaser from "phaser";
import { Platform } from "../platform/yandex";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }
  async create() {
    await Platform.init();
    this.scene.start("Preload");
  }
}