import { describe, expect, it } from "vitest";
import { initialWorld } from "../data/initialWorld";
import { storyEvents } from "../data/events";
import { pickNextEvent } from "./directorEngine";

describe("directorEngine", () => {
  it("contains the required event ids", () => {
    const ids = new Set(storyEvents.map((event) => event.id));
    expect(ids).toEqual(
      new Set([
        "lv_bu_surrenders",
        "lv_bu_title_debate",
        "lv_bu_requests_army",
        "old_guard_unrest",
        "yuan_shao_secret_envoy",
        "frontline_crisis",
        "battle_credit_dispute",
        "chen_gong_night_talk",
        "final_probe_integrated",
        "final_probe_wavering",
        "final_probe_treason",
        "final_probe_old_guard_crisis",
      ]),
    );
  });

  it("all events expose four choices", () => {
    for (const event of storyEvents) {
      expect(event.choices).toHaveLength(4);
    }
  });

  it("does not repeat resolved events", () => {
    const world = structuredClone(initialWorld);
    world.metrics.turn = 2;
    world.resolvedEventIds = ["lv_bu_surrenders"];
    expect(pickNextEvent(world)?.id).toBe("lv_bu_title_debate");
  });

  it("picks treason branch first at turn 9", () => {
    const world = structuredClone(initialWorld);
    world.metrics.turn = 9;
    world.luBuArc.betrayalRisk = 80;
    expect(pickNextEvent(world)?.id).toBe("final_probe_treason");
  });

  it("falls back to wavering final probe at turn 9", () => {
    const world = structuredClone(initialWorld);
    world.metrics.turn = 9;
    world.luBuArc.betrayalRisk = 40;
    world.luBuArc.integrationProgress = 20;
    expect(pickNextEvent(world)?.id).toBe("final_probe_wavering");
  });
});
