import assert from "node:assert/strict";
import test from "node:test";
import {
  BALL_R,
  FEEDBACK,
  HEIGHT,
  HUMAN_APPROVAL,
  HUMAN_MARKER,
  LANE,
  MAX_VX,
  NET,
  WIDTH,
  counters,
  fate,
  plan,
  restY,
  shapes,
  slabs,
} from "../src/components/sketch/swissCheese.ts";

const seededRandom = seed => () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2 ** 32;
};

test("four defensive layers have matching shapes and counters", () => {
  assert.equal(slabs.length, 4);
  assert.deepEqual(
    shapes.filter(shape => shape.type === "slab").map(shape => shape.id),
    slabs.map(slab => slab.id)
  );
  const ids = [...slabs.map(slab => slab.id), NET.id];
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(
    counters.map(counter => counter.id),
    ids
  );
});

test("GitHub Flow shows logical gates without environment details", () => {
  assert.deepEqual(
    slabs.map(slab => slab.id),
    ["local", "ci", "ai-review", "human-approval"]
  );
  assert.equal(slabs[1].label, "Required CI");
  const labels = [
    ...slabs.flatMap(slab => [slab.label, slab.sub]),
    ...shapes.filter(shape => shape.type === "text").map(shape => shape.text),
  ].join(" ");
  assert(!/\bstaging\b|ephemeral|E2E|optional|merge|v\*/i.test(labels));
});

test("each defense has one short description without header or footer copy", () => {
  assert(
    shapes
      .filter(shape => shape.type === "slab")
      .every(shape => shape.sub && shape.sub.length <= 30)
  );
  assert.deepEqual(
    shapes.filter(shape => shape.type === "text").map(shape => shape.text),
    ["Fast fallback", "Revert or redeploy."]
  );
  assert(!JSON.stringify(shapes).includes("\u00b7"));
});

test("human approval is the final defense before fast fallback", () => {
  assert.equal(slabs[2].label, "AI Review");
  assert.equal(HUMAN_APPROVAL, slabs[3]);
  assert.equal(HUMAN_APPROVAL.label, "Human approval");
  assert(slabs[2].y < HUMAN_APPROVAL.y);
  assert.equal(HUMAN_APPROVAL, slabs.at(-1));
  assert(HUMAN_APPROVAL.y < NET.y);
  const lastLayer = shapes.findIndex(shape => shape.id === HUMAN_APPROVAL.id);
  assert.equal(shapes[lastLayer + 1].id, NET.id);
  assert(HUMAN_MARKER[0] > 0 && HUMAN_MARKER[0] < WIDTH);
  assert(HUMAN_MARKER[1] < HUMAN_APPROVAL.y);
});

test("requests for changes loop back to PR checks", () => {
  const feedback = shapes.find(shape => shape.id === FEEDBACK.id);
  assert.equal(feedback.type, "arrow");
  assert.equal(feedback.dashed, true);
  assert.equal(feedback.points[0][1], HUMAN_APPROVAL.y);
  assert(FEEDBACK.to > slabs[0].y && FEEDBACK.to < slabs[1].y);
  assert.equal(feedback.points.at(-1)[1], FEEDBACK.to);
});

test("issues can stop locally or pass every layer into rollback", () => {
  assert.equal(fate(LANE[0], 0)?.depth, 0);
  assert.equal(fate(NET.x, 0)?.depth, slabs.length);
  assert.equal(fate(LANE[1] + 1, 0), undefined);
});

test("every animation round reaches all layers and rollback", () => {
  for (let seed = 1; seed <= 32; seed++) {
    const drops = plan(seededRandom(seed));
    assert.equal(drops.length, 16, `Incomplete round for seed ${seed}`);
    assert.deepEqual(
      [...new Set(drops.map(drop => drop.fate.depth))].sort((a, b) => a - b),
      Array.from({ length: slabs.length + 1 }, (_, depth) => depth)
    );
    assert.equal(drops.at(-1).fate.depth, slabs.length);
    for (const drop of drops) {
      assert(drop.x0 >= LANE[0] && drop.x0 <= LANE[1]);
      assert(Math.abs(drop.vx) <= MAX_VX);
      assert.deepEqual(drop.fate, fate(drop.x0, drop.vx));
      assert.equal(drop.fate.y, restY(drop.fate.depth, drop.fate.x));
    }
  }
});

test("layers and rollback stay inside the canvas", () => {
  assert(slabs.every(slab => slab.y > BALL_R && slab.y < NET.y));
  assert(NET.x - NET.span > 0 && NET.x + NET.span < WIDTH);
  assert(NET.y + NET.sag + BALL_R < HEIGHT);
  for (const shape of shapes.filter(shape => shape.type === "text")) {
    assert(shape.x >= 0 && shape.x < WIDTH);
    assert(shape.y > 0 && shape.y < HEIGHT);
  }
});
