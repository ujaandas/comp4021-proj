import { Colour } from "../utils/Colour.js";
import { Settings } from "../utils/Settings.js";
import { Coordinate } from "./Coordinate.js";

export class Wall {
  public height: number;
  public colour: Colour;

  constructor(
    public start: Coordinate,
    public end: Coordinate,
    height?: number,
    colour?: Colour
  ) {
    this.height = Settings.fallHeight + (height ?? 0);
    this.colour = colour ?? Colour.getColour("red");
  }

  get angle(): number {
    return Math.atan2(this.end.j - this.start.j, this.end.i - this.start.i);
  }

  clone(): Wall {
    return new Wall(
      new Coordinate(this.start.i, this.start.j),
      new Coordinate(this.end.i, this.end.j),
      this.height - Settings.fallHeight,
      this.colour
    );
  }
}
