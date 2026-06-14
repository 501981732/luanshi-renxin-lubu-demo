import { storyEvents } from "../data/events";
import type { StoryEvent } from "../types/event";
import type { WorldState } from "../types/world";
import { checkCondition } from "./conditionEngine";

const MAINLINE_ORDER = [
  "lv_bu_surrenders",
  "lv_bu_title_debate",
  "lv_bu_requests_army",
  "old_guard_unrest",
  "yuan_shao_secret_envoy",
  "frontline_crisis",
  "battle_credit_dispute",
  "chen_gong_night_talk",
  "final_probe_wavering",
];

const FINAL_PROBE_ORDER = [
  "final_probe_treason",
  "final_probe_old_guard_crisis",
  "final_probe_integrated",
  "final_probe_wavering",
];

function inTurnRange(world: WorldState, event: StoryEvent) {
  if (!event.turnRange) return true;
  const [min, max] = event.turnRange;
  return world.metrics.turn >= min && world.metrics.turn <= max;
}

function unresolved(world: WorldState, event: StoryEvent) {
  return !world.resolvedEventIds.includes(event.id);
}

export function pickNextEvent(world: WorldState, events = storyEvents): StoryEvent | null {
  if (world.metrics.turn === 9) {
    for (const id of FINAL_PROBE_ORDER) {
      const event = events.find((item) => item.id === id);
      if (event && unresolved(world, event) && checkCondition(world, event.condition)) {
        return event;
      }
    }
    return events.find((item) => item.id === "final_probe_wavering") ?? null;
  }

  const candidates = events
    .filter((event) => unresolved(world, event))
    .filter((event) => inTurnRange(world, event))
    .filter((event) => checkCondition(world, event.condition))
    .filter((event) => !event.id.startsWith("final_probe_"))
    .sort((a, b) => b.priority - a.priority);

  if (candidates[0]) return candidates[0];

  const fallbackId = MAINLINE_ORDER.find((id) => !world.resolvedEventIds.includes(id));
  return events.find((event) => event.id === fallbackId) ?? null;
}
