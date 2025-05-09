import { Colour } from "../utils/Colour.js";
import { Block, GhostBlock } from "./Block.js";
import { Wall } from "./Wall.js";

export class Tetromino {
  public fallCount: number = 0;
  public heights: number[] = [];

  constructor(
    public blocks: Block[],
    public colour: Colour,
    public style?: string
  ) {
    this.heights = this.blocks.map((block) => block.height);
    this.blocks.map((block) => {
      block.colour = this.colour;
    });
  }

  getLidIndices(): number[] {
    return this.blocks.map((block, index) => {
      return index;
    });
  }

  translate(di: number, dj: number): void {
    this.blocks.forEach((block) => {
      block.translate(di, dj);
    });
  }

  drop(n = 1): void {
    this.blocks.forEach((block) => {
      block.drop(n);
      block.fallCount += n;
    });
    this.fallCount += n;
    this.heights = this.blocks.map((block) => block.height);
  }

  rotate(
    angle: number,
    origin?: { i: number; j: number; height: number }
  ): void {
    if (!origin) {
      let points: { x: number; y: number; z: number }[] = [];
      this.blocks.forEach((block) => {
        block.walls.forEach((wall) => {
          points.push({ x: wall.start.i, y: wall.start.j, z: wall.height });
          points.push({ x: wall.end.i, y: wall.end.j, z: wall.height });
        });
      });
      const sum = points.reduce(
        (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y, z: acc.z + p.z }),
        { x: 0, y: 0, z: 0 }
      );
      origin = {
        i: sum.x / points.length,
        j: sum.y / points.length,
        height: sum.z / points.length,
      };
    }

    const origin3D = { x: origin.i, y: origin.j, z: origin.height };

    this.blocks.forEach((block) => block.rotate(angle, origin3D));
  }

  get pos(): string[] {
    return this.blocks.map((block) => block.pos);
  }

  get walls(): Wall[] {
    return this.blocks.flatMap((block) => block.walls);
  }

  clone(colour?: Colour): Tetromino {
    const clonedBlocks = this.blocks.map((block) => block.clone());
    return new Tetromino(clonedBlocks, colour || this.colour);
  }
}

export class GhostTetromino extends Tetromino {
  constructor(tetromino: Tetromino, ghostHeight: number = 0) {
    const ghostBlocks = tetromino.blocks.map(
      (block) => new GhostBlock(block, ghostHeight)
    );
    super(ghostBlocks, GhostBlock.getGhostColour(tetromino.colour));
  }

  setHeight(newHeight: number): void {
    this.blocks.forEach((block) => {
      if (block instanceof GhostBlock) {
        block.setHeight(newHeight);
      }
    });
  }
}
