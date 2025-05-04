import { Block, GhostBlock } from "../components/Block.js";
import { Wall } from "../components/Wall.js";
import { GNode } from "../tileset/GNode.js";
import { Settings } from "../utils/Settings.js";

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
        const start = this.gridToScreen(
          edge.start.i,
          edge.start.j,
          edge.height,
          angle
        );
        const end = this.gridToScreen(
          edge.end.i,
          edge.end.j,
          edge.height,
          angle
        );
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();
      });
    });
  }

  renderBlock(block: Block, angle: number): void {
    block.walls.forEach((wall) => this.paintWall(wall, angle));
  }

  renderBlockAndGhost(block: Block, angle: number, ghost?: GhostBlock): void {
    this.renderBlock(block, angle);
    if (!ghost) return;
    this.renderBlock(ghost, angle);
  }

  private paintWall(wall: Wall, angle: number): void {
    const start = this.gridToScreen(
      wall.start.i,
      wall.start.j,
      wall.height,
      angle
    );
    const end = this.gridToScreen(wall.end.i, wall.end.j, wall.height, angle);

    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(start.x, start.y - Settings.blockHeight);
    this.ctx.lineTo(end.x, end.y - Settings.blockHeight);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.closePath();
    this.ctx.fillStyle = wall.colour;
    this.ctx.fill();
  }
}
