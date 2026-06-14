"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { Kpi } from "@/components/Kpi";
import { formatHours } from "@/lib/compensation/format";
import { applyIsr } from "@/lib/compensation/tax";

export function DashboardKpis({
  totalCreditable,
  billable,
  trueUp,
  bonus,
  totalVariable,
  isEligible,
  isr,
  par,
}: {
  totalCreditable: number;
  billable: number;
  trueUp: number;
  bonus: number;
  totalVariable: number;
  isEligible: boolean;
  isr: number;
  par: number;
}) {
  const { money } = useCurrency();
  const parLabel = formatHours(par, 0);
  const billableGap = Math.max(par - billable, 0);
  // Las horas cruzan el gate (≠ elegibilidad, que también exige evaluación OK).
  const crossedGate = billable > par;

  // Explica por qué el bono está activo o no.
  // El gate del bono = horas billable > par Y evaluación satisfactoria.
  const bonusHint = isEligible
    ? "horas arriba de 1,700"
    : billableGap > 0
      ? `Bono no activo: faltan ${formatHours(billableGap)} h billable para cruzar el gate de ${parLabel}`
      : `Bono no activo: marca "Evaluación satisfactoria" en Ajustes`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi
        label="Total creditable"
        value={formatHours(totalCreditable)}
        hint="billable + acreditables"
      />
      <Kpi
        label="Billable"
        value={formatHours(billable)}
        hint={
          crossedGate
            ? `gate de ${parLabel} superado`
            : `aún no cruza ${parLabel}`
        }
        accent="base"
      />
      <Kpi
        label="True-up proyectado"
        value={money(trueUp)}
        subValue={`Neto ${money(applyIsr(trueUp, isr))}`}
        hint="horas 1,200 → 1,700"
        accent="trueup"
      />
      <Kpi
        label="Bono proyectado"
        value={money(bonus)}
        subValue={
          isEligible ? `Neto ${money(applyIsr(bonus, isr))}` : `${formatHours(billable)} / ${parLabel} billable`
        }
        hint={bonusHint}
        accent="bonus"
      />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-gradient-to-r from-primary/10 via-accent to-secondary px-6 py-5">
        <div>
          <p className="text-sm font-medium text-primary">
            Compensación variable total
          </p>
          <p className="text-xs text-muted-foreground">
            True-up + bono proyectados
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {money(totalVariable)}
          </p>
          <p className="text-sm text-muted-foreground tabular-nums">
            Neto {money(applyIsr(totalVariable, isr))}
          </p>
        </div>
      </div>
    </div>
  );
}
