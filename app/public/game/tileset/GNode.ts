import { Coordinate } from "../components/Coordinate.js";
import { Wall } from "../components/Wall.js";

export class GNode {
  public walls: Wall[] = [];
  public occupancy: number = 0;
  constructor(public coordinate: Coordinate) {}
}
