import type { WorldState } from "../types/world";

export function getConditionContext(world: WorldState) {
  return {
    turn: world.metrics.turn,
    oldGuardPressure: world.metrics.oldGuardPressure,
    yuanShaoPressure: world.metrics.yuanShaoPressure,
    internalStability: world.metrics.internalStability,
    surrenderedFactionRisk: world.metrics.surrenderedFactionRisk,
    betrayalRisk: world.luBuArc.betrayalRisk,
    chenGongInfluence: world.luBuArc.chenGongInfluence,
    yuanShaoContact: world.luBuArc.yuanShaoContact,
    integrationProgress: world.luBuArc.integrationProgress,
    militaryDependence: world.luBuArc.militaryDependence,
    rebellionIntent: world.luBuArc.rebellionIntent,
    xiahouGrievance: world.characters.xiahou_dun.mentalState.grievance,
    luBuGrievance: world.characters.lv_bu.mentalState.grievance,
    luBuArmyControl: world.characters.lv_bu.armyControl,
    luBuStatus: world.characters.lv_bu.status,
    zhangLiaoBelonging: world.characters.zhang_liao.mentalState.belonging,
    zhangLiaoTrust: world.characters.zhang_liao.mentalState.trust,
  };
}

export function checkCondition(world: WorldState, condition?: string) {
  if (!condition) return true;
  const context = getConditionContext(world);
  const keys = Object.keys(context);
  const values = Object.values(context);

  try {
    return Boolean(Function(...keys, `return ${condition};`)(...values));
  } catch {
    world.debugWarnings.push(`Condition failed to parse: ${condition}`);
    return false;
  }
}
