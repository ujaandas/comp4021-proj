import { Block, GhostBlock } from "./Block.js";

export class Tetromino {
  public fallCount: number = 0;
  public heights: number[] = [];

  constructor(public blocks: Block[]) {
    this.heights = this.blocks.map((block) => block.height);
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

  get pos(): string[] {
    return this.blocks.map((block) => block.pos);
  }

  clone(): Tetromino {
    const clonedBlocks = this.blocks.map((block) => block.clone());
    return new Tetromino(clonedBlocks);
  }
}

export class GhostTetromino extends Tetromino {
  constructor(tetromino: Tetromino, ghostHeight: number = 0) {
    const ghostBlocks = tetromino.blocks.map(
      (block) => new GhostBlock(block, ghostHeight)
    );
    super(ghostBlocks);
  }

  setHeight(newHeight: number): void {
    this.blocks.forEach((block) => {
      if (block instanceof GhostBlock) {
        block.setHeight(newHeight);
      }
    });
  }
}
