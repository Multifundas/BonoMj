import { resolveCompYear } from "@/lib/data/resolve";
import { listHourEntries, listAbsences } from "@/lib/data/queries";
import { buildYearSummary } from "@/lib/data/summary";
import { toCompParams } from "@/lib/compensation/adapters";
import { computePace, bonusFloor } from "@/lib/compensation/pacing";
import { EmptyYear } from "@/components/EmptyYear";
import { ProjectionView } from "./ProjectionView";
import { AbsencePlanner } from "./AbsencePlanner";

export default async function ProyeccionPage({
  searchParams,
}: {
  searchParams: { cy?: string };
}) {
  const compYear = await resolveCompYear(searchParams);
  if (!compYear) return <EmptyYear />;

  const [entries, absences] = await Promise.all([
    listHourEntries(compYear.id),
    listAbsences(compYear.id),
  ]);

  const s = buildYearSummary(compYear, entries);
  const params = toCompParams(compYear);

  const cutoff = s.lastEntryDate
    ? new Date(s.lastEntryDate)
    : new Date(compYear.start_date);
  const compYearEnd = new Date(compYear.end_date);

  const plannedAbsenceWorkingDays = absences.reduce(
    (sum, a) => sum + Number(a.working_days),
    0,
  );

  const pace = computePace({
    cutoffDate: cutoff,
    compYearEnd,
    currentTotalCreditable: s.result.totalCreditableHours,
    goalTotalCreditable: bonusFloor(params),
    actualWeeklyPace: s.actualWeeklyPace,
    absences: { plannedAbsenceWorkingDays },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Proyección y ritmo
        </h1>
        <p className="text-sm text-muted-foreground">
          A dónde llegas si mantienes el ritmo, y qué necesitas para el bono.
        </p>
      </div>

      <ProjectionView
        params={params}
        currentTotalCreditable={s.result.totalCreditableHours}
        actualWeeklyPace={s.actualWeeklyPace}
        pace={pace}
        cutoffLabel={s.lastEntryDate}
      />

      <AbsencePlanner
        compYearId={compYear.id}
        absences={absences}
        plannedAbsenceWorkingDays={plannedAbsenceWorkingDays}
        pace={pace}
      />
    </div>
  );
}
