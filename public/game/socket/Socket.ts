import { io, Socket } from "socket.io-client";
import { Tetromino } from "../components/Tetromino.js";
import { Block } from "../components/Block.js";

export class MultiplayerSocket {
  private socket: Socket;

  constructor(url: string = "") {
    this.socket = io(url);
    this.socket.on("connect", () => {
      this.socket.emit("getGameState");
    });
  }

  public updateGameState(
    placedBlocks: Block[],
    activeTet: Tetromino | null
  ): void {
    this.socket.emit("updateGameState", { placedBlocks, activeTet });
  }

  public sendLayers(layers: number): void {
    this.socket.emit("addLayers", { layers });
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    this.socket.on(event, callback);
  }
}
