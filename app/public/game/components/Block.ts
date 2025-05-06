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
      new Wall(new Coordinate(i - 1, j), new Coordinate(i, j), {
        colour: "rgba(255, 0, 0, 1)",
      }),
      new Wall(new Coordinate(i, j), new Coordinate(i, j - 1), {
        colour: "rgba(255, 0, 0, 1)",
      }),
      new Wall(new Coordinate(i, j - 1), new Coordinate(i - 1, j - 1), {
        colour: "rgba(255, 0, 0, 1)",
      }),
      new Wall(new Coordinate(i - 1, j - 1), new Coordinate(i - 1, j), {
        colour: "rgba(255, 0, 0, 1)",
      }),
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

  drop(n = 1): void {
    this.walls.forEach((wall) => {
      wall.height -= n;
    });
  }

  clone(): Block {
    return new Block(this.walls.map((wall) => wall.clone()));
  }

  getPos(): string {
    if (this.walls.length === 4) {
      return this.walls[1].start.key;
    }
    return this.walls[0].start.key;
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
      wall.height = 0;
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
