import type { EventChoice } from "@/core/types/event";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tagLabels: Record<string, string> = {
  military: "军事",
  political: "政治",
  risky: "高风险",
  stable: "稳健",
  trust_lubu: "信吕布",
  suppress_lubu: "制吕布",
  appease_old_guard: "安旧臣",
  convert_zhang_liao: "转张辽",
  investigation: "调查",
  promise: "承诺",
  trap: "设局",
};

export function DecisionButton({
  choice,
  disabled,
  onChoose,
}: {
  choice: EventChoice;
  disabled?: boolean;
  onChoose: (id: string) => void;
}) {
  const risky = choice.tags.includes("risky");
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChoose(choice.id)}
      className={cn(
        "w-full rounded-lg border bg-card p-4 text-left transition hover:-translate-y-px hover:bg-muted/40 disabled:translate-y-0 disabled:opacity-60",
        risky ? "hover:border-warning/60" : "hover:border-primary/50",
      )}
    >
      <div className="font-medium leading-6">{choice.label}</div>
      <div className="mt-1 text-sm leading-6 text-muted-foreground">{choice.description}</div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {choice.tags.map((tag) => (
          <Badge key={tag} variant={tag === "risky" ? "warning" : tag === "suppress_lubu" ? "destructive" : "secondary"}>
            {tagLabels[tag] ?? tag}
          </Badge>
        ))}
      </div>
    </button>
  );
}
