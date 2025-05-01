class Coordinate {
  private _i: number;
  private _j: number;

  constructor(i: number, j: number) {
    this._i = i;
    this._j = j;
  }

  get i() {
    return this._i;
  }

  set i(value: number) {
    this._i = value;
  }

  get j() {
    return this._j;
  }

  set j(value: number) {
    this._j = value;
  }

  get key() {
    return `${this._i},${this._j}`;
  }
}

class Wall {
  private _start: Coordinate;
  private _end: Coordinate;
  private _h: number;
  private _colour: string;
  private _drawn: boolean;

  constructor(a: Coordinate, b: Coordinate, h: number, col: string) {
    this._start = a;
    this._end = b;
    this._h = h;
    this._colour = col;
    this._drawn = false;
  }

  get start() {
    return this._start;
  }

  set start(value: Coordinate) {
    this._start = value;
  }

  get end() {
    return this._end;
  }

  set end(value: Coordinate) {
    this._end = value;
  }

  clone() {
    return new Wall(
      new Coordinate(this.start.i, this.start.j),
      new Coordinate(this.end.i, this.end.j),
      0,
      this._colour
    );
  }
}

class Tileset {
  private _tileW: number;

  private _adj: Map<string, Wall[]>;

  constructor(w: number, h: number) {
    this._adj = new Map();
    this._tileW = 100;

    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        this._addPt(i, j);
      }
    }
  }

  get adj() {
    return this._adj;
  }

  _addPt(i: number, j: number) {
    const coord = new Coordinate(i, j);
    if (this._adj.has(coord.key)) throw new Error("Coordinate already exists!");

    this._adj.set(coord.key, []);
    console.log(`Added point ${i}, ${j}`);

    const n = [
      [i - 1, j], // top left
      [i, j - 1], // top right
      [i + 1, j], // bottom right
      [i, j + 1], // bottom left
    ];

    for (const [ni, nj] of n) {
      const nCoord = new Coordinate(ni, nj);
      if (!this._adj.has(nCoord.key)) continue;

      const wall = new Wall(coord, nCoord, 0, "black");
      const wallR = new Wall(nCoord, coord, 0, "black");

      this._adj.get(coord.key)?.push(wall);
      this._adj.get(nCoord.key)?.push(wallR);

      console.log(`Added edge between (${i}, ${j}) and (${ni}, ${nj})`);
    }
  }
}
