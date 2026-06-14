import type { WorldState } from "../types/world";
import { clamp } from "./effectEngine";

export function recalculateLuBuRisk(world: WorldState): WorldState {
  const next = structuredClone(world);
  const luBu = next.characters.lv_bu;
  const m = luBu.mentalState;

  let risk = 0;
  risk += m.ambition * 0.2;
  risk += m.grievance * 0.2;
  risk += m.perceivedPower * 0.18;
  risk += m.insecurity * 0.15;
  risk -= m.loyalty * 0.18;
  risk -= m.trust * 0.15;
  risk -= m.gratitude * 0.1;
  risk -= m.fear * 0.08;
  risk -= m.belonging * 0.12;

  if (luBu.traits.includes("volatile")) risk += 12;
  if (luBu.traits.includes("ambitious")) risk += 10;
  if (luBu.traits.includes("greedy")) risk += 4;
  if (luBu.armyControl > 10000) risk += 8;
  if (luBu.armyControl > 20000) risk += 15;

  risk += next.luBuArc.chenGongInfluence * 0.08;
  risk += next.luBuArc.yuanShaoContact * 0.12;
  risk -= next.luBuArc.integrationProgress * 0.1;

  next.luBuArc.betrayalRisk = clamp(Math.round(risk));

  if (next.luBuArc.betrayalRisk > 75) {
    next.luBuArc.defectionIntent = clamp(next.luBuArc.defectionIntent + 8);
  }

  if (next.luBuArc.betrayalRisk > 80 && luBu.armyControl > 15000) {
    next.luBuArc.rebellionIntent = clamp(next.luBuArc.rebellionIntent + 8);
  }

  return next;
}

export function getRiskLabel(value: number) {
  if (value < 30) return "暂可控";
  if (value < 55) return "心意未定";
  if (value < 75) return "风险渐显";
  return "祸心暗伏";
}
