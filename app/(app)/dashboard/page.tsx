import Link from "next/link";
import { resolveCompYear } from "@/lib/data/resolve";
import { listHourEntries, listGoals } from "@/lib/data/queries";
import { buildYearSummary } from "@/lib/data/summary";
import { computePace } from "@/lib/compensation/pacing";
import { buildAlerts } from "@/lib/compensation/alerts";
import { toCompParams } from "@/lib/compensation/adapters";
import { formatHours } from "@/lib/compensation/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyYear } from "@/components/EmptyYear";
import { ZoneBar } from "@/components/ZoneBar";
import { PaceBadge } from "@/components/PaceBadge";
import { Alerts } from "@/components/Alerts";
import { DashboardKpis } from "./DashboardKpis";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { cy?: string };
}) {
  const compYear = await resolveCompYear(searchParams);
  if (!compYear) return <EmptyYear />;

  const [entries, goals] = await Promise.all([
    listHourEntries(compYear.id),
    listGoals(compYear.id),
  ]);
  const s = buildYearSummary(compYear, entries);

  // Meta de horas: usa goal de tipo total_creditable_hours si existe, si no el ceiling.
  const hoursGoal =
    goals.find((g) => g.type === "total_creditable_hours")?.target_value ??
    s.ceiling;

  const pace = computePace({
    cutoffDate: s.lastEntryDate ? new Date(s.lastEntryDate) : new Date(),
    compYearEnd: new Date(compYear.end_date),
    currentTotalCreditable: s.result.totalCreditableHours,
    goalTotalCreditable: Number(hoursGoal),
    actualWeeklyPace: s.actualWeeklyPace,
  });

  const alerts = buildAlerts({
    result: s.result,
    params: toCompParams(compYear),
    paceStatus: pace.status,
    additionalCreditableNeeded: pace.additionalCreditableNeeded,
    weeksRemaining: pace.weeksRemaining,
    adminToDate: s.sumAdmin,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard — {compYear.label}
          </h1>
          <p className="text-sm text-muted-foreground">
            {compYear.start_date} → {compYear.end_date}
          </p>
        </div>
        <PaceBadge status={pace.status} />
      </div>

      <Alerts alerts={alerts} />

      <DashboardKpis
        totalCreditable={s.result.totalCreditableHours}
        billable={s.result.billableHours}
        trueUp={s.result.salaryTrueUp}
        bonus={s.result.productionBonus}
        isEligible={s.result.isEligible}
        isr={toCompParams(compYear).isrEffectiveRatePct}
      />

      <Card>
        <CardHeader>
          <CardTitle>Progreso del año</CardTitle>
        </CardHeader>
        <CardContent>
          <ZoneBar
            current={s.result.totalCreditableHours}
            par={s.par}
            ceiling={s.ceiling}
            goal={Number(hoursGoal)}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ritmo requerido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              Faltan{" "}
              <span className="font-semibold tabular-nums">
                {formatHours(pace.additionalCreditableNeeded)}
              </span>{" "}
              horas para la meta.
            </p>
            <p className="text-muted-foreground">
              {formatHours(pace.requiredWeeklyPace)} h/semana ·{" "}
              {formatHours(pace.requiredHoursPerWorkingDay)} h/día hábil
            </p>
            <p className="text-muted-foreground">
              Tu ritmo actual: {formatHours(s.actualWeeklyPace)} h/semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proyección fin de año</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              Si mantienes el ritmo:{" "}
              <span className="font-semibold tabular-nums">
                {formatHours(pace.projectedEndOfYearTotalCreditable)}
              </span>{" "}
              h creditable.
            </p>
            <p className="text-muted-foreground">
              {pace.weeksRemaining > 0
                ? `${formatHours(pace.weeksRemaining)} semanas restantes`
                : "Año cerrado"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cortes registrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              {s.entryCount} cortes ·{" "}
              {s.lastEntryDate
                ? `último: ${s.lastEntryDate}`
                : "sin capturas aún"}
            </p>
            <Link
              href="/horas"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Capturar horas
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
