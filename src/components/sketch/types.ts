export type Point = [number, number];
export type Anchor = "start" | "middle" | "end";
export type Tone = "plain" | "accent" | "muted";

export type SketchShape = { id?: string } & (
  | {
      type: "box";
      x: number;
      y: number;
      w: number;
      h: number;
      label: string;
      sub?: string;
      tone?: Tone;
      dashed?: boolean;
    }
  | {
      type: "frame";
      x: number;
      y: number;
      w: number;
      h: number;
      label: string;
      labelAt?: "top-left" | "bottom-left" | "bottom-right";
    }
  | {
      type: "arrow";
      points: Point[];
      label?: string;
      labelAt?: Point;
      labelAnchor?: Anchor;
      dashed?: boolean;
    }
  | {
      type: "slab";
      x: number;
      y: number;
      w: number;
      h: number;
      skew: number;
      holes: { x: number; w: number }[];
      label: string;
      sub?: string;
    }
  | {
      type: "curve";
      points: Point[];
      tone?: Tone;
    }
  | {
      type: "text";
      x: number;
      y: number;
      text: string;
      size?: number;
      anchor?: Anchor;
      muted?: boolean;
    }
);
