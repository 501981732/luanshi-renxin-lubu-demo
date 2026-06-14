import { describe, expect, it } from "vitest";
import { initialWorld } from "../data/initialWorld";
import { applyEffects } from "./effectEngine";

describe("effectEngine", () => {
  it("adds and clamps normal numeric paths", () => {
    const next = applyEffects(initialWorld, [
      { target: "metrics.internalStability", op: "+", value: 80 },
    ]);
    expect(next.metrics.internalStability).toBe(100);
  });

  it("does not clamp armyControl", () => {
    const next = applyEffects(initialWorld, [
      { target: "characters.lv_bu.armyControl", op: "+", value: 30000 },
    ]);
    expect(next.characters.lv_bu.armyControl).toBe(33000);
  });

  it("records a warning for missing paths", () => {
    const next = applyEffects(initialWorld, [
      { target: "metrics.missing", op: "+", value: 1 },
    ]);
    expect(next.debugWarnings[0]).toContain("metrics.missing");
  });
});
