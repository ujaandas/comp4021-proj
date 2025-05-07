import { Block, GhostBlock } from "../components/Block.js";
import { Coordinate } from "../components/Coordinate.js";
import { GhostTetromino, Tetromino } from "../components/Tetromino.js";
import { Wall } from "../components/Wall.js";
import { Settings } from "../utils/Settings.js";
import { GEdge } from "./GEdge.js";
import { GNode } from "./GNode.js";

export class Tileset {
  public adj: Map<string, GNode> = new Map();
  private coordinateCache: Map<string, Coordinate> = new Map();
  private blocks: Block[] = [];
  private tets: Tetromino[] = [];
  private _placedBlocks: Block[] = [];
  private _placedTets: Tetromino[] = [];
  private activeBlockIndex: number = 0;
  private activeTetIndex: number = 0;
  public activeBlockGhost: GhostBlock | null = null;
  public activeTetGhost: GhostTetromino | null = null;

  constructor(private width: number, private height: number) {
    this.initializeGraph();
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
    const wall = new GEdge(nodeA.coordinate, nodeB.coordinate);
    const reverseWall = new GEdge(nodeB.coordinate, nodeA.coordinate);

    nodeA.walls.push(wall);
    nodeB.walls.push(reverseWall);
  }

  private isTileOutOfBounds(i: number, j: number): boolean {
    return i < 0 || i >= this.width || j < 0 || j >= this.height;
  }

  get activeBlock(): Block | null {
    return this.blocks[this.activeBlockIndex] || null;
  }

  get activeTet(): Tetromino | null {
    return this.tets[this.activeTetIndex] || null;
  }

  get placedBlocks(): Block[] {
    return this._placedBlocks;
  }

  get placedTets(): Tetromino[] {
    return this._placedTets;
  }

  initBlockMode(): void {
    this.setNextGhostBlock();
  }

  initTetMode(): void {
    this.setNextGhostTet();
  }

  playBlockMode(): void {
    if (!this.activeBlock) return;

    if (this.activeBlock.fallCount < Settings.fallHeight) {
      this.dropActiveBlock(1);
    } else {
      this.setNextActiveBlock();
      this.setNextGhostBlock();
    }
  }

