import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  label: string;
  tone?: "neutral" | "good" | "warning" | "danger" | "info";
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  const variant =
    tone === "danger" ? "destructive" : tone === "warning" ? "warning" : tone === "info" ? "info" : tone === "good" ? "default" : "secondary";
  return <Badge variant={variant}>{label}</Badge>;
}
