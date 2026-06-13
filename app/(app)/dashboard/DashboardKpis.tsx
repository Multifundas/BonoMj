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
}: {
  totalCreditable: number;
  billable: number;
  trueUp: number;
  bonus: number;
  isEligible: boolean;
  isr: number;
}) {
  const { money } = useCurrency();
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
        hint={isEligible ? "gate de 1,200 superado" : "aún no cruza 1,200"}
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
        subValue={`Neto ${money(applyIsr(bonus, isr))}`}
        hint="horas arriba de 1,700"
        accent="bonus"
      />
    </div>
  );
}
