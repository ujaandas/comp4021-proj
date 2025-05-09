import { Coordinate } from "../components/Coordinate.js";
import { GEdge } from "./GEdge.js";

export class GNode {
  public walls: GEdge[] = [];
  public occupancy: Map<number, boolean> = new Map();
  constructor(public coordinate: Coordinate) {}

  getOccupancyAtHeight(height: number): boolean {
    return this.occupancy.get(height) || false;
  }

  setOccupiedAtHeight(height: number): void {
    this.occupancy.set(height, true);
  }

  clearOccupancyAtHeight(height: number): void {
    this.occupancy.set(height, false);
  }
}
