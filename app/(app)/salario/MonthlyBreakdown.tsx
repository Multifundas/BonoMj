"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { Kpi } from "@/components/Kpi";
import type { SalaryComponent } from "@/lib/compensation/salary";
import { applyIsr, componentsGrossNet } from "@/lib/compensation/tax";

export function MonthlyBreakdown({
  components,
  variableMonthly,
  variableAnnual,
  fixedMonthly,
  totalMonthly,
  totalAnnual,
  isr,
}: {
  components: SalaryComponent[];
  variableMonthly: number;
  variableAnnual: number;
  fixedMonthly: number;
  totalMonthly: number;
  totalAnnual: number;
  isr: number;
}) {
  const { money } = useCurrency();

  // Fijo respeta is_taxable; variable es 100% gravable.
  const fixedMonthlyNet = componentsGrossNet(components, isr, "monthly").net;
  const fixedAnnualNet = componentsGrossNet(components, isr, "annual").net;
  const variableMonthlyNet = applyIsr(variableMonthly, isr);
  const variableAnnualNet = applyIsr(variableAnnual, isr);
  const totalMonthlyNet = fixedMonthlyNet + variableMonthlyNet;
  const totalAnnualNet = fixedAnnualNet + variableAnnualNet;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi
        label="Fijo mensual"
        value={money(fixedMonthly)}
        subValue={`Neto ${money(fixedMonthlyNet)}`}
        hint="prestaciones prorrateadas"
      />
      <Kpi
        label="Variable mensual"
        value={money(variableMonthly)}
        subValue={`Neto ${money(variableMonthlyNet)}`}
        hint="true-up + bono / 12"
        accent="bonus"
      />
      <Kpi
        label="Compensación mensual real"
        value={money(totalMonthly)}
        subValue={`Neto ${money(totalMonthlyNet)}`}
        accent="trueup"
      />
      <Kpi
        label="Total anual"
        value={money(totalAnnual)}
        subValue={`Neto ${money(totalAnnualNet)}`}
      />
    </div>
  );
}
