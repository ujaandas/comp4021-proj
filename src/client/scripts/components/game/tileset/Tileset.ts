import { Block, GhostBlock } from "../components/Block.js";
import { Coordinate } from "../components/Coordinate.js";
import { GhostTetromino, Tetromino } from "../components/Tetromino.js";
import { Settings } from "../utils/Settings.js";
import { GEdge } from "./GEdge.js";
import { GNode } from "./GNode.js";

export class Tileset {
  public adj: Map<string, GNode> = new Map();
  private score = 0;
  private coordinateCache: Map<string, Coordinate> = new Map();
  private blocks: Block[] = [];
  private tets: Tetromino[] = [];
  private _placedBlocks: Block[] = [];
  private activeBlockIndex: number = 0;
  private activeTetIndex: number = 0;
  public activeBlockGhost: GhostBlock | null = null;
  public activeTetGhost: GhostTetromino | null = null;

  private updateTilesetCallback: (block: Block) => void;
  private updateScoreCallback: (score: number) => void;
  private sendLayersCallback: (clearable: number) => void;
  private gameoverCallback: () => void;

  constructor(
    private gameW: number,
    private gameH: number,
    updateTilesetCallback: (block: Block) => void,
    updateScoreCallback: (score: number) => void,
    sendLayersCallback: (clearable: number) => void,
    gameoverCallback: () => void
  ) {
    this.initializeGraph();
    this.updateTilesetCallback = updateTilesetCallback;
    this.updateScoreCallback = updateScoreCallback;
    this.sendLayersCallback = sendLayersCallback;
    this.gameoverCallback = gameoverCallback;
  }

  public static serialize(tileset: Tileset): string {
    const data = {
      gameW: tileset.gameW,
      gameH: tileset.gameH,
      adj: Array.from(tileset.adj.entries()),
      score: tileset.score,
      coordinateCache: Array.from(tileset.coordinateCache.entries()),
      blocks: tileset.blocks,
      tets: tileset.tets,
      placedBlocks: tileset._placedBlocks,
      activeBlockIndex: tileset.activeBlockIndex,
      activeTetIndex: tileset.activeTetIndex,
      activeBlockGhost: tileset.activeBlockGhost,
      activeTetGhost: tileset.activeTetGhost,
    };

    return JSON.stringify(data);
  }

  public static deserialize(
    serialized: string,
    updateTilesetCallback: () => void,
    updateScoreCallback: (score: number) => void,
    sendLayersCallback: (clearable: number) => void,
    gameoverCallback: () => void
  ): Tileset {
    const data = JSON.parse(serialized);

    const tileset = new Tileset(
      data.gameW,
      data.gameH,
      updateTilesetCallback,
      updateScoreCallback,
      sendLayersCallback,
      gameoverCallback
    );

    tileset.adj = new Map(data.adj);
    tileset.score = data.score;
    tileset.coordinateCache = new Map(data.coordinateCache);
    tileset.blocks = data.blocks;
    tileset.tets = data.tets;
    tileset._placedBlocks = data.placedBlocks;
    tileset.activeBlockIndex = data.activeBlockIndex;
    tileset.activeTetIndex = data.activeTetIndex;
    tileset.activeBlockGhost = data.activeBlockGhost;
    tileset.activeTetGhost = data.activeTetGhost;

    return tileset;
  }

  private initializeGraph(): void {
    this.initializeCoordinates();
    this.buildWalls();
  }

