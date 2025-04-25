class Tileset {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.adj = new Map();

        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.addPt(i, j);
            }
        }
    }

    _createKey(i, j) {
        return `${i},${j}`;
    }

    addPt(i, j) {
        const key = this._createKey(i, j);
        if (!this.adj.has(key)) {
            this.adj.set(key, []);
            console.log(`Added point ${i}, ${j}`);

            const neighbors = [
                [i - 1, j], // left
                [i + 1, j], // right
                [i, j - 1], // top
                [i, j + 1]  // bottom
            ];

            for (const [ni, nj] of neighbors) {
                const neighborKey = this._createKey(ni, nj);
                if (this.adj.has(neighborKey)) {
                    this.adj.get(key).push({ i: ni, j: nj });
                    this.adj.get(neighborKey).push({ i: i, j: j });
                    console.log(`Added edge between (${i}, ${j}) and (${ni}, ${nj})`);
                }
            }
        }
    }
}

