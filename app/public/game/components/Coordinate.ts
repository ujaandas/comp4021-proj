export class Coordinate {
  constructor(public i: number, public j: number) {}

  static makeKey(i: number, j: number): string {
    return `${i},${j}`;
  }

  get key(): string {
    return Coordinate.makeKey(this.i, this.j);
  }
}
