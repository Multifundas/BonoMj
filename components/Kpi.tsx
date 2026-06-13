import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function Kpi({
  label,
  value,
  subValue,
  hint,
  accent,
}: {
  label: string;
  value: string;
  /** Línea secundaria bajo el valor (ej. "Neto $X"). */
  subValue?: string;
  hint?: string;
  accent?: "base" | "trueup" | "bonus" | "default";
}) {
  const accentClass =
    accent === "trueup"
      ? "text-pink-500"
      : accent === "bonus"
        ? "text-orange-500"
        : accent === "base"
          ? "text-rose-400"
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
        {subValue && (
          <p className="mt-0.5 text-sm font-medium tabular-nums text-muted-foreground">
            {subValue}
          </p>
        )}
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
