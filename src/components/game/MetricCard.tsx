import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

type MetricCardProps = {
  title: string;
  value: number;
  mode: "higher-good" | "higher-risk";
};

function tone(value: number, mode: MetricCardProps["mode"]) {
  if (mode === "higher-good") {
    if (value < 35) return "danger";
    if (value < 50) return "warning";
    return "good";
  }
  if (value > 75) return "danger";
  if (value > 55) return "warning";
  return "good";
}

const labels = {
  good: "可控",
  warning: "警戒",
  danger: "危险",
};

export function MetricCard({ title, value, mode }: MetricCardProps) {
  const state = tone(value, mode);
  return (
    <Card className="relative overflow-hidden shadow-none">
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          state === "good" && "bg-primary",
          state === "warning" && "bg-warning",
          state === "danger" && "bg-destructive",
        )}
      />
      <CardContent className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div
            className={cn(
              "rounded-md px-1.5 py-0.5 text-xs",
              state === "good" && "bg-primary/10 text-primary",
              state === "warning" && "bg-warning/10 text-warning",
              state === "danger" && "bg-destructive/10 text-destructive",
            )}
          >
            {labels[state]}
          </div>
        </div>
        <div className="mt-3 font-mono text-2xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
