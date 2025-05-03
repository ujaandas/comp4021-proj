import { Settings } from "../utils/Settings.js";
import { Coordinate } from "./Coordinate.js";
import { Wall } from "./Wall.js";

export class Block {
  public get walls(): Wall[] {
    return this._walls;
  }

  public set walls(value: Wall[]) {
    this._walls = value;
  }

  public fallCount: number = 0;

  constructor(private _walls: Wall[]) {
    this._walls = _walls.map((wall) => wall.clone());
  }

  static makeBlockOnPoint(i: number, j: number): Block {
    return new Block([
      new Wall(
        new Coordinate(i - 1, j),
        new Coordinate(i, j),
        3,
        "rgba(255, 0, 0, 1)"
      ),
      new Wall(
        new Coordinate(i, j),
        new Coordinate(i, j - 1),
        3,
        "rgba(255, 0, 0, 1)"
      ),
    ]);
  }

  translate(di: number, dj: number): void {
    this.walls.forEach((wall) => {
      wall.start.i += di;
      wall.start.j += dj;
      wall.end.i += di;
      wall.end.j += dj;
    });
  }

  clone(): Block {
    return new Block(this.walls.map((wall) => wall.clone()));
  }
}

export class GhostBlock extends Block {
  private static readonly TRANSPARENCY = 0.5;

  constructor(public block: Block) {
    super(block.walls.map((wall) => wall.clone()));
    this.applyOffset();
  }

  private applyOffset(): void {
    this.walls.forEach((wall) => {
      wall.height -= Settings.fallHeight;
      wall.colour = GhostBlock.getGhostColor(wall.colour);
    });
  }

  static getGhostColor(color: string): string {
    const match = color.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
    );
    return match
      ? `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${GhostBlock.TRANSPARENCY})`
      : color;
  }
}
