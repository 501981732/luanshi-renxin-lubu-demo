import { CharacterCard } from "../game/CharacterCard";
import type { WorldState } from "../../core/types/world";
import { getRiskLabel } from "../../core/engine/riskEngine";

function riskTone(value: number) {
  if (value >= 75) return "danger" as const;
  if (value >= 55) return "warning" as const;
  return "good" as const;
}

export function CharacterPanel({ world }: { world: WorldState }) {
  const luBu = world.characters.lv_bu;
  const xiahou = world.characters.xiahou_dun;
  const zhang = world.characters.zhang_liao;
  const xun = world.characters.xun_yu;
  const chen = world.characters.chen_gong;
  const zhangStatus = zhang.mentalState.belonging > 65 ? "倾向曹营" : zhang.mentalState.belonging > 45 ? "摇摆观察" : "旧主情重";

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">帐中人物</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <CharacterCard
          emphasized
          name="吕布"
          subtitle="猛虎、隐患、未来变量"
          status={getRiskLabel(world.luBuArc.betrayalRisk)}
          tone={riskTone(world.luBuArc.betrayalRisk)}
          rows={[
            ["信任", luBu.mentalState.trust],
            ["怨气", luBu.mentalState.grievance],
            ["兵权", luBu.armyControl],
            ["融入", world.luBuArc.integrationProgress],
            ["陈宫影响", world.luBuArc.chenGongInfluence],
          ]}
        />
        <CharacterCard
          name="夏侯惇"
          subtitle="曹营旧将"
          status={xiahou.mentalState.grievance > 60 ? "怨气深" : "仍可安抚"}
          tone={xiahou.mentalState.grievance > 60 ? "warning" : "info"}
          rows={[
            ["信任", xiahou.mentalState.trust],
            ["怨气", xiahou.mentalState.grievance],
            ["自尊", xiahou.mentalState.pride],
            ["兵权", xiahou.armyControl],
          ]}
        />
        <CharacterCard
          name="张辽"
          subtitle="旧恩与新势之间"
          status={zhangStatus}
          tone={zhang.mentalState.belonging > 65 ? "good" : "info"}
          rows={[
            ["信任", zhang.mentalState.trust],
            ["归属", zhang.mentalState.belonging],
            ["不安", zhang.mentalState.insecurity],
            ["兵权", zhang.armyControl],
          ]}
        />
        <CharacterCard
          name="荀彧"
          subtitle="谨慎制衡派"
          status={world.luBuArc.betrayalRisk > 65 ? "主张削权" : "建议慎用"}
          tone="info"
          rows={[
            ["信任", xun.mentalState.trust],
            ["忠诚", xun.mentalState.loyalty],
            ["忧虑", world.luBuArc.betrayalRisk],
          ]}
        />
        <CharacterCard
          name="陈宫"
          subtitle="吕布帐中谋士"
          status={world.luBuArc.chenGongInfluence > 65 ? "频入其帐" : "暗线未明"}
          tone={world.luBuArc.chenGongInfluence > 65 ? "warning" : "neutral"}
          rows={[
            ["信任", chen.mentalState.trust],
            ["怨气", chen.mentalState.grievance],
            ["影响", world.luBuArc.chenGongInfluence],
            ["状态", chen.status],
          ]}
        />
      </div>
    </section>
  );
}
