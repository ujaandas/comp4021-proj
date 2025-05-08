export class Settings {
  static readonly mapWidth = 5;
  static readonly mapHeight = 5;
  static readonly spawnPoint = {
    i: Math.floor(this.mapWidth / 2),
    j: Math.floor(this.mapHeight / 2),
  };
  static readonly gameWidthOffset = 0;
  static readonly gameHeightOffset = 0;
  static readonly blockHeight = 50;
  static readonly fallHeight = 5;
  static readonly fallDelay = 1000;
  static readonly initialAngle = 225;
}
