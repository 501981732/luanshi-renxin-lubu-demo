import type { WorldState } from "../types/world";
import { getRiskLabel } from "./riskEngine";

export function generateTurnReport(world: WorldState): string {
  const luBu = world.characters.lv_bu;
  const xiahou = world.characters.xiahou_dun;
  const zhangLiao = world.characters.zhang_liao;
  const riskLabel = getRiskLabel(world.luBuArc.betrayalRisk);

  return [
    `吕布当前状态：${riskLabel}。`,
    `吕布信任 ${luBu.mentalState.trust}，怨气 ${luBu.mentalState.grievance}，兵权 ${luBu.armyControl}。`,
    `夏侯惇怨气 ${xiahou.mentalState.grievance}，老将压力 ${world.metrics.oldGuardPressure}。`,
    `张辽归属感 ${zhangLiao.mentalState.belonging}，仍在观察曹营用人之道。`,
  ].join("\n");
}
