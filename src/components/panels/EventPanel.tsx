import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { DecisionButton } from "../game/DecisionButton";
import { storyEvents } from "../../core/data/events";
import type { WorldState } from "../../core/types/world";

export function EventPanel({
  world,
  choosing,
  onChoose,
}: {
  world: WorldState;
  choosing: boolean;
  onChoose: (choiceId: string) => void;
}) {
  const event = storyEvents.find((item) => item.id === world.currentEventId);

  if (!event) {
    return (
      <Alert className="border-destructive/30 bg-destructive/5">
        <AlertTitle>事件缺失</AlertTitle>
        <AlertDescription>当前事件无法找到，详情已记录到 DebugPanel。</AlertDescription>
      </Alert>
    );
  }

  return (
    <aside className="rounded-lg border bg-white/80 p-5 shadow-[0_18px_60px_rgba(23,27,31,0.08)]">
      <div className="font-mono text-xs text-muted-foreground">第 {world.metrics.turn} / 10 回合</div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{event.title}</h1>
      <p className="mt-1 text-sm text-primary">{event.theme}</p>
      <p className="mt-5 whitespace-pre-line text-sm leading-7 text-foreground/85">{event.description}</p>
      <div className="mt-6 grid gap-3">
        {event.choices.map((choice) => (
          <DecisionButton key={choice.id} choice={choice} disabled={choosing} onChoose={onChoose} />
        ))}
      </div>
    </aside>
  );
}
