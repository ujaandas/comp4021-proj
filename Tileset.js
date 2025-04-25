class Tileset {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.adj = new Map();

        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this._addPt(i, j);
            }
        }
    }

    _createKey(i, j) {
        return `${i},${j}`;
    }

    _addPt(i, j) {
        const key = this._createKey(i, j);
        if (!this.adj.has(key)) {
            this.adj.set(key, []);
            console.log(`Added point ${i}, ${j}`);

            const n = [
                [i - 1, j], // top left
                [i, j - 1], // top right
                [i + 1, j], // bottom right
                [i, j + 1]  // bottom left
            ];

            for (const [ni, nj] of n) {
                const nKey = this._createKey(ni, nj);
                if (this.adj.has(nKey)) {
                    this.adj.get(key).push({ i: ni, j: nj });
                    this.adj.get(nKey).push({ i: i, j: j });
                    console.log(`Added edge between (${i}, ${j}) and (${ni}, ${nj})`);
                }
            }
        }
    }
}

