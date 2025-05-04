import { Block, GhostBlock } from "../components/Block.js";
import { Coordinate } from "../components/Coordinate.js";
import { Wall } from "../components/Wall.js";
import { GNode } from "./GNode.js";

export class Tileset {
  public adj: Map<string, GNode> = new Map();
  private coordinateCache: Map<string, Coordinate> = new Map();
  private blocks: Block[] = [];
  private _placedBlocks: Block[] = [];
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
    this.buildWalls();
  }

  private getOrCreateCoordinate(i: number, j: number): Coordinate {
    const key = Coordinate.makeKey(i, j);
    if (!this.coordinateCache.has(key)) {
      const coord = new Coordinate(i, j);
      this.coordinateCache.set(key, coord);
    }
    return this.coordinateCache.get(key)!;
  }

  private addPoint(i: number, j: number): void {
    const coord = this.getOrCreateCoordinate(i, j);
    if (this.adj.has(coord.key)) return;
    const node = new GNode(coord);
    this.adj.set(coord.key, node);
  }

  private buildWalls(): void {
    const neighborDeltas = [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
    ];

    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        const currentKey = Coordinate.makeKey(i, j);
        const currentNode = this.adj.get(currentKey);
        if (!currentNode) continue;

        neighborDeltas.forEach(([dx, dy]) => {
          const ni = i + dx;
          const nj = j + dy;
          if (ni < 0 || ni >= this.width || nj < 0 || nj >= this.height) return;
          const neighborKey = Coordinate.makeKey(ni, nj);
          const neighborNode = this.adj.get(neighborKey);
          if (neighborNode) {
            const wall = new Wall(
              currentNode.coordinate,
              neighborNode.coordinate,
              { height: 0 }
            );
            currentNode.walls.push(wall);
            const reverseWall = new Wall(
              neighborNode.coordinate,
              currentNode.coordinate,
              { height: 0 }
            );
            neighborNode.walls.push(reverseWall);
          }
        });
      }
    }
  }

  isValidTranslation(i: number, j: number): boolean {
    if (!this.activeBlock) return false;
    const start = this.activeBlock.getStart();
    const startCoord = this.coordinateCache.get(start);
    if (!startCoord) return false;

    const newI = startCoord.i + i;
    const newJ = startCoord.j + j;

    // check that new coord is not on edge
    if (newI <= 0 || newI >= this.width || newJ <= 0 || newJ >= this.height) {
      return false;
    }
    // todo: check that new coord is not occupied
    return true;
  }

  translateActiveBlock(di: number, dj: number): void {
    if (!this.activeBlock) return;
    if (!this.isValidTranslation(di, dj)) return;
    this.activeBlock.translate(di, dj);
    this.activeBlockGhost?.translate(di, dj);
  }

  addBlock(block: Block): void {
    this.blocks.push(block);
    if (!this.activeBlockGhost) {
      this.activeBlockGhost = new GhostBlock(block);
    }
  }

  placeBlock(block: Block): void {
    this._placedBlocks.push(block);
  }

  get activeBlock(): Block | null {
    return this.blocks[this.activeBlockIndex] || null;
  }

  get placedBlocks(): Block[] {
    return this._placedBlocks;
  }

  setNextActiveBlock(): void {
    if (this.activeBlock) {
      this.placeBlock(this.activeBlock);
      this.activeBlockIndex++;
    }
  }

  setNextGhostBlock(): void {
    if (this.activeBlock) {
      this.activeBlockGhost = new GhostBlock(this.activeBlock);
    }
  }
}
