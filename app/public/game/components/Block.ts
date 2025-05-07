import { Colour } from "../utils/Colour.js";
import { Coordinate } from "./Coordinate.js";
import { Wall } from "./Wall.js";

export class Block {
  public fallCount: number = 0;
  public colour: Colour = Colour.getColour("red");
  public height: number;

  constructor(private _walls: Wall[]) {
    this.height = Math.min(...this._walls.map((wall) => wall.height));
    this._walls.map((wall) => {
      wall.colour = this.colour;
    });
  }

  public get walls(): Wall[] {
    return this._walls;
  }

  public set walls(value: Wall[]) {
    this._walls = value;
  }

  static makeBlockOnPoint(
    i: number,
    j: number,
    height?: number,
    colour?: Colour
  ): Block {
    return new Block([
      new Wall(new Coordinate(i - 1, j), new Coordinate(i, j), height, colour),
      new Wall(new Coordinate(i, j), new Coordinate(i, j - 1), height, colour),
      new Wall(
        new Coordinate(i, j - 1),
        new Coordinate(i - 1, j - 1),
        height,
        colour
      ),
      new Wall(
        new Coordinate(i - 1, j - 1),
        new Coordinate(i - 1, j),
        height,
        colour
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

  drop(n = 1): void {
    this.walls.forEach((wall) => {
      wall.height -= n;
    });
    this.fallCount += n;
    this.height = Math.min(...this.walls.map((wall) => wall.height));
  }

  rotate(angle: number, origin: { x: number; y: number; z: number }): void {
    this.walls.forEach((wall) => {
      const rotatedStart = Coordinate.rotatePoint(
        { x: wall.start.i, y: wall.start.j, z: wall.height },
        angle,
        origin
      );
      const rotatedEnd = Coordinate.rotatePoint(
        { x: wall.end.i, y: wall.end.j, z: wall.height },
        angle,
        origin
      );

      wall.start.i = Math.round(rotatedStart.x);
      wall.start.j = Math.round(rotatedStart.y);

      wall.height = (rotatedStart.z + rotatedEnd.z) / 2;

      wall.end.i = Math.round(rotatedEnd.x);
      wall.end.j = Math.round(rotatedEnd.y);
    });
  }

  clone(): Block {
    return new Block(this.walls.map((wall) => wall.clone()));
  }

  get pos(): string {
    if (this.walls.length === 4) {
      return this.walls[1].start.key;
    }
    return this.walls[0].start.key;
  }
}

export class GhostBlock extends Block {
  private static readonly TRANSPARENCY = 0.5;

  constructor(public block: Block, private newHeight: number = 0) {
    super(block.walls.map((wall) => wall.clone()));
    this.applyOffset();
  }

  private applyOffset(): void {
    this.walls.forEach((wall) => {
      wall.height = this.newHeight;
      wall.colour = GhostBlock.getGhostColour(wall.colour);
    });
  }

  setHeight(n: number): void {
    this.walls.forEach((wall) => {
      wall.height = n;
    });
  }

  static getGhostColour(colour: Colour): Colour {
    return colour.withAlpha(GhostBlock.TRANSPARENCY);
  }
}
