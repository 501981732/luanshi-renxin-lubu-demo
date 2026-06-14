import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { StatusBadge } from "./StatusBadge";
import { cn } from "../../lib/utils";

type CharacterCardProps = {
  name: string;
  subtitle: string;
  status: string;
  tone?: "neutral" | "good" | "warning" | "danger" | "info";
  emphasized?: boolean;
  rows: [string, string | number][];
};

export function CharacterCard({ name, subtitle, status, tone, emphasized, rows }: CharacterCardProps) {
  return (
    <Card className={cn("shadow-none", emphasized && "border-primary/50 md:col-span-2")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <StatusBadge label={status} tone={tone} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-mono font-medium tabular-nums">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
