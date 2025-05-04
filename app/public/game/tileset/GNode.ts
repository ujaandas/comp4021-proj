import { Coordinate } from "../components/Coordinate.js";
import { Wall } from "../components/Wall.js";

export class GNode {
  public walls: Wall[] = [];
  constructor(public coordinate: Coordinate) {}
}
