import { Block, GhostBlock } from "../components/Block.js";
import { Coordinate } from "../components/Coordinate.js";
import { Wall } from "../components/Wall.js";

export class Tileset {
  public adj: Map<string, Wall[]> = new Map();
  private blocks: Block[] = [];
  private placedBlocks: Block[] = [];
  private activeBlockIndex: number = 0;
  public activeBlockGhost: GhostBlock | null = null;

  constructor(private width: number, private height: number) {
    this.initializeGraph();
  }

  private initializeGraph(): void {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.addPoint(i, j);
      }
    }
  }

  private addPoint(i: number, j: number): void {
    const coord = new Coordinate(i, j);
    if (this.adj.has(coord.key)) return;

    this.adj.set(coord.key, []);
    const neighbors = [
      [i - 1, j],
      [i, j - 1],
      [i + 1, j],
      [i, j + 1],
    ];

    neighbors.forEach(([ni, nj]) => {
      const neighborCoord = new Coordinate(ni, nj);
      if (this.adj.has(neighborCoord.key)) {
        const wall = new Wall(coord, neighborCoord, { height: 0 });
        const reverseWall = new Wall(neighborCoord, coord, { height: 0 });
        this.adj.get(coord.key)?.push(wall);
        this.adj.get(neighborCoord.key)?.push(reverseWall);
      }
    });
  }

  addBlock(block: Block): void {
    this.blocks.push(block); // todo: replace with algo to find matching edges and "activate" them
    if (!this.activeBlockGhost) {
      this.activeBlockGhost = new GhostBlock(block);
    }
  }

  placeBlock(block: Block): void {
    this.placedBlocks.push(block);
  }

  get activeBlock(): Block | null {
    return this.blocks[this.activeBlockIndex] || null;
  }

  setNextActiveBlock(): void {
    this.activeBlockIndex++;
  }

  setNextGhostBlock(): void {
    if (this.activeBlock) {
      this.activeBlockGhost = new GhostBlock(this.activeBlock);
    }
  }
}