  private initializeCoordinates(): void {
    for (let i = 0; i < this.gameW; i++) {
      for (let j = 0; j < this.gameH; j++) {
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
    for (let i = 0; i < this.gameW; i++) {
      for (let j = 0; j < this.gameH; j++) {
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
    return i < 0 || i >= this.gameW || j < 0 || j >= this.gameH;
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

  playTetMode(): boolean {
    if (!this.activeTet) return false;

    if (this.activeTet.fallCount < Settings.fallHeight) {
      this.dropActiveTet(1);
    } else {
      this.setNextActiveTet();
      this.setNextGhostTet();
    }

    return true;
  }

  private isBlockOutOfBounds(i: number, j: number): boolean {
    return i <= 0 || i >= this.gameW || j <= 0 || j >= this.gameH;
  }

  private isOccupiedAtHeight(i: number, j: number, height: number): boolean {
    const key = Coordinate.makeKey(i, j);
    return this.isOccupiedAtKeyAtHeight(key, height);
  }

  private isOccupiedAtKeyAtHeight(key: string, height: number): boolean {
    const node = this.adj.get(key);
    if (!node) return false;
    return node.getOccupancyAtHeight(height);
  }

  private getFirstValidHeight(key: string): number {
    const node = this.adj.get(key);
    let height = 10;

    while (height > 0 && !node?.getOccupancyAtHeight(height - 1)) {
      height--;
    }

    return height;
  }

  isValidActvBlockTranslation(i: number, j: number): boolean {
    if (!this.activeBlock) return false;

    const startKey = this.activeBlock.pos;
    const startCoord = this.coordinateCache.get(startKey);
    if (!startCoord) return false;

    const newI = startCoord.i + i;
    const newJ = startCoord.j + j;

    if (this.isBlockOutOfBounds(newI, newJ)) return false;

    const height = this.activeBlock.height;
    const occupied = this.isOccupiedAtHeight(newI, newJ, height);

    return occupied;
  }

  isValidBlockTranslation(block: Block, i: number, j: number): boolean {
    if (!block) return false;

    const startKey = block.pos;
    const startCoord = this.coordinateCache.get(startKey);
    if (!startCoord) return false;

    const newI = startCoord.i + i;
    const newJ = startCoord.j + j;

    if (this.isBlockOutOfBounds(newI, newJ)) return false;

    const height = block.height;
    const occupied = this.isOccupiedAtHeight(newI, newJ, height);

    return !occupied;
  }

  isValidTetTranslation(di: number, dj: number): boolean {
    if (!this.activeTet) return false;

    const blocks = this.activeTet.blocks;
    const areValidTranslation = blocks.map((block) => {
      return this.isValidBlockTranslation(block, di, dj);
    });

    return areValidTranslation.every((isValid) => isValid);
  }

  // isValidTetTranslation(di: number, dj: number): boolean {
  //   if (!this.activeTet) return false;

  //   const posKeys = this.activeTet.pos;
  //   const posCoords = posKeys.map((key) => this.coordinateCache.get(key));

  //   const newPosCoords = posCoords.map((coord) => {
  //     if (!coord) return null;
  //     const newI = coord.i + di;
  //     const newJ = coord.j + dj;

  //     if (this.isBlockOutOfBounds(newI, newJ)) return null;

  //     return this.getOrCreateCoordinate(newI, newJ);
  //   });

  //   if (newPosCoords.some((coord) => !coord)) return false;

  // check if bumping into other blocks
  // how? for each block, get the occupancy of the new position
  // if another block is at the same height or higher, return false

  // const occupancies = newPosCoords.map((coord, index) => {
  //   if (!coord) return 0;
  //   return this.getFirstValidHeight(
  //     Coordinate.makeKey(coord.i, coord.j),
  //     this.activeTet?.heights[index]!
  //   );
  // });

  // const heights = this.activeTet.heights;

  // console.log(`My heights: ${heights}`);

  // const isValid = heights.every((height, index) => {
  //   return height >= occupancies[index];
  // });

  // return isValid;
  // }

  translateActiveBlock(di: number, dj: number): void {
    if (!this.activeBlock || !this.isValidActvBlockTranslation(di, dj)) return;

    this.activeBlock.translate(di, dj);

    const startKey = this.activeBlock.pos;
    const height = this.activeBlock.height;
    const occupied = this.isOccupiedAtKeyAtHeight(startKey, height);

    if (this.activeBlockGhost && !occupied) {
      this.activeBlockGhost.translate(di, dj);
      this.activeBlockGhost.setHeight(height + 1);
    }
  }

  translateActiveTet(di: number, dj: number): void {
    if (!this.activeTet || !this.isValidTetTranslation(di, dj)) return;

    this.activeTet.translate(di, dj);

    const startKeys = this.activeTet.pos;
    const occupied = startKeys.map((key) => {
      return this.getFirstValidHeight(key);
    });

    const maxOccupancy = Math.max(...occupied);

    if (this.activeTetGhost) {
      this.activeTetGhost.translate(di, dj);
      this.activeTetGhost.setHeight(maxOccupancy);
    }
  }

  quickDropActiveTet(): void {
    if (!this.activeTet) return;

    while (this.dropActiveTet(1)) {}
  }

  isValidActvBlockDrop(n: number): boolean {
    if (!this.activeBlock) return false;

    const projectedKey = this.activeBlock.pos;
    const projectedNode = this.coordinateCache.get(projectedKey);
    if (!projectedNode) return false;

    const height = this.activeBlock.height - n;

    if (this.isBlockOutOfBounds(projectedNode.i, projectedNode.j)) {
      return false;
    }

    if (height < 0) return false;

    return this.isOccupiedAtKeyAtHeight(projectedKey, height);
  }

  isValidBlockDrop(block: Block, n: number): boolean {
    if (!block) return false;

    const projectedKey = block.pos;
    const projectedNode = this.coordinateCache.get(projectedKey);
    if (!projectedNode) return false;

    const height = block.height - n;

    if (this.isBlockOutOfBounds(projectedNode.i, projectedNode.j)) {
      console.log("oob");
      return false;
    }

    if (height < 0) {
      return false;
    }

    const occupied = this.isOccupiedAtKeyAtHeight(projectedKey, height);
    if (occupied) {
      console.log("occupied");
      return false;
    }

    return true;
  }

  isValidTetDrop(n: number): boolean {
    if (!this.activeTet) return false;

    const blocks = this.activeTet.blocks;
    const areValidDrops = blocks.map((block) => {
      return this.isValidBlockDrop(block, n);
    });

    return areValidDrops.every((isValid) => isValid);
  }

  dropActiveBlock(n: number): void {
    if (!this.activeBlock) return;

    if (!this.isValidActvBlockDrop(n)) {
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

  addTets(tets: Tetromino[]): void {
    this.tets.push(...tets);
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
    const height = block.height;
    const occupancy = this.isOccupiedAtKeyAtHeight(projectedKey, height);

    if (height == Settings.fallHeight) {
      console.log("Game Over");
      this.gameoverCallback();
      return;
    }

    const node = this.adj.get(projectedKey);
    if (node) {
      node.setOccupiedAtHeight(height);
      this._placedBlocks.push(block);
      this.updateTilesetCallback(block);
      console.log(`Placed block at (${block.pos}) with height ${block.height}`);
    }
  }

  isLayerClearable(layer: number): boolean {
    const uniquePositions = new Set<string>();

    // filter placed blocks to find those on the specified layer
    const thisLayerBlocks = this._placedBlocks.filter((block) => {
      const occupancyHere = this.isOccupiedAtKeyAtHeight(block.pos, layer);

      if (occupancyHere && !uniquePositions.has(block.pos)) {
        uniquePositions.add(block.pos);
        return true;
      }
      return false;
    });

    console.log(
      `Blocks on layer ${layer}: ${Array.from(uniquePositions).map(
        (pos) => `(${pos})`
      )}`
    );

    return (
      Array.from(uniquePositions).length >= (this.gameH - 1) * (this.gameW - 1)
    );
  }

  areAnyLayersClearable(): number {
    // find highest layer
    const maxHeight = Math.max(
      ...this._placedBlocks.map((block) => block.height)
    );

    // check if any layer is clearable
    for (let i = 0; i <= maxHeight; i++) {
      if (this.isLayerClearable(i)) {
        return i;
      }
    }

    return -1;
  }

  private clearLayer(layer: number): void {
    console.log(`Clearing layer ${layer}`);
    console.log(`Placed blocks before: ${this._placedBlocks.length}`);

    const updatedBlocks: Block[] = [];

    this._placedBlocks.forEach((block) => {
      if (block.height === layer) {
        const node = this.adj.get(block.pos);
        if (node) {
          node.clearOccupancyAtHeight(layer);
        }
      } else {
        updatedBlocks.push(block);
      }
    });

    this._placedBlocks = updatedBlocks;

    console.log(`Placed blocks after: ${this._placedBlocks.length}`);
  }

  placeTet(tet: Tetromino): void {
    const projectedKeys = tet.pos;

    projectedKeys.forEach((_, index) => {
      this.placeBlock(tet.blocks[index]);
      this.score += 10 * (index + 1);
    });

    const clearable = this.areAnyLayersClearable();

    if (clearable !== -1) {
      this.clearLayer(clearable);
      this.score += 100 * (clearable + 1);
      this.sendLayersCallback(clearable);
    }

    this.updateScoreCallback(this.score);
  }

  getRenderableBlocks(): Block[] {
    return this._placedBlocks.map((block) => block.clone());
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
    const firstValidHeight = this.getFirstValidHeight(start!);
    if (this.activeBlock) {
      this.activeBlockGhost = new GhostBlock(
        this.activeBlock,
        firstValidHeight
      );
    }
  }

  private setNextGhostTet(): void {
    if (!this.activeTet) return;
    const start = this.activeTet?.pos;

    const lowestHeights = start.map((key) => {
      return this.getFirstValidHeight(key);
    });

    const lowestHeight = Math.max(...lowestHeights);

    if (this.activeTet) {
      this.activeTetGhost = new GhostTetromino(this.activeTet, lowestHeight);
    }
  }

  set placedBlocks(blocks: Block[]) {
    this._placedBlocks = blocks;
  }

  set activeTet(tet: Tetromino) {
    this.activeTet = tet;
    this.activeTetIndex = 0;
  }
}
