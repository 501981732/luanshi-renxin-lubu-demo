import { RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

export function HeaderBar({ turn, onReset }: { turn: number; onReset: () => void }) {
  return (
    <header className="z-20 border-b bg-background/95 backdrop-blur lg:sticky lg:top-0">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div>
          <div className="text-xl font-semibold tracking-tight">乱世人心</div>
          <div className="text-sm text-muted-foreground">吕布来投 Demo</div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="font-mono text-sm text-muted-foreground">第 {turn} / 10 回合</div>
          <Button onClick={onReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
            重开一局
          </Button>
        </div>
      </div>
    </header>
  );
}
