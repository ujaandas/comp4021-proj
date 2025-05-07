import { Coordinate } from "../components/Coordinate.js";

export class GEdge {
  constructor(public start: Coordinate, public end: Coordinate) {
    this.start = start;
    this.end = end;
  }
}
