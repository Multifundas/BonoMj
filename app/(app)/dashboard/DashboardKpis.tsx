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
  isEligible,
  isr,
  par,
}: {
  totalCreditable: number;
  billable: number;
  trueUp: number;
  bonus: number;
  isEligible: boolean;
  isr: number;
  par: number;
}) {
  const { money } = useCurrency();
  const parLabel = formatHours(par, 0);
  const billableGap = Math.max(par - billable, 0);

  // Explica por qué el bono está activo o no (el gate es sobre horas billable).
  const bonusHint = isEligible
    ? "horas arriba de 1,700"
    : billableGap > 0
      ? `Bono no activo: faltan ${formatHours(billableGap)} h billable para cruzar el gate de ${parLabel}`
      : "Bono no activo: evaluación no satisfactoria";

  return (
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
          isEligible
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
  );
}
