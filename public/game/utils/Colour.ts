export class Colour {
  private r: number;
  private g: number;
  private b: number;
  private a: number;

  constructor(r: number, g: number, b: number, a: number = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  static getColour(colour: string): Colour {
    switch (colour) {
      case "red":
        return Colour.fromString("rgba(255, 0, 0, 1)");
      case "green":
        return Colour.fromString("rgba(0, 255, 0, 1)");
      case "blue":
        return Colour.fromString("rgba(0, 0, 255, 1)");
      case "cyan":
        return Colour.fromString("rgba(0, 255, 255, 1)");
      case "magenta":
        return Colour.fromString("rgba(255, 0, 255, 1)");
      case "yellow":
        return Colour.fromString("rgba(255, 255, 0, 1)");
      default:
        return Colour.fromString("rgba(0, 0, 0, 1)");
    }
  }

  static fromRGB(r: number, g: number, b: number, a: number = 1): Colour {
    return new Colour(r, g, b, a);
  }

  // cursed binary bitwise colour generation LOL have fun TA
  // (as if the tileset class wasnt already awful enough at ~600 lines hahaha)
  static generateColours(): number[][] {
    const colours = [];
    for (let i = 0; i < 8; i++) {
      const r = i & 0b100 ? 255 : 0;
      const g = i & 0b010 ? 255 : 0;
      const b = i & 0b001 ? 255 : 0;
      colours.push([r, g, b]);
    }
    return colours.filter(
      (c) =>
        c.some((v) => v === 255) &&
        !(c[0] === 255 && c[1] === 255 && c[2] === 255)
    );
  }

  static random(): Colour {
    const colours = this.generateColours();
    const index = Math.floor(Math.random() * colours.length);
    const [r, g, b] = colours[index];
    return Colour.fromRGB(r, g, b);
  }

  static fromString(colour: string): Colour {
    const rgba = colour
      .replace(/rgba?\(/, "")
      .replace(/\)/, "")
      .split(",")
      .map((c) => parseInt(c.trim()));

    return new Colour(rgba[0], rgba[1], rgba[2], rgba[3] ?? 1);
  }

  toString(): string {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }

  public darken(factor: number): Colour {
    if (factor < 0 || factor > 1) return this;
    return new Colour(
      Math.floor(this.r * factor),
      Math.floor(this.g * factor),
      Math.floor(this.b * factor),
      this.a
    );
  }

  withAlpha(alpha: number): Colour {
    return new Colour(this.r, this.g, this.b, alpha);
  }
}
