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
    this.initializeCoordinates();
    this.buildWalls();
  }

  private initializeCoordinates(): void {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.addPoint(i, j);
      }
    }
  }

  private getOrCreateCoordinate(i: number, j: number): Coordinate {
    const key = Coordinate.makeKey(i, j);
    if (!this.coordinateCache.has(key)) {
      this.coordinateCache.set(key, new Coordinate(i, j));
    }
    return this.coordinateCache.get(key)!;
  }

  private addPoint(i: number, j: number): void {
    const coord = this.getOrCreateCoordinate(i, j);
    if (!this.adj.has(coord.key)) {
      this.adj.set(coord.key, new GNode(coord));
    }
  }

  private buildWalls(): void {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.addWallsForNode(i, j);
      }
    }
  }

  private addWallsForNode(i: number, j: number): void {
    const neighborDeltas = [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
    ];

    const currentKey = Coordinate.makeKey(i, j);
    const currentNode = this.adj.get(currentKey);
    if (!currentNode) return;

    neighborDeltas.forEach(([dx, dy]) => {
      const ni = i + dx;
      const nj = j + dy;
      if (this.isTileOutOfBounds(ni, nj)) return;

      const neighborKey = Coordinate.makeKey(ni, nj);
      const neighborNode = this.adj.get(neighborKey);
      if (neighborNode) {
        this.createWallsBetweenNodes(currentNode, neighborNode);
      }
    });
  }

  private createWallsBetweenNodes(nodeA: GNode, nodeB: GNode): void {
    const wall = new Wall(nodeA.coordinate, nodeB.coordinate, { height: 0 });
    const reverseWall = new Wall(nodeB.coordinate, nodeA.coordinate, {
      height: 0,
    });

    nodeA.walls.push(wall);
    nodeB.walls.push(reverseWall);
  }

  private isTileOutOfBounds(i: number, j: number): boolean {
    return i < 0 || i >= this.width || j < 0 || j >= this.height;
  }

  private isBlockOutOfBounds(i: number, j: number): boolean {
    return i <= 0 || i >= this.width || j <= 0 || j >= this.height;
  }

  private getOccupancy(i: number, j: number): number {
    const key = Coordinate.makeKey(i, j);
    return this.getOccupancyByKey(key);
  }

  private getOccupancyByKey(key: string): number {
    const node = this.adj.get(key);
    return node?.occupancy || 0;
  }

  private setOccupancy(key: string, occupancy: number): void {
    const node = this.adj.get(key);
    if (node) {
      node.occupancy = occupancy;
    }
  }

  isValidTranslation(i: number, j: number): boolean {
    if (!this.activeBlock) return false;

    const startKey = this.activeBlock.getPos();
    const startCoord = this.coordinateCache.get(startKey);
    if (!startCoord) return false;

    const newI = startCoord.i + i;
    const newJ = startCoord.j + j;

    if (this.isBlockOutOfBounds(newI, newJ)) return false;

    const height = this.activeBlock.walls[0].height;
    const occupancy = this.getOccupancy(newI, newJ);

    return height >= occupancy;
  }

  translateActiveBlock(di: number, dj: number): void {
    if (!this.activeBlock || !this.isValidTranslation(di, dj)) return;

    this.activeBlock.translate(di, dj);

    const startKey = this.activeBlock.getPos();
    const occupancy = this.getOccupancyByKey(startKey);

    if (this.activeBlockGhost) {
      this.activeBlockGhost.translate(di, dj);
      this.activeBlockGhost.setHeight(occupancy);
    }
  }

  isValidDrop(n: number): boolean {
    if (!this.activeBlock) return false;

    const projectedKey = this.activeBlock.getPos();
    const projectedNode = this.coordinateCache.get(projectedKey);
    if (!projectedNode) return false;

    const occupancy = this.getOccupancyByKey(projectedKey);
    const height = this.activeBlock.walls[0].height - 1;

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
    const occupancy = this.getOccupancyByKey(projectedKey);

    this.setOccupancy(projectedKey, occupancy + 1);
    this._placedBlocks.push(block);
  }

  private setNextActiveBlock(): void {
    if (!this.activeBlock) return;
    this.placeBlock(this.activeBlock);
    this.activeBlockIndex++;
  }

  private setNextGhostBlock(): void {
    if (this.activeBlock) {
      this.activeBlockGhost = new GhostBlock(this.activeBlock);
    }
  }

  init(): void {
    this.setNextGhostBlock();
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
