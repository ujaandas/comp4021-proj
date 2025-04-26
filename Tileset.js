class Coordinate {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.key = `${i},${j}`;
    }

}

class Wall {
    constructor(a, b) {
        this.start = a;
        this.end = b;
        this.drawn = false;
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

    _getKey(i, j) {
        return `${i},${j}`;
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
            [i, j + 1]  // bottom left
        ];

        for (const [ni, nj] of n) {
            const nCoord = new Coordinate(ni, nj);
            if (!this.adj.has(nCoord.key)) continue;

            const wall = new Wall(coord, nCoord);
            
            // graph is DIRECTED now, feels more sensible? better vibes ig 
            this.adj.get(coord.key).push(wall);
            console.log(`Added edge between (${i}, ${j}) and (${ni}, ${nj})`);
        }

    }

    // given a tile coordinate (ie; (2,2)), return the indices of neighbors with valid, drawable walls
    // tileset class should NEVER deal with screen coordinates, only tileset (ie; i, j) domain
    getDrawableWalls(i, j) {

    }
}

