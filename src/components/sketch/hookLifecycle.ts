import type { Point, SketchShape } from "./types";

export type StepMark = "pass" | "block" | "warn";

export interface ScenarioStep {
  path: string[];
  marks?: Record<string, StepMark>;
  note: string;
}

export interface Scenario {
  label: string;
  steps: ScenarioStep[];
}

export const markBadges: Record<StepMark, string> = {
  pass: "✓ pass",
  block: "✗ blocked",
  warn: "! feedback",
};

export const shapes: SketchShape[] = [
  { type: "box", x: 300, y: 30, w: 30, h: 20, label: "", tone: "accent" },
  {
    type: "text",
    x: 344,
    y: 46,
    text: "Can block: exit 2 (non-zero for Git)",
    muted: true,
  },
  { type: "box", x: 300, y: 66, w: 30, h: 20, label: "" },
  {
    type: "text",
    x: 344,
    y: 82,
    text: "Cannot block: feedback or context only",
    muted: true,
  },

  {
    id: "session",
    type: "box",
    x: 40,
    y: 24,
    w: 200,
    h: 60,
    label: "SessionStart",
    sub: "inject context",
  },
  {
    id: "a-session-prompt",
    type: "arrow",
    points: [
      [140, 84],
      [140, 148],
    ],
  },

  {
    type: "frame",
    x: 20,
    y: 110,
    w: 760,
    h: 320,
    label: "Per turn",
    labelAt: "bottom-right",
  },
  {
    id: "prompt",
    type: "box",
    x: 40,
    y: 150,
    w: 200,
    h: 60,
    label: "UserPromptSubmit",
    sub: "add context",
    tone: "accent",
  },
  {
    id: "a-prompt-pre",
    type: "arrow",
    points: [
      [240, 180],
      [270, 180],
      [270, 206],
      [304, 206],
    ],
  },

  {
    type: "frame",
    x: 290,
    y: 136,
    w: 480,
    h: 180,
    label: "Agentic loop, per tool call",
    labelAt: "bottom-left",
  },
  {
    id: "pre",
    type: "box",
    x: 306,
    y: 176,
    w: 140,
    h: 60,
    label: "PreToolUse",
    sub: "guard",
    tone: "accent",
  },
  {
    id: "a-pre-tool",
    type: "arrow",
    points: [
      [446, 206],
      [480, 206],
    ],
  },
  {
    id: "tool",
    type: "box",
    x: 482,
    y: 176,
    w: 104,
    h: 60,
    label: "Tool",
    sub: "Edit, Bash",
    tone: "muted",
    dashed: true,
  },
  {
    id: "a-tool-post",
    type: "arrow",
    points: [
      [586, 206],
      [614, 206],
    ],
  },
  {
    id: "post",
    type: "box",
    x: 616,
    y: 176,
    w: 136,
    h: 60,
    label: "PostToolUse",
    sub: "format, lint",
  },
  {
    id: "a-loop",
    type: "arrow",
    points: [
      [684, 236],
      [684, 280],
      [376, 280],
      [376, 238],
    ],
    label: "next tool call",
    labelAt: [610, 302],
  },

  {
    id: "a-done",
    type: "arrow",
    points: [
      [330, 316],
      [330, 366],
      [242, 366],
    ],
    label: "thinks it's done",
    labelAt: [342, 350],
    labelAnchor: "start",
  },
  {
    id: "stop",
    type: "box",
    x: 40,
    y: 340,
    w: 200,
    h: 60,
    label: "Stop",
    sub: "verify",
    tone: "accent",
  },
  {
    id: "a-stop-retry",
    type: "arrow",
    points: [
      [240, 388],
      [560, 388],
      [560, 318],
    ],
    label: "exit 2: not done yet, keep working",
    labelAt: [400, 410],
    dashed: true,
  },

  {
    id: "a-commit",
    type: "arrow",
    points: [
      [140, 400],
      [140, 492],
    ],
    label: "git commit / push",
    labelAt: [152, 456],
    labelAnchor: "start",
  },
  {
    type: "frame",
    x: 20,
    y: 470,
    w: 560,
    h: 120,
    label: "Git layer: same rules for humans and agents",
    labelAt: "bottom-left",
  },
  {
    id: "precommit",
    type: "box",
    x: 40,
    y: 494,
    w: 150,
    h: 56,
    label: "pre-commit",
    sub: "secrets, codegen",
    tone: "accent",
  },
  {
    id: "a-precommit-msg",
    type: "arrow",
    points: [
      [190, 522],
      [218, 522],
    ],
  },
  {
    id: "commitmsg",
    type: "box",
    x: 220,
    y: 494,
    w: 150,
    h: 56,
    label: "commit-msg",
    sub: "message format",
    tone: "accent",
  },
  {
    id: "a-msg-push",
    type: "arrow",
    points: [
      [370, 522],
      [398, 522],
    ],
  },
  {
    id: "prepush",
    type: "box",
    x: 400,
    y: 494,
    w: 160,
    h: 56,
    label: "pre-push",
    sub: "full test suite",
    tone: "accent",
  },
  {
    id: "a-push-ci",
    type: "arrow",
    points: [
      [560, 522],
      [618, 522],
    ],
  },
  {
    id: "ci",
    type: "box",
    x: 620,
    y: 494,
    w: 140,
    h: 56,
    label: "CI",
    sub: "review before merge",
    tone: "accent",
  },
];

