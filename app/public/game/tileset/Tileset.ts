import { Block, GhostBlock } from "../components/Block.js";
import { Coordinate } from "../components/Coordinate.js";
import { Wall } from "../components/Wall.js";
import { Settings } from "../utils/Settings.js";
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

  get activeBlock(): Block | null {
    return this.blocks[this.activeBlockIndex] || null;
  }

  get placedBlocks(): Block[] {
    return this._placedBlocks;
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

  private getOccupancy(i: number, j: number): number {
    const key = Coordinate.makeKey(i, j);
    const node = this.adj.get(key);
    return node?.occupancy || 0;
  }

  private getOccupancyKey(key: string): number {
    const node = this.adj.get(key);
    return node?.occupancy || 0;
  }

  private setOccupancy(key: string, occupancy: number): void {
    const node = this.adj.get(key);
    if (node) node.occupancy = occupancy;
  }

  isValidTranslation(i: number, j: number): boolean {
    if (!this.activeBlock) return false;
    const start = this.activeBlock.getPos();
    const startCoord = this.coordinateCache.get(start);
    if (!startCoord) return false;

    const newI = startCoord.i + i;
    const newJ = startCoord.j + j;

    // check that new coord is not on edge
    if (newI <= 0 || newI >= this.width || newJ <= 0 || newJ >= this.height) {
      return false;
    }

    const height = this.activeBlock.walls[0].height;
    const occupancy = this.getOccupancy(newI, newJ);

    return height >= occupancy;
  }

  translateActiveBlock(di: number, dj: number): void {
    if (!this.activeBlock) return;
    if (!this.isValidTranslation(di, dj)) return;
    this.activeBlock.translate(di, dj);

    const start = this.activeBlock.getPos();
    const occupancy = this.getOccupancyKey(start);

    this.activeBlockGhost?.translate(di, dj);
    console.log(`Setting ghost height to ${occupancy}`);
    this.activeBlockGhost?.setHeight(occupancy);
  }

  isValidDrop(n: number): boolean {
    if (!this.activeBlock) return false;
    const projectedKey = this.activeBlock.getPos();
    const projectedNode = this.coordinateCache.get(projectedKey);
    if (!projectedNode) return false;

    const occupancy = this.getOccupancyKey(projectedKey);
    const height = this.activeBlock.walls[0].height - 1;
    console.log(`curr height: ${height} vs occupancy: ${occupancy}`);

    return height >= occupancy;
  }

  dropActiveBlock(n: number): void {
    if (!this.activeBlock) return;
    if (!this.isValidDrop(n)) {
      this.freezeActiveBlock();
      return;
    }

    this.activeBlock.drop(n);
    this.activeBlock.fallCount += n;
  }

  addBlock(block: Block): void {
    this.blocks.push(block);
  }

  freezeActiveBlock(): void {
    this.setNextActiveBlock();
    this.setNextGhostBlock();
  }

  placeBlock(block: Block): void {
    const projectedKey = block.getPos();
    const projectedNode = this.coordinateCache.get(projectedKey);
    if (!projectedNode) return;

    const occupancy = this.getOccupancyKey(projectedKey);

    this.setOccupancy(projectedKey, occupancy + 1);

    console.log(
      `Placed block at ${projectedKey} with occupancy ${occupancy + 1}`
    );

    this._placedBlocks.push(block);
  }

  setNextActiveBlock(): void {
    if (!this.activeBlock) return;
    this.placeBlock(this.activeBlock);
    this.activeBlockIndex++;
  }

  setNextGhostBlock(): void {
    if (!this.activeBlock) return;
    this.activeBlockGhost = new GhostBlock(this.activeBlock);
  }

  play(): void {
    if (!this.activeBlock) return;

    if (this.activeBlock.fallCount < Settings.fallHeight) {
      this.dropActiveBlock(1);
    } else {
      this.setNextActiveBlock();
      this.setNextGhostBlock();
    }
  }
}
