import { Block } from "../components/Block.js";
import { Tetromino } from "../components/Tetromino.js";
import { Colour } from "./Colour.js";
import { Settings } from "./Settings.js";

export class TetrominoGenerator {
  static createI(): Tetromino {
    const { i, j } = Settings.spawnPoint;
    const blocks = [
      Block.makeBlockOnPoint(i, j),
      Block.makeBlockOnPoint(i, j, 1),
      Block.makeBlockOnPoint(i, j, 2),
    ];
    return new Tetromino(blocks, Colour.random(), "I");
  }

  static createJ(): Tetromino {
    const { i, j } = Settings.spawnPoint;
    const blocks = [
      Block.makeBlockOnPoint(i, j - 1),
      Block.makeBlockOnPoint(i, j),
      Block.makeBlockOnPoint(i, j, 1),
      Block.makeBlockOnPoint(i, j, 2),
    ];
    return new Tetromino(blocks, Colour.random(), "J");
  }

  static createL(): Tetromino {
    const { i, j } = Settings.spawnPoint;
    const blocks = [
      Block.makeBlockOnPoint(i - 1, j),
      Block.makeBlockOnPoint(i, j),
      Block.makeBlockOnPoint(i, j, 1),
      Block.makeBlockOnPoint(i, j, 2),
    ];
    return new Tetromino(blocks, Colour.random(), "L");
  }

  static createO(): Tetromino {
    const { i, j } = Settings.spawnPoint;
    const blocks = [
      Block.makeBlockOnPoint(i, j - 1),
      Block.makeBlockOnPoint(i + 1, j - 1),
      Block.makeBlockOnPoint(i, j),
      Block.makeBlockOnPoint(i + 1, j),
    ];
    return new Tetromino(blocks, Colour.random(), "O");
  }

  static createS(): Tetromino {
    const { i, j } = Settings.spawnPoint;
    const blocks = [
      Block.makeBlockOnPoint(i, j - 1),
      Block.makeBlockOnPoint(i + 1, j - 1),
      Block.makeBlockOnPoint(i - 1, j),
      Block.makeBlockOnPoint(i, j),
    ];
    return new Tetromino(blocks, Colour.random(), "S");
  }

  static createT(): Tetromino {
    const { i, j } = Settings.spawnPoint;
    const blocks = [
      Block.makeBlockOnPoint(i, j),
      Block.makeBlockOnPoint(i, j, 1),
      Block.makeBlockOnPoint(i + 1, j, 1),
      Block.makeBlockOnPoint(i, j + 1, 1),
    ];
    return new Tetromino(blocks, Colour.random(), "T");
  }

  static createZ(): Tetromino {
    const { i, j } = Settings.spawnPoint;
    const blocks = [
      Block.makeBlockOnPoint(i - 1, j - 1),
      Block.makeBlockOnPoint(i, j - 1),
      Block.makeBlockOnPoint(i, j),
      Block.makeBlockOnPoint(i + 1, j),
    ];
    return new Tetromino(blocks, Colour.random(), "Z");
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
