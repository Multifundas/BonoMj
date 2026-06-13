"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { Kpi } from "@/components/Kpi";

export function MonthlyBreakdown({
  fixedMonthly,
  variableMonthly,
  totalMonthly,
  totalAnnual,
}: {
  fixedMonthly: number;
  variableMonthly: number;
  totalMonthly: number;
  totalAnnual: number;
}) {
  const { money } = useCurrency();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi label="Fijo mensual" value={money(fixedMonthly)} hint="prestaciones prorrateadas" />
      <Kpi
        label="Variable mensual"
        value={money(variableMonthly)}
        hint="true-up + bono / 12"
        accent="bonus"
      />
      <Kpi
        label="Compensación mensual real"
        value={money(totalMonthly)}
        accent="trueup"
      />
      <Kpi label="Total anual" value={money(totalAnnual)} />
    </div>
  );
}
