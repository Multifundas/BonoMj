import { formatHours } from "@/lib/compensation/format";

/**
 * Barra de zonas de compensación con marcadores de hitos.
 * Muestra el progreso de total creditable contra las zonas:
 *   [0..par]  base   |  [par..ceiling] true-up  |  [ceiling..goal] bonus
 */
export function ZoneBar({
  current,
  par,
  ceiling,
  goal,
}: {
  current: number;
  par: number;
  ceiling: number;
  goal: number;
}) {
  const max = Math.max(goal, current, ceiling) * 1.02;
  const pct = (v: number) => `${Math.min((v / max) * 100, 100)}%`;

  return (
    <div className="space-y-2">
      <div className="relative h-6 w-full overflow-hidden rounded-md bg-secondary">
        {/* zona base */}
        <div
          className="absolute inset-y-0 left-0 bg-slate-300"
          style={{ width: pct(par) }}
        />
        {/* zona true-up */}
        <div
          className="absolute inset-y-0 bg-emerald-300"
          style={{ left: pct(par), width: pct(ceiling - par) }}
        />
        {/* zona bonus */}
        <div
          className="absolute inset-y-0 bg-amber-300"
          style={{ left: pct(ceiling), width: pct(Math.max(goal - ceiling, 0)) }}
        />
        {/* progreso actual */}
        <div
          className="absolute inset-y-0 left-0 border-r-2 border-primary bg-primary/30"
          style={{ width: pct(current) }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>0</span>
        <span>par {formatHours(par, 0)}</span>
        <span>bono {formatHours(ceiling, 0)}</span>
        <span>meta {formatHours(goal, 0)}</span>
      </div>
      <p className="text-sm">
        Vas en{" "}
        <span className="font-semibold tabular-nums">
          {formatHours(current)}
        </span>{" "}
        horas creditable.
      </p>
    </div>
  );
}
