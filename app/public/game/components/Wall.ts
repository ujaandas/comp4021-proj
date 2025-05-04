import { Settings } from "../utils/Settings.js";
import { Coordinate } from "./Coordinate.js";

export class Wall {
  constructor(
    public start: Coordinate,
    public end: Coordinate,
    options?: { height?: number; colour?: string }
  ) {
    this.height = options?.height ?? Settings.fallHeight;
    this.colour = options?.colour ?? "rgba(0, 0, 0, 1)";
  }

  height: number;
  colour: string;

  clone(): Wall {
    return new Wall(
      new Coordinate(this.start.i, this.start.j),
      new Coordinate(this.end.i, this.end.j),
      { height: this.height, colour: this.colour }
    );
  }
}
