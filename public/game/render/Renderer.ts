import { Block, GhostBlock } from "../components/Block.js";
import { GhostTetromino, Tetromino } from "../components/Tetromino.js";
import { Wall } from "../components/Wall.js";
import { GNode } from "../tileset/GNode.js";
import { Settings } from "../utils/Settings.js";

type RenderItem =
  | { depth: number; key: string; type: "wall"; wall: Wall }
  | { depth: number; key: string; type: "lid"; block: Block };

export class Renderer {
  private tileWidth = Settings.tileWidth;
  private tileHeight = Settings.tileHeight;
  private originX: number;
  private originY: number;

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D
  ) {
    this.originX = canvas.width / 2 + Settings.gameWidthOffset;
    this.originY = canvas.height / 2 + Settings.gameHeightOffset;
  }

  private gridToScreen(
    i: number,
    j: number,
    h: number,
    angle: number
  ): { x: number; y: number } {
    const rad = (angle * Math.PI) / 180;
    const hOffset = h * this.tileHeight - 100;
    const translatedI = i - Settings.mapWidth / 2;
    const translatedJ = j - Settings.mapHeight / 2;

    const rotatedI = translatedI * Math.cos(rad) - translatedJ * Math.sin(rad);
    const rotatedJ = translatedI * Math.sin(rad) + translatedJ * Math.cos(rad);

    const x = ((rotatedI - rotatedJ) * this.tileWidth) / 2;
    const y =
      ((rotatedI + rotatedJ) * this.tileHeight) / 2 - this.tileHeight - hOffset;

    return { x: this.originX + x, y: this.originY + y };
  }

  renderTiles(adj: Map<string, GNode>, angle: number): void {
    adj.forEach((edges, key) => {
      const [i, j] = key.split(",").map(Number);
      const point = this.gridToScreen(i, j, 0, angle);
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillText(`${i},${j}`, point.x + 4, point.y - 4);

      edges.walls.forEach((edge) => {
        const start = this.gridToScreen(edge.start.i, edge.start.j, 0, angle);
        const end = this.gridToScreen(edge.end.i, edge.end.j, 0, angle);
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();
      });
    });
  }

  private computeTileDepth(i: number, j: number, angle: number): number {
    const rad = (angle * Math.PI) / 180;
    const translatedI = i - Settings.mapWidth / 2;
    const translatedJ = j - Settings.mapHeight / 2;
    const rotatedI = translatedI * Math.cos(rad) - translatedJ * Math.sin(rad);
    const rotatedJ = translatedI * Math.sin(rad) + translatedJ * Math.cos(rad);
    return rotatedI + rotatedJ;
  }

  private computeCoordinateDepth(wall: Wall, angle: number): number {
    const depthStart = this.computeTileDepth(wall.start.i, wall.start.j, angle);
    const depthEnd = this.computeTileDepth(wall.end.i, wall.end.j, angle);
    return Math.max(depthStart, depthEnd);
  }

  private computeLidDepth(block: Block, angle: number): number {
    if (block.walls.length < 4) {
      return 0;
    }
    let sum = 0;
    for (let i = 0; i < 4; i++) {
      sum += this.computeTileDepth(
        block.walls[i].start.i,
        block.walls[i].start.j,
        angle
      );
    }
    const avg = sum / 4;
    return avg + 0.5;
  }

  renderWalls2(
    blocks: Block[],
    activeTet: Tetromino | null,
    ghostTet: GhostTetromino | null,
    angle: number
  ): void {
    const renderItems: RenderItem[] = [];

    const addBlock = (block: Block) => {
      block.walls.forEach((wall) => {
        renderItems.push({
          depth: this.computeCoordinateDepth(wall, angle),
          key: wall.key,
          type: "wall",
          wall,
        });
      });
      if (block.walls.length >= 4) {
        renderItems.push({
          depth: this.computeLidDepth(block, angle),
          key: `lid-${block.walls[0].key}`,
          type: "lid",
          block,
        });
      }
    };

    blocks.forEach((block) => addBlock(block));
    if (activeTet) {
      activeTet.blocks.forEach((block) => addBlock(block));
    }
    if (ghostTet) {
      ghostTet.blocks.forEach((block) => addBlock(block));
    }

    const EPSILON = 0.001;
    renderItems.sort((a, b) => {
      const depthDiff = a.depth - b.depth;
      if (Math.abs(depthDiff) < EPSILON) {
        return a.key.localeCompare(b.key);
      }
      return depthDiff;
    });

    renderItems.forEach((item) => {
      if (item.type === "wall") {
        this.paintWall(item.wall, angle);
      } else if (item.type === "lid") {
        this.paintLid(item.block, angle);
      }
    });
  }

  paintWall(wall: Wall, angle: number): void {
    const start = this.gridToScreen(
      wall.start.i,
      wall.start.j,
      wall.height,
      angle
    );
    const end = this.gridToScreen(wall.end.i, wall.end.j, wall.height, angle);

    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(start.x, start.y - Settings.tileHeight);
    this.ctx.lineTo(end.x, end.y - Settings.tileHeight);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.closePath();
    this.ctx.fillStyle = wall.colour.toString();
    this.ctx.fill();

    this.ctx.strokeStyle = wall.colour.darken(0.8).toString();
    this.ctx.stroke();
  }

  private paintLid(block: Block, angle: number): void {
    if (!block.walls.length || block.walls.length < 4) return;
    this.ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const pt = this.gridToScreen(
        block.walls[i].start.i,
        block.walls[i].start.j,
        block.walls[i].height + 1,
        angle
      );
      this.ctx.lineTo(pt.x, pt.y);
    }
    this.ctx.closePath();
    this.ctx.fillStyle = block.walls[0].colour.toString();
    this.ctx.fill();
    // this.ctx.strokeStyle = block.walls[0].colour.darken(0.8).toString();
    // this.ctx.stroke();
  }

  renderBlock(block: Block, angle: number): void {
    block.walls.forEach((wall) => {
      this.paintWall(wall, angle);
    });
    this.paintLid(block, angle);
  }

  renderBlockWalls(block: Block, angle: number): void {
    const blockWalls = block.walls;
    this.renderWalls(blockWalls, angle);
    this.paintLid(block, angle);
  }

  renderBlocks(blocks: Block[], angle: number): void {
    blocks.forEach((block) => this.renderBlock(block, angle));
  }

  renderTet(tet: Tetromino, angle: number): void {
    tet.blocks.forEach((block) => this.renderBlock(block, angle));
  }

  renderBlockAndGhost(block: Block, angle: number, ghost?: GhostBlock): void {
    this.renderBlock(block, angle);
    if (!ghost) return;
    this.renderBlock(ghost, angle);
  }

  renderTetAndGhost(
    tet: Tetromino,
    angle: number,
    ghost?: GhostTetromino
  ): void {
    this.renderTet(tet, angle);
    if (!ghost) return;
    this.renderTet(ghost, angle);
  }

  renderWalls(walls: Wall[], angle: number): void {
    walls.forEach((wall) => this.paintWall(wall, angle));
  }

  renderTetAndGhostWalls(
    tet: Tetromino,
    angle: number,
    ghost?: GhostTetromino
  ): void {
    const tetWalls = tet.blocks.flatMap((block) => block.walls);
    this.renderWalls(tetWalls, angle);
    if (!ghost) return;
    const ghostWalls = ghost.blocks.flatMap((block) => block.walls);
    this.renderWalls(ghostWalls, angle);
  }
}
