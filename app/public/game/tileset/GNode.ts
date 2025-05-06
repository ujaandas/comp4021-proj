import { Coordinate } from "../components/Coordinate.js";
import { GEdge } from "./GEdge.js";

export class GNode {
  public walls: GEdge[] = [];
  public occupancy: number = 0;
  constructor(public coordinate: Coordinate) {}
}
