import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function Kpi({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "base" | "trueup" | "bonus" | "default";
}) {
  const accentClass =
    accent === "trueup"
      ? "text-emerald-600"
      : accent === "bonus"
        ? "text-amber-600"
        : accent === "base"
          ? "text-slate-600"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={cn("mt-1 text-2xl font-bold tabular-nums", accentClass)}>
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
