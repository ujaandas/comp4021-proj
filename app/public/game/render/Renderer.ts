import { Block, GhostBlock } from "../components/Block.js";
import { Coordinate } from "../components/Coordinate.js";
import { GhostTetromino, Tetromino } from "../components/Tetromino.js";
import { Wall } from "../components/Wall.js";
import { GNode } from "../tileset/GNode.js";
import { Settings } from "../utils/Settings.js";

export interface RenderableTet {
  tet: Tetromino;
  ghost?: GhostTetromino;
  isActive: boolean;
  depth: number;
}

export class Renderer {
  private tileWidth = 100;
  private tileHeight = 50;
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
    const hOffset = h * this.tileHeight;
    const rotatedI = i * Math.cos(rad) - j * Math.sin(rad);
    const rotatedJ = i * Math.sin(rad) + j * Math.cos(rad);

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

  renderBlock(block: Block, angle: number): void {
    block.walls.forEach((wall) => this.paintWall(wall, angle));
    this.paintLid(block, angle);
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

  private paintWall(wall: Wall, angle: number): void {
    const start = this.gridToScreen(
      wall.start.i,
      wall.start.j,
      wall.height,
      angle
    );
    const end = this.gridToScreen(wall.end.i, wall.end.j, wall.height, angle);

    const gradient = this.ctx.createLinearGradient(
      start.x,
      start.y - Settings.blockHeight,
      start.x,
      start.y
    );
    gradient.addColorStop(0, wall.colour.toString());
    gradient.addColorStop(1, wall.colour.darken(0.8).toString());

    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(start.x, start.y - Settings.blockHeight);
    this.ctx.lineTo(end.x, end.y - Settings.blockHeight);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.closePath();
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    // this.ctx.strokeStyle = wall.colour.darken(0.8).toString();
    // this.ctx.stroke();
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

  getTetDepth(tet: Tetromino, cameraAngle: number): number {
    const depths = tet.pos.map((posKey) => {
      const pos = Coordinate.fromKey(posKey);
      const screenPos = this.gridToScreen(pos.i, pos.j, 0, cameraAngle);
      return screenPos.y;
    });
    return Math.max(...depths);
  }

  renderTets(t: Tetromino[], angle: number): void {
    t.forEach((tet) => {
      this.renderTet(tet, angle);
    });
  }
}
