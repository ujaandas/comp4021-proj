import { Block } from "../components/Block.js";
import { Tetromino } from "../components/Tetromino.js";
import { Colour } from "../utils/Colour.js";
import { Settings } from "../utils/Settings.js";

export class TetrominoGenerator {
  static createI(): Tetromino {
    const { i, j } = Settings.spawnPoint;
    const blocks = [
      Block.makeBlockOnPoint(i - 1, j),
      Block.makeBlockOnPoint(i, j),
      Block.makeBlockOnPoint(i + 1, j),
      Block.makeBlockOnPoint(i + 2, j),
    ];
    return new Tetromino(blocks, Colour.random());
  }

  static createJ(): Tetromino {
    const { i, j } = Settings.spawnPoint;
    const blocks = [
      Block.makeBlockOnPoint(i - 1, j - 1),
      Block.makeBlockOnPoint(i - 1, j),
      Block.makeBlockOnPoint(i, j),
      Block.makeBlockOnPoint(i + 1, j),
    ];
    return new Tetromino(blocks, Colour.random());
  }

  static createL(): Tetromino {
    const { i, j } = Settings.spawnPoint;
    const blocks = [
      Block.makeBlockOnPoint(i + 1, j - 1),
      Block.makeBlockOnPoint(i - 1, j),
      Block.makeBlockOnPoint(i, j),
      Block.makeBlockOnPoint(i + 1, j),
    ];
    return new Tetromino(blocks, Colour.random());
  }

  static createO(): Tetromino {
    const { i, j } = Settings.spawnPoint;
    const blocks = [
      Block.makeBlockOnPoint(i, j - 1),
      Block.makeBlockOnPoint(i + 1, j - 1),
      Block.makeBlockOnPoint(i, j),
      Block.makeBlockOnPoint(i + 1, j),
    ];
    return new Tetromino(blocks, Colour.random());
  }

  static createS(): Tetromino {
    const { i, j } = Settings.spawnPoint;
    const blocks = [
      Block.makeBlockOnPoint(i, j - 1),
      Block.makeBlockOnPoint(i + 1, j - 1),
      Block.makeBlockOnPoint(i - 1, j),
      Block.makeBlockOnPoint(i, j),
    ];
    return new Tetromino(blocks, Colour.random());
  }

  static createT(): Tetromino {
    const { i, j } = Settings.spawnPoint;
    const blocks = [
      Block.makeBlockOnPoint(i, j - 1),
      Block.makeBlockOnPoint(i - 1, j),
      Block.makeBlockOnPoint(i, j),
      Block.makeBlockOnPoint(i + 1, j),
    ];
    return new Tetromino(blocks, Colour.random());
  }

  static createZ(): Tetromino {
    const { i, j } = Settings.spawnPoint;
    const blocks = [
      Block.makeBlockOnPoint(i - 1, j - 1),
      Block.makeBlockOnPoint(i, j - 1),
      Block.makeBlockOnPoint(i, j),
      Block.makeBlockOnPoint(i + 1, j),
    ];
    return new Tetromino(blocks, Colour.random());
  }

  static getRandomTetromino(): Tetromino {
    const tetrominos = [
      this.createI(),
      this.createJ(),
      this.createL(),
      this.createO(),
      this.createS(),
      this.createT(),
      this.createZ(),
    ];
    return tetrominos[Math.floor(Math.random() * tetrominos.length)];
  }
}
