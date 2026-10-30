import type { Point, SketchShape } from "./types";

// Adapted from FIG B: https://claude.dev/blog/solving-code-review-at-anthropic/
export const WIDTH = 760;
export const HEIGHT = 330;
export const BALL_R = 6;
export const GRAVITY = 0.0011;
export const SPAWN_Y = -BALL_R * 2;
export const MAX_VX = 0.04;

const SLAB_X = 90;
const SLAB_W = 330;
const SLAB_H = 26;
const SKEW = 40;
const TOP = 36;
const GAP = 64;
const LABEL_X = SLAB_X + SLAB_W + SKEW + 24;
export const COUNTER_X = WIDTH - 20;
export const LANE: Point = [
  SLAB_X + SKEW / 2 + BALL_R + 10,
  SLAB_X + SLAB_W + SKEW / 2 - BALL_R - 10,
];

type Hole = { x: number; w: number };

export const slabs: {
  id: string;
  y: number;
  label: string;
  sub: string;
  holes: Hole[];
}[] = [
  {
    id: "local",
    label: "Local checks",
    sub: "Catch mistakes early.",
    holes: [
      { x: 275, w: 34 },
      { x: 160, w: 30 },
      { x: 380, w: 28 },
    ],
  },
  {
    id: "ci",
    label: "Required CI",
    sub: "Run tests and builds.",
    holes: [
      { x: 272, w: 32 },
      { x: 200, w: 30 },
      { x: 352, w: 34 },
    ],
  },
  {
    id: "ai-review",
    label: "AI Review",
    sub: "Find bugs in the diff.",
    holes: [
      { x: 278, w: 36 },
      { x: 142, w: 28 },
      { x: 322, w: 30 },
    ],
  },
  {
    id: "human-approval",
    label: "Human approval",
    sub: "Decide if it should ship.",
    holes: [
      { x: 276, w: 34 },
      { x: 172, w: 32 },
      { x: 348, w: 28 },
    ],
  },
].map((slab, i) => ({ ...slab, y: TOP + i * GAP }));

export const HUMAN_APPROVAL = slabs.find(slab => slab.id === "human-approval")!;
export const HUMAN_MARKER: Point = [LABEL_X - 14, HUMAN_APPROVAL.y - 14];
export const FEEDBACK = {
  id: "human-feedback",
  x: 34,
  from: HUMAN_APPROVAL.y,
  to: slabs[1].y - 32,
};

export const NET = {
  id: "rollback",
  x: 275,
  y: TOP + slabs.length * GAP - 8,
  span: 72,
  sag: 18,
};

export const restY = (depth: number, x: number) => {
  if (depth < slabs.length) return slabs[depth].y - BALL_R + 1;
  const u = (x - NET.x) / NET.span;
  return NET.y + NET.sag * (1 - u * u) - BALL_R;
};

const inHole = ({ holes }: (typeof slabs)[number], x: number) =>
  holes.some(hole => Math.abs(x - hole.x) <= hole.w / 2 - BALL_R * 0.8);

export interface Fate {
  depth: number;
  t: number;
  x: number;
  y: number;
}

export const fate = (x0: number, vx: number): Fate | undefined => {
  for (let depth = 0; depth <= slabs.length; depth++) {
    const t = Math.sqrt((2 * (restY(depth, NET.x) - SPAWN_Y)) / GRAVITY);
    const x = x0 + vx * t;
    if (depth === slabs.length) {
      if (Math.abs(x - NET.x) > NET.span * 0.6) return undefined;
    } else if (x < LANE[0] || x > LANE[1]) return undefined;
    else if (inHole(slabs[depth], x)) continue;
    return { depth, t, x, y: restY(depth, x) };
  }
};

// Depth of each ball per round; slabs.length means it reaches rollback.
const SEQUENCE = [0, 0, 1, 0, 2, 1, 0, 3, 0, 2, 1, 0, 1, 3, 0, slabs.length];

export interface Drop {
  x0: number;
  vx: number;
  fate: Fate;
}

export const plan = (random = Math.random): Drop[] =>
  SEQUENCE.flatMap(depth => {
    for (let attempt = 0; attempt < 4000; attempt++) {
      const x0 = LANE[0] + random() * (LANE[1] - LANE[0]);
      const vx = (random() * 2 - 1) * MAX_VX;
      const result = fate(x0, vx);
      if (result?.depth === depth) return [{ x0, vx, fate: result }];
    }
    return [];
  });

export const counters = [
  ...slabs.map(slab => ({ id: slab.id, y: slab.y + 6, verb: "stopped" })),
  { id: NET.id, y: NET.y + 14, verb: "caught" },
];

export const shapes: SketchShape[] = [
  {
    id: FEEDBACK.id,
    type: "arrow",
    points: [
      [SLAB_X - 10, FEEDBACK.from],
      [FEEDBACK.x, FEEDBACK.from],
      [FEEDBACK.x, FEEDBACK.to],
      [SLAB_X - 10, FEEDBACK.to],
    ],
    dashed: true,
  },
  ...slabs.map(({ id, y, label, sub, holes }): SketchShape => ({
    id,
    type: "slab",
    x: SLAB_X,
    y: y - SLAB_H / 2,
    w: SLAB_W,
    h: SLAB_H,
    skew: SKEW,
    holes,
    label,
    sub,
  })),
  {
    id: NET.id,
    type: "curve",
    tone: "accent",
    points: [-1, -0.5, 0, 0.5, 1].map(u => [
      NET.x + u * NET.span,
      NET.y + NET.sag * (1 - u * u),
    ]),
  },
  {
    type: "text",
    x: LABEL_X,
    y: NET.y + 6,
    text: "Fast fallback",
    size: 18,
  },
  {
    type: "text",
    x: LABEL_X,
    y: NET.y + 26,
    text: "Revert or redeploy.",
    size: 14,
    muted: true,
  },
];
