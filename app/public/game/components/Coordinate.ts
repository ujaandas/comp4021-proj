export class Coordinate {
  constructor(public i: number, public j: number) {}

  get key(): string {
    return `${this.i},${this.j}`;
  }
}
