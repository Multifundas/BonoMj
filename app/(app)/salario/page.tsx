import { resolveCompYear } from "@/lib/data/resolve";
import {
  listCompYears,
  listHourEntries,
  listSalaryComponents,
} from "@/lib/data/queries";
import { buildYearSummary } from "@/lib/data/summary";
import {
  compensationBreakdown,
  yearOverYearGrowth,
  type SalaryComponent,
  type YearTotal,
} from "@/lib/compensation/salary";
import { toCompParams } from "@/lib/compensation/adapters";
import { applyIsr, componentsGrossNet } from "@/lib/compensation/tax";
import { EmptyYear } from "@/components/EmptyYear";
import { SalaryManager } from "./SalaryManager";
import { MonthlyBreakdown } from "./MonthlyBreakdown";
import { GrowthSection, type NetByLabel } from "./GrowthSection";

function toPureComponent(c: {
  name: string;
  category: string;
  amount: number;
  frequency: string;
  is_taxable: boolean;
}): SalaryComponent {
  return {
    name: c.name,
    category: c.category as SalaryComponent["category"],
    amount: Number(c.amount),
    frequency: c.frequency as SalaryComponent["frequency"],
    isTaxable: c.is_taxable,
  };
}

export default async function SalarioPage({
  searchParams,
}: {
  searchParams: { cy?: string };
}) {
  const compYear = await resolveCompYear(searchParams);
  if (!compYear) return <EmptyYear />;

  const [components, entries, allYears] = await Promise.all([
    listSalaryComponents(compYear.id),
    listHourEntries(compYear.id),
    listCompYears(),
  ]);

  const s = buildYearSummary(compYear, entries);
  const pureComponents = components.map(toPureComponent);
  const isr = toCompParams(compYear).isrEffectiveRatePct;
  const breakdown = compensationBreakdown(
    pureComponents,
    s.result.totalVariable,
  );

  // Comparativo multi-año: por cada año, sumar componentes + variable derivado.
  const yearTotals: YearTotal[] = [];
  const netByLabel: NetByLabel = {};
  for (const y of [...allYears].sort((a, b) =>
    a.start_date.localeCompare(b.start_date),
  )) {
    const [comps, ents] = await Promise.all([
      listSalaryComponents(y.id),
      listHourEntries(y.id),
    ]);
    const ys = buildYearSummary(y, ents);
    const pcs = comps.map(toPureComponent);
    const base = pcs
      .filter((c) => c.category === "base")
      .reduce((sum, c) => sum + annualize(c), 0);
    const benefits = pcs
      .filter((c) => c.category !== "base")
      .reduce((sum, c) => sum + annualize(c), 0);
    const variable = ys.result.salaryTrueUp + ys.result.productionBonus;
    const total = base + benefits + variable;
    yearTotals.push({
      label: y.label,
      base,
      benefits,
      trueUp: ys.result.salaryTrueUp,
      bonus: ys.result.productionBonus,
      total,
    });
    // Neto del año: fijo respeta is_taxable; variable 100% gravable.
    const yIsr = toCompParams(y).isrEffectiveRatePct;
    const fixedNet = componentsGrossNet(pcs, yIsr, "annual").net;
    netByLabel[y.label] = fixedNet + applyIsr(variable, yIsr);
  }
  const growth = yearOverYearGrowth(yearTotals);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Salario y prestaciones
        </h1>
        <p className="text-sm text-muted-foreground">
          Compensación mensual real y crecimiento histórico.
        </p>
      </div>

      <MonthlyBreakdown
        components={pureComponents}
        fixedMonthly={breakdown.fixedMonthly}
        variableMonthly={breakdown.variableMonthly}
        variableAnnual={breakdown.variableAnnual}
        totalMonthly={breakdown.totalMonthly}
        totalAnnual={breakdown.totalAnnual}
        isr={isr}
      />

      <SalaryManager
        compYearId={compYear.id}
        components={components}
        isr={isr}
      />

      <GrowthSection growth={growth} netByLabel={netByLabel} />
    </div>
  );
}

// helper local (anual) para evitar importar la fn pura con tipos estrictos dos veces
function annualize(c: SalaryComponent): number {
  if (c.frequency === "mensual") return c.amount * 12;
  return c.amount;
}
