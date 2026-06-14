import { MetricCard } from "@/components/game/MetricCard";
import type { WorldState } from "@/core/types/world";

export function DashboardPanel({ world }: { world: WorldState }) {
  const m = world.metrics;
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">全局局势</h2>
          <p className="text-sm text-muted-foreground">这些数值是曹营这十回合的天气。</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="内部稳定" value={m.internalStability} mode="higher-good" />
        <MetricCard title="袁绍压力" value={m.yuanShaoPressure} mode="higher-risk" />
        <MetricCard title="老将压力" value={m.oldGuardPressure} mode="higher-risk" />
        <MetricCard title="降将风险" value={m.surrenderedFactionRisk} mode="higher-risk" />
        <MetricCard title="军事准备" value={m.militaryReadiness} mode="higher-good" />
        <MetricCard title="曹操威望" value={m.rulerPrestige} mode="higher-good" />
        <MetricCard title="谣言强度" value={m.rumorLevel} mode="higher-risk" />
        <MetricCard title="吕布兵权" value={world.characters.lv_bu.armyControl} mode="higher-risk" />
      </div>
    </section>
  );
}
