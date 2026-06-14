import { beforeEach, describe, expect, it } from "vitest";
import { storyEvents } from "@/core/data/events";
import { useWorldStore } from "./worldStore";

describe("worldStore", () => {
  beforeEach(() => {
    useWorldStore.getState().reset();
  });

  it("applies a choice, records chronicle, and advances to turn 2", () => {
    useWorldStore.getState().choose("accept_generously");
    const world = useWorldStore.getState().world;
    expect(world.metrics.turn).toBe(2);
    expect(world.resolvedEventIds).toContain("lv_bu_surrenders");
    expect(world.chronicle.some((item) => item.type === "choice")).toBe(true);
  });

  it("ignores an invalid choice and records a warning", () => {
    useWorldStore.getState().choose("missing_choice");
    const world = useWorldStore.getState().world;
    expect(world.metrics.turn).toBe(1);
    expect(world.debugWarnings.at(-1)).toContain("missing_choice");
  });

  it("reaches an ending after resolving turn 9", () => {
    while (!useWorldStore.getState().world.ending && useWorldStore.getState().world.metrics.turn < 10) {
      const world = useWorldStore.getState().world;
      const event = storyEvents.find((item) => item.id === world.currentEventId);
      expect(event).toBeTruthy();
      useWorldStore.getState().choose(event!.choices[0].id);
    }

    const world = useWorldStore.getState().world;
    expect(world.metrics.turn).toBe(10);
    expect(world.ending).not.toBeNull();
    expect(world.currentEventId).toBe("ending");
  });
});
