import { endings } from "../data/endings";
import type { Ending, EndingId } from "../types/ending";
import type { GameEndingState, WorldState } from "../types/world";

function state(id: EndingId, world: WorldState, reason: string, early: boolean): GameEndingState {
  return { id, triggeredTurn: world.metrics.turn, reason, early };
}

export function checkEarlyEnding(world: WorldState): GameEndingState | null {
  const luBu = world.characters.lv_bu;

  if (
    world.luBuArc.rebellionIntent > 70 &&
    luBu.mentalState.grievance > 70 &&
    luBu.armyControl > 15000
  ) {
    return state("camp_rebellion", world, "吕布起兵意图、怨气和兵权同时突破临界。", true);
  }

  if (
    world.luBuArc.yuanShaoContact > 70 &&
    world.luBuArc.betrayalRisk > 75 &&
    luBu.armyControl > 10000
  ) {
    return state("lubu_defects_to_yuan", world, "吕布已与袁绍深度接触，且握有足够兵权。", true);
  }

  if (
    (luBu.status === "executed" || luBu.status === "imprisoned") &&
    world.metrics.internalStability < 45 &&
    world.metrics.surrenderedFactionRisk > 60
  ) {
    return state("killed_tiger_left_wound", world, "吕布被制后，降将政策遭受重创。", true);
  }

  return null;
}

export function checkFinalEnding(world: WorldState): GameEndingState {
  const early = checkEarlyEnding(world);
  if (early) return { ...early, early: false };

  const luBu = world.characters.lv_bu;
  const zhangLiao = world.characters.zhang_liao;

  if (
    world.luBuArc.betrayalRisk < 40 &&
    world.luBuArc.integrationProgress > 60 &&
    world.metrics.internalStability > 50
  ) {
    return state("tiger_in_cage", world, "吕布风险低，融入度和内部稳定都达标。", false);
  }

  if (zhangLiao.mentalState.belonging > 70 && zhangLiao.mentalState.trust > 65) {
    return state("zhangliao_joins_cao", world, "张辽归属与信任均已越过转化线。", false);
  }

  if (
    world.metrics.yuanShaoPressure < 30 &&
    world.luBuArc.militaryDependence > 60 &&
    world.luBuArc.betrayalRisk >= 50 &&
    world.luBuArc.betrayalRisk < 75
  ) {
    return state("win_with_tiger", world, "袁绍前锋受挫，但曹操已高度依赖吕布战力。", false);
  }

  if (
    world.metrics.internalStability > 45 &&
    world.metrics.yuanShaoPressure < 75 &&
    world.metrics.oldGuardPressure < 80 &&
    luBu.status === "active"
  ) {
    return state("tense_success", world, "主要临界风险未爆发，但核心矛盾仍未完全解决。", false);
  }

  return state("failed_balance", world, "关键指标未能支撑稳定收局。", false);
}

export function getEnding(id: EndingId): Ending {
  return endings[id];
}