  playTetMode(): void {
    if (!this.activeTet) return;

    if (this.activeTet.fallCount < Settings.fallHeight) {
      this.dropActiveTet(1);
    } else {
      this.setNextActiveTet();
      this.setNextGhostTet();
    }
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
      console.log(
        `Setting occupancy for ${key} from ${node.occupancy} to ${occupancy}`
      );
      node.occupancy = occupancy;
    }
  }

  isValidBlockTranslation(i: number, j: number): boolean {
    if (!this.activeBlock) return false;

    const startKey = this.activeBlock.pos;
    const startCoord = this.coordinateCache.get(startKey);
    if (!startCoord) return false;

    const newI = startCoord.i + i;
    const newJ = startCoord.j + j;

    if (this.isBlockOutOfBounds(newI, newJ)) return false;

    const height = this.activeBlock.height;
    const occupancy = this.getOccupancy(newI, newJ);

    return height >= occupancy;
  }

  // isValidTetTranslation(i: number, j: number): boolean {
  //   if (!this.activeTet) return false;

  //   const startKeys = this.activeTet.pos;
  //   const startCoords = startKeys.map((key) => this.coordinateCache.get(key));
  //   if (startCoords.some((coord) => !coord)) return false;

  //   return startCoords.every((coord, index) => {
  //     const newI = coord!.i + i;
  //     const newJ = coord!.j + j;

  //     if (this.isBlockOutOfBounds(newI, newJ)) return false;

  //     // const height = this.activeTet?.height || 0;
  //     const height = this.activeTet?.blocks[index].height || 0;
  //     const relHeight = height - Settings.fallHeight;
  //     const occupancy = this.getOccupancy(newI, newJ);
  //     console.log(
  //       `@${newI}, ${newJ} - Height: ${relHeight}, Occupancy: ${occupancy}`
  //     );

  //     return relHeight >= occupancy;
  //   });
  // }

  isValidTetTranslation(di: number, dj: number): boolean {
    if (!this.activeTet) return false;

    const posKeys = this.activeTet.pos;
    const posCoords = posKeys.map((key) => this.coordinateCache.get(key));

    const newPosCoords = posCoords.map((coord) => {
      if (!coord) return null;
      const newI = coord.i + di;
      const newJ = coord.j + dj;

      if (this.isBlockOutOfBounds(newI, newJ)) return null;

      return this.getOrCreateCoordinate(newI, newJ);
    });

    if (newPosCoords.some((coord) => !coord)) return false;

    // check if bumping into other blocks
    // how? for each block, get the occupancy of the new position
    // if another block is at the same height or higher, return false

    const occupancies = newPosCoords.map((coord) => {
      if (!coord) return 0;
      return this.getOccupancy(coord.i, coord.j);
    });

    const heights = this.activeTet.heights;

    console.log(`My heights: ${heights}`);

    const isValid = heights.every((height, index) => {
      return height >= occupancies[index];
    });

    return isValid;
  }

  translateActiveBlock(di: number, dj: number): void {
    if (!this.activeBlock || !this.isValidBlockTranslation(di, dj)) return;

    this.activeBlock.translate(di, dj);

    const startKey = this.activeBlock.pos;
    const occupancy = this.getOccupancyByKey(startKey);

    if (this.activeBlockGhost) {
      this.activeBlockGhost.translate(di, dj);
      this.activeBlockGhost.setHeight(occupancy);
    }
  }

  translateActiveTet(di: number, dj: number): void {
    if (!this.activeTet || !this.isValidTetTranslation(di, dj)) return;

    this.activeTet.translate(di, dj);

    const startKeys = this.activeTet.pos;
    const occupancies = startKeys.map((key) => this.getOccupancyByKey(key));
    const maxOccupancy = Math.max(...occupancies);

    if (this.activeTetGhost) {
      this.activeTetGhost.translate(di, dj);
      this.activeTetGhost.setHeight(maxOccupancy);
    }
  }

  quickDropActiveTet(): void {
    if (!this.activeTet) return;

    while (this.dropActiveTet(1)) {}
  }

  isValidBlockDrop(n: number): boolean {
    if (!this.activeBlock) return false;

    const projectedKey = this.activeBlock.pos;
    const projectedNode = this.coordinateCache.get(projectedKey);
    if (!projectedNode) return false;

    const occupancy = this.getOccupancyByKey(projectedKey);
    const height = this.activeBlock.height - n;

    return height >= occupancy;
  }

  isValidTetDrop(n: number): boolean {
    if (!this.activeTet) return false;

    const projectedKeys = this.activeTet.pos;
    const occupancies = projectedKeys.map((key) => this.getOccupancyByKey(key));

    return this.activeTet.blocks.every((block, index) => {
      const height = block.height - n;
      return height >= occupancies[index];
    });
  }

  dropActiveBlock(n: number): void {
    if (!this.activeBlock) return;

    if (!this.isValidBlockDrop(n)) {
      this.freezeActiveBlock();
      return;
    }

    this.activeBlock.drop(n);
  }

  dropActiveTet(n: number): boolean {
    if (!this.activeTet) return false;

    if (!this.isValidTetDrop(n)) {
      this.freezeActiveTet();
      return false;
    }

    this.activeTet.drop(n);
    return true;
  }

  public spinActiveTet(angle: number): void {
    if (!this.activeTet) return;

    const projectedKeys = this.activeTet.pos;
    const projectedNodes = projectedKeys
      .map((key) => this.coordinateCache.get(key))
      .filter((node) => node !== undefined);

    if (projectedNodes.length === 0) return;

    const blockHeights = this.activeTet.blocks.map((block) => block.height);
    const maxHeight = Math.max(...blockHeights);
    const maxHeightIndex = blockHeights.indexOf(maxHeight);

    const pivotNode = projectedNodes[maxHeightIndex]!;
    const pivot = {
      i: pivotNode.i,
      j: pivotNode.j,
      height: maxHeight,
    };

    this.activeTet.rotate(angle, pivot);
    this.spinGhostTet(angle, pivot);
  }

  private spinGhostTet(
    angle: number,
    pivot: { i: number; j: number; height: number }
  ): void {
    if (!this.activeTetGhost) return;

    const projectedKeys = this.activeTetGhost.pos;
    const projectedNodes = projectedKeys
      .map((key) => this.coordinateCache.get(key))
      .filter((node) => node !== undefined);

    if (projectedNodes.length !== projectedKeys.length) return;

    this.activeTetGhost.rotate(angle, pivot);
  }

  addBlock(block: Block): void {
    this.blocks.push(block);
  }

  addTet(tet: Tetromino): void {
    this.tets.push(tet);
  }

  freezeActiveBlock(): void {
    this.setNextActiveBlock();
    this.setNextGhostBlock();
  }

  freezeActiveTet(): void {
    this.setNextActiveTet();
    this.setNextGhostTet();
  }

  placeBlock(block: Block): void {
    const projectedKey = block.pos;
    const occupancy = this.getOccupancyByKey(projectedKey);

    this.setOccupancy(projectedKey, occupancy + 1);
    this._placedBlocks.push(block);
  }

  placeTet(tet: Tetromino): void {
    const projectedKeys = tet.pos;
    console.log(`Tet keys: ${projectedKeys}`);

    projectedKeys.forEach((key, index) => {
      this.placeBlock(tet.blocks[index]);
    });

    this._placedTets.push(tet);
  }

  private setNextActiveBlock(): void {
    if (!this.activeBlock) return;
    this.placeBlock(this.activeBlock);
    this.activeBlockIndex++;
  }

  private setNextActiveTet(): void {
    if (!this.activeTet) return;
    this.placeTet(this.activeTet);
    this.activeTetIndex++;
  }

  private setNextGhostBlock(): void {
    if (!this.activeBlock) return;
    const start = this.activeBlock?.pos;
    const occupancy = this.getOccupancyByKey(start!);
    if (this.activeBlock) {
      this.activeBlockGhost = new GhostBlock(this.activeBlock, occupancy);
    }
  }

  private setNextGhostTet(): void {
    if (!this.activeTet) return;
    const start = this.activeTet?.pos;
    const occupancies = start!.map((key) => this.getOccupancyByKey(key));
    const maxOccupancy = Math.max(...occupancies);
    if (this.activeTet) {
      this.activeTetGhost = new GhostTetromino(this.activeTet, maxOccupancy);
    }
  }
}
