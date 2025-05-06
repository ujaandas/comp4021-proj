import { Block, GhostBlock } from "./Block.js";

export class Tetromino {
  public fallCount: number = 0;
  public height: number = 0;

  constructor(public blocks: Block[]) {
    this.height = Math.min(
      ...this.blocks.map((block) => block.walls[0].height)
    );
  }

  translate(di: number, dj: number): void {
    this.blocks.forEach((block) => {
      block.translate(di, dj);
    });
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
