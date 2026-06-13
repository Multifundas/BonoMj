import { resolveCompYear } from "@/lib/data/resolve";
import { listHourEntries } from "@/lib/data/queries";
import { buildYearSummary } from "@/lib/data/summary";
import { toCompParams } from "@/lib/compensation/adapters";
import { monthsBetween, weeksBetween } from "@/lib/compensation/dates";
import { EmptyYear } from "@/components/EmptyYear";
import { Calculators } from "./Calculators";

export default async function CalculosPage({
  searchParams,
}: {
  searchParams: { cy?: string };
}) {
  const compYear = await resolveCompYear(searchParams);
  if (!compYear) return <EmptyYear />;

  const entries = await listHourEntries(compYear.id);
  const s = buildYearSummary(compYear, entries);
  const params = toCompParams(compYear);

  const cutoff = s.lastEntryDate ? new Date(s.lastEntryDate) : new Date();
  const end = new Date(compYear.end_date);
  const weeksRemaining = Math.max(weeksBetween(cutoff, end), 0);
  const monthsRemaining = Math.max(monthsBetween(cutoff, end), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calculadoras</h1>
        <p className="text-sm text-muted-foreground">
          Los 4 cálculos clave para planear tu true-up y bono.
        </p>
      </div>

      <Calculators
        params={params}
        snapshot={{
          currentBillable: s.result.billableHours,
          currentTotalCreditable: s.result.totalCreditableHours,
        }}
        currentAdmin={s.sumOtherTotal}
        weeksRemaining={weeksRemaining}
        monthsRemaining={monthsRemaining}
      />
    </div>
  );
}
