import { Coordinate } from "./Coordinate.js";

export class Wall {
  constructor(
    public start: Coordinate,
    public end: Coordinate,
    public h: number,
    public colour: string = "black"
  ) {}

  clone(): Wall {
    return new Wall(
      new Coordinate(this.start.i, this.start.j),
      new Coordinate(this.end.i, this.end.j),
      this.h,
      this.colour
    );
  }
}
