import { RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { getEnding } from "../../core/engine/endingEngine";
import type { WorldState } from "../../core/types/world";

export function EndingPanel({ world, onReset }: { world: WorldState; onReset: () => void }) {
  if (!world.ending) return null;
  const ending = getEnding(world.ending.id);
  const toneClass =
    ending.tone === "failure" ? "border-destructive/40" : ending.tone === "success" ? "border-primary/50" : "border-warning/40";

  return (
    <aside className={`rounded-lg border bg-white/80 p-5 shadow-[0_18px_60px_rgba(23,27,31,0.08)] ${toneClass}`}>
      <div className="font-mono text-xs text-muted-foreground">第 {world.metrics.turn} / 10 回合</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{ending.title}</h1>
      <p className="mt-5 text-sm leading-7 text-foreground/85">{ending.description}</p>
      <Card className="mt-5 shadow-none">
        <CardContent className="p-4">
          <div className="text-sm font-medium">评价</div>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{ending.evaluation}</p>
          <p className="mt-3 text-xs text-muted-foreground">{world.ending.reason}</p>
        </CardContent>
      </Card>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>内部稳定：<span className="font-mono">{world.metrics.internalStability}</span></div>
        <div>袁绍压力：<span className="font-mono">{world.metrics.yuanShaoPressure}</span></div>
        <div>老将压力：<span className="font-mono">{world.metrics.oldGuardPressure}</span></div>
        <div>吕布风险：<span className="font-mono">{world.luBuArc.betrayalRisk}</span></div>
      </div>
      <Button onClick={onReset} className="mt-6 w-full" variant="outline">
        <RotateCcw className="h-4 w-4" />
        重开一局
      </Button>
    </aside>
  );
}
