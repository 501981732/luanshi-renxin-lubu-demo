import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { WorldState } from "@/core/types/world";

export function DebugPanel({ world }: { world: WorldState }) {
  return (
    <Collapsible className="rounded-lg border bg-card">
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-sm font-medium">
        Debug WorldState
        <span className="text-xs text-muted-foreground">展开</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="max-h-[480px] overflow-auto border-t bg-muted/60 p-4 text-xs leading-5">
          {JSON.stringify(world, null, 2)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}