export const scenario: Scenario = {
  label: "",
  steps: [
    {
      path: ["session"],
      note: "会话开始，SessionStart 注入当前分支、未完成任务等动态上下文。",
    },
    {
      path: ["a-session-prompt", "prompt"],
      note: "用户：给 User 接口加一个 nickname 字段。UserPromptSubmit 可以在这里补充上下文。",
    },
    {
      path: ["a-prompt-pre", "pre"],
      marks: { pre: "block" },
      note: "Claude 想直接修改生成文件 `biz/model/user.go`，PreToolUse 以 exit 2 拒绝，工具不会执行。",
    },
    {
      path: ["pre"],
      marks: { pre: "pass" },
      note: "stderr 里的指引交给 Claude：「请修改对应的 IDL，然后重新生成」。Claude 改为编辑 `idl/user.thrift`，这次放行。",
    },
    { path: ["a-pre-tool", "tool"], note: "IDL 写入磁盘。" },
    {
      path: ["a-tool-post", "post"],
      marks: { post: "warn" },
      note: "PostToolUse 执行 `make gen` 失败。工具已经执行完毕无法撤销，exit 2 只能把编译错误反馈给 Claude。",
    },
    {
      path: ["a-loop", "pre", "a-pre-tool", "tool", "a-tool-post", "post"],
      marks: { pre: "pass", post: "pass" },
      note: "Claude 根据报错修正 IDL，发起下一次工具调用，这次重新生成成功。",
    },
    {
      path: ["a-done", "stop"],
      marks: { stop: "block" },
      note: "Claude 自认为完成。Stop 跑 `go test`，有 2 个用例失败，exit 2 阻止回合结束。",
    },
    {
      path: [
        "a-stop-retry",
        "pre",
        "a-pre-tool",
        "tool",
        "a-tool-post",
        "post",
      ],
      marks: { pre: "pass", post: "pass" },
      note: "失败信息交还给 Claude，回到 Agentic Loop 修复用例。",
    },
    {
      path: ["a-done", "stop"],
      marks: { stop: "pass" },
      note: "再次验收全部通过，回合结束。`stop_hook_active` 可以用来限制重试次数，防止死循环。",
    },
    {
      path: ["a-commit", "precommit"],
      marks: { precommit: "block" },
      note: "git commit 触发 pre-commit，gitleaks 在 `config/dev.yaml` 中发现一个 Token，提交被拒绝。",
    },
    {
      path: ["pre"],
      marks: { pre: "block" },
      note: "Claude 尝试用 `git commit --no-verify` 绕过 Git Hook，被 PreToolUse 拦截。",
    },
    {
      path: ["a-commit", "precommit"],
      marks: { precommit: "pass" },
      note: "Claude 改为从环境变量读取 Token，重新提交，pre-commit 通过。",
    },
    {
      path: ["a-precommit-msg", "commitmsg", "a-msg-push", "prepush"],
      marks: { commitmsg: "pass", prepush: "pass" },
      note: "commit-msg 与 pre-push 依次通过。",
    },
    {
      path: ["a-push-ci", "ci"],
      note: "CI 是最终防线，人在合并进主干前做 Code Review。",
    },
  ],
};

export type ClawdPose = "default" | "look-left" | "look-right" | "arms-up";

export type Activity = "typing" | "building" | "thinking";

export const activities: Record<string, Activity> = {
  tool: "typing",
  precommit: "typing",
  commitmsg: "typing",
  prepush: "typing",
  stop: "thinking",
  ci: "building",
};

interface PixelArt {
  at: Point;
  px: Point;
  lines: string[];
  kinds: Record<string, string>;
}

const pixels = ({ at: [x0, y0], px: [w, h], lines, kinds }: PixelArt) =>
  lines.flatMap((line, row) =>
    [...line.matchAll(/([^.])\1*/g)].map(match => ({
      x: x0 + match.index * w,
      y: y0 + row * h,
      w: match[0].length * w,
      h,
      kind: kinds[match[0][0]],
    }))
  );

