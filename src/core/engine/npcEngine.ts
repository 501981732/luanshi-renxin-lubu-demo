import type { WorldState } from "../types/world";
import { clamp } from "./effectEngine";

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function runNpcDecisions(world: WorldState): WorldState {
  const next = structuredClone(world);
  const luBu = next.characters.lv_bu;
  const xiahou = next.characters.xiahou_dun;
  const zhangLiao = next.characters.zhang_liao;

  if (next.luBuArc.betrayalRisk > 80 && luBu.armyControl > 15000) {
    next.luBuArc.rebellionIntent = clamp(next.luBuArc.rebellionIntent + 10);
    next.chronicle.push({
      id: makeId("npc"),
      turn: next.metrics.turn,
      title: "吕布营中异动",
      content: "吕布营中频繁整备马匹，亲兵调动增多。密探认为其或有异心。",
      type: "warning",
    });
  } else if (luBu.mentalState.grievance > 45) {
    next.luBuArc.chenGongInfluence = clamp(next.luBuArc.chenGongInfluence + 8);
    next.chronicle.push({
      id: makeId("npc"),
      turn: next.metrics.turn,
      title: "吕布心生怨气",
      content: "吕布近来少入中军，常与陈宫密谈，对曹营旧将多有不满。",
      type: "npc",
    });
  }

  if (next.luBuArc.betrayalRisk > 65) {
    next.chronicle.push({
      id: makeId("npc"),
      turn: next.metrics.turn,
      title: "荀彧进谏",
      content: "荀彧认为吕布可用其锋，不可授其根本。若其兵权过重，恐尾大不掉。",
      type: "npc",
    });
  }

  if (xiahou.mentalState.grievance > 60) {
    next.metrics.oldGuardPressure = clamp(next.metrics.oldGuardPressure + 8);
    next.chronicle.push({
      id: makeId("npc"),
      turn: next.metrics.turn,
      title: "夏侯惇不满",
      content: "夏侯惇称病不出，营中旧将多有议论，认为主公重降将而轻旧臣。",
      type: "warning",
    });
  }

  if (zhangLiao.mentalState.belonging > 70) {
    next.chronicle.push({
      id: makeId("npc"),
      turn: next.metrics.turn,
      title: "张辽渐定",
      content: "张辽上书谢恩，言愿为曹营立功。其旧主之义虽在，归属之心已显。",
      type: "npc",
    });
  }

  if (luBu.mentalState.grievance > 35 || luBu.mentalState.insecurity > 60) {
    next.luBuArc.chenGongInfluence = clamp(next.luBuArc.chenGongInfluence + 5);
  }

  return next;
}
