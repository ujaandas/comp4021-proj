class Coordinate {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.key = `${i},${j}`;
  }
}

class Wall {
  constructor(a, b, col) {
    this.start = a;
    this.end = b;
    this.col = col;
    this.drawn = false;
  }
  clone() {
    return new Wall(
      new Coordinate(this.start.i, this.start.j),
      new Coordinate(this.end.i, this.end.j),
      this.col
    );
  }
}

class Tileset {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.adj = new Map();

    this.tileWidth = 100;
    this.tileHeight = this.tileWidth / 2;

    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        this._addPt(i, j);
      }
    }
  }

  _addPt(i, j) {
    const coord = new Coordinate(i, j);
    if (this.adj.has(coord.key)) throw new Error("Coordinate already exists!");

    this.adj.set(coord.key, []);
    console.log(`Added point ${i}, ${j}`);

    const n = [
      [i - 1, j], // top left
      [i, j - 1], // top right
      [i + 1, j], // bottom right
      [i, j + 1], // bottom left
    ];

    for (const [ni, nj] of n) {
      const nCoord = new Coordinate(ni, nj);
      if (!this.adj.has(nCoord.key)) continue;

      const wall = new Wall(coord, nCoord);
      const wallR = new Wall(nCoord, coord);

      this.adj.get(coord.key).push(wall);
      this.adj.get(nCoord.key).push(wallR);

      console.log(`Added edge between (${i}, ${j}) and (${ni}, ${nj})`);
    }
  }

  drawWall(a, b) {
    const keyA = `${i1},${j1}`;
    const keyB = `${i2},${j2}`;

    if (this.adj.has(keyA)) {
      const walls = this.adj.get(keyA);
      for (const wall of walls) {
        // todo: bfs/dfs
        if (
          (wall.coordA.key === keyA && wall.coordB.key === keyB) ||
          (wall.coordA.key === keyB && wall.coordB.key === keyA)
        ) {
          wall.drawn = true;
          return;
        }
      }
    }
  }

  // given a tile coordinate (ie; (2,2)), return the indices of neighbors with valid, drawable walls
  // tileset class should NEVER deal with screen coordinates, only tileset (ie; i, j) domain
  getDrawableWalls(i, j) {
    const cellKey = `${i},${j}`;
    const walls = this.adj.get(cellKey) || [];
    return walls.filter((wall) => !wall.drawn);
  }
}
