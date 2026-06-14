import type { Effect } from "../types/effect";
import type { WorldState } from "../types/world";
import { getValueByPath, hasPath, setValueByPath } from "./pathUtils";

const UNCLAMPED_TARGETS = ["armyControl", "turn"];

export function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function shouldClamp(target: string) {
  return !UNCLAMPED_TARGETS.some((segment) => target.endsWith(segment));
}

export function applyEffect(world: WorldState, effect: Effect): WorldState {
  const next = structuredClone(world);

  if (!hasPath(next, effect.target)) {
    next.debugWarnings.push(`Effect target not found: ${effect.target}`);
    return next;
  }

  const current = getValueByPath(next, effect.target);

  if (effect.op === "set") {
    setValueByPath(next, effect.target, effect.value);
    return next;
  }

  if (typeof current !== "number" || typeof effect.value !== "number") {
    next.debugWarnings.push(`Effect target is not numeric: ${effect.target}`);
    return next;
  }

  const rawValue = effect.op === "+" ? current + effect.value : current - effect.value;
  setValueByPath(next, effect.target, shouldClamp(effect.target) ? clamp(rawValue) : rawValue);
  return next;
}

export function applyEffects(world: WorldState, effects: Effect[]): WorldState {
  return effects.reduce((acc, effect) => applyEffect(acc, effect), world);
}