const PX_W = 3;
const PX_H = 5;
const legs = "....a.b....a.b....";
const poses: Record<ClawdPose, string[]> = {
  default: [
    "...############...",
    "...##o######o##...",
    ".ll############rr.",
    "...############...",
    legs,
  ],
  "look-left": [
    "...#o#######o##...",
    "...############...",
    ".ll############rr.",
    "...############...",
    legs,
  ],
  "look-right": [
    "...##o#######o#...",
    "...############...",
    ".ll############rr.",
    "...############...",
    legs,
  ],
  "arms-up": [
    "...############...",
    ".ll##o######o##rr.",
    "..##############..",
    "...############...",
    legs,
  ],
};
const rows = poses.default.length;
const cols = poses.default[0].length;
const body = (lines: string[]) =>
  pixels({
    at: [(-cols / 2) * PX_W, -rows * PX_H],
    px: [PX_W, PX_H],
    lines,
    kinds: {
      "#": "body",
      o: "eye",
      l: "body arm arm-l",
      r: "body arm arm-r",
      a: "body leg leg-a",
      b: "body leg leg-b",
    },
  });

const part = (name: string, anchor: Point, art: PixelArt) => ({
  name,
  anchor,
  rects: pixels(art),
});

const gear: {
  activity: Activity;
  pose: ClawdPose;
  parts: ReturnType<typeof part>[];
}[] = [
  {
    activity: "typing",
    pose: "default",
    parts: [
      part("laptop", [0, 0], {
        at: [-16, -14],
        px: [2, 2],
        lines: [
          ".eeeeeeeeeeeeee.",
          ".elllllllllllle.",
          ".elllllkkllllle.",
          ".elllllllllllle.",
          ".eeeeeeeeeeeeee.",
          "bbbbbbbbbbbbbbbb",
          ".bbbbbbbbbbbbbb.",
        ],
        kinds: {
          e: "laptop-edge",
          l: "laptop-lid",
          k: "laptop-logo",
          b: "laptop-base",
        },
      }),
      part("code", [0, -26], {
        at: [-9.75, -7.5],
        px: [1.5, 1.5],
        lines: [
          "..a....b..c..",
          ".a.....b...c.",
          "a.....b.....c",
          ".a...b.....c.",
          "..a..b....c..",
        ],
        kinds: {
          a: "code-bit bit-1",
          b: "code-bit bit-2",
          c: "code-bit bit-3",
        },
      }),
    ],
  },
  {
    activity: "building",
    pose: "look-right",
    parts: [
      part("hardhat", [0, -25], {
        at: [-21, -12],
        px: [3, 3],
        lines: [
          "....lhsshd....",
          "...lhhsshhd...",
          "..lhhhsshhhd..",
          "bbbbbbbbbbbbbb",
        ],
        kinds: {
          l: "hat-shine",
          s: "hat-shine",
          h: "hat",
          d: "hat-shade",
          b: "hat-brim",
        },
      }),
      part("hammer", [18, -12.5], {
        at: [-6, -20],
        px: [1.5, 2.5],
        lines: [
          "..nmmmmmmn..",
          "..nmmmmmmn..",
          ".....hh.....",
          ".....hh.....",
          ".....hh.....",
          ".....hh.....",
          ".....hh.....",
          "....aaaa....",
          "....aaaa....",
        ],
        kinds: {
          n: "hammer-edge",
          m: "hammer-head",
          h: "hammer-handle",
          a: "body",
        },
      }),
      part("sparks", [35, -2], {
        at: [-3, -1],
        px: [2, 2],
        lines: ["123"],
        kinds: { 1: "spark spark-1", 2: "spark spark-2", 3: "spark spark-3" },
      }),
    ],
  },
  {
    activity: "thinking",
    pose: "look-right",
    parts: [
      part("puff-small", [13.5, -27.5], {
        at: [-1.5, -1.5],
        px: [3, 3],
        lines: ["x"],
        kinds: { x: "ink" },
      }),
      part("puff-big", [18, -35], {
        at: [-3, -3],
        px: [3, 3],
        lines: ["xx", "xx"],
        kinds: { x: "ink" },
      }),
      part("bubble", [19.5, -41], {
        at: [-7.5, -21],
        px: [3, 3],
        lines: [
          "..xxxxxxxxx..",
          ".x_________x.",
          "x___________x",
          "x__1__2__3__x",
          "x___________x",
          ".x_________x.",
          "..xxxxxxxxx..",
        ],
        kinds: {
          x: "ink",
          _: "paper",
          1: "bubble-dot dot-1",
          2: "bubble-dot dot-2",
          3: "bubble-dot dot-3",
        },
      }),
    ],
  },
];

export const clawd = {
  width: cols * PX_W,
  height: rows * PX_H,
  crouch: 2 * PX_H,
  poses: Object.entries(poses).map(([pose, lines]) => ({
    pose,
    rects: body(lines),
  })),
  gear,
};
