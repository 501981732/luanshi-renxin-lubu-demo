import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ChronicleItem } from "@/core/types/world";

const typeLabel: Record<ChronicleItem["type"], string> = {
  event: "事件",
  choice: "决策",
  report: "奏报",
  warning: "警告",
  npc: "异动",
  ending: "结局",
};

export function ChroniclePanel({ chronicle }: { chronicle: ChronicleItem[] }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">军中纪事</h2>
      {chronicle.length === 0 ? (
        <Card className="shadow-none">
          <CardContent className="p-4 text-sm text-muted-foreground">尚无记录。</CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {chronicle
            .slice()
            .reverse()
            .map((item) => (
              <Card key={item.id} className="shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.type === "warning" ? "warning" : item.type === "choice" ? "default" : "secondary"}>
                      {typeLabel[item.type]}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">第 {item.turn} 回合</span>
                  </div>
                  <div className="mt-3 font-medium">{item.title}</div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">{item.content}</p>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </section>
  );
}
