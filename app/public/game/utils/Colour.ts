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
      default:
        return Colour.fromString("rgba(0, 0, 0, 1)");
    }
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

  static hsl2Rgb(h: number, s: number, l: number): Colour {
    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return new Colour(r * 255, g * 255, b * 255);
  }

  angle2Shade(angle: number): Colour {
    const hue = (angle / (2 * Math.PI)) * 360;
    const saturation = 100;
    const lightness = 50;

    return Colour.hsl2Rgb(hue, saturation, lightness);
  }

  withAlpha(alpha: number): Colour {
    return new Colour(this.r, this.g, this.b, alpha);
  }
}
