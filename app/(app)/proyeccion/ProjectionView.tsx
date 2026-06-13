"use client";

import * as React from "react";
import type { CompParams } from "@/lib/compensation/types";
import {
  projectScenario,
  type PaceResult,
  type ScenarioKind,
} from "@/lib/compensation/pacing";
import { computeCompensation } from "@/lib/compensation/core";
import { formatHours } from "@/lib/compensation/format";
import { useCurrency } from "@/components/CurrencyProvider";
import { PaceBadge } from "@/components/PaceBadge";
import { Kpi } from "@/components/Kpi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  params: CompParams;
  currentTotalCreditable: number;
  actualWeeklyPace: number;
  pace: PaceResult;
  cutoffLabel: string | null;
};

const SCENARIOS: { kind: ScenarioKind; label: string }[] = [
  { kind: "conservador", label: "Conservador" },
  { kind: "realista", label: "Realista" },
  { kind: "optimista", label: "Optimista" },
];

export function ProjectionView({
  params,
  currentTotalCreditable,
  actualWeeklyPace,
  pace,
  cutoffLabel,
}: Props) {
  const { money } = useCurrency();

  const rows = SCENARIOS.map(({ kind, label }) => {
    const projected = projectScenario(
      currentTotalCreditable,
      actualWeeklyPace,
      pace.weeksRemaining,
      kind,
    );
    // Para estimar la compensación, tratamos el total creditable proyectado
    // como billable (el gate y el techo dependen de horas billable).
    const comp = computeCompensation(
      { billableHours: projected, otherCreditableHours: 0 },
      params,
    );
    return { kind, label, projected, total: comp.totalVariable };
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi
          label="Ritmo actual"
          value={`${formatHours(actualWeeklyPace)} h/sem`}
          accent="default"
        />
        <Kpi
          label="Ritmo requerido (bono)"
          value={`${formatHours(pace.requiredWeeklyPace)} h/sem`}
          accent="trueup"
        />
        <Kpi
          label="Proyección fin de año"
          value={`${formatHours(pace.projectedEndOfYearTotalCreditable)} h`}
          accent="bonus"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Estado vs. el piso del bono (1,700)</CardTitle>
              <CardDescription>
                {cutoffLabel
                  ? `Corte al ${cutoffLabel}.`
                  : "Aún sin cortes registrados."}{" "}
                Faltan {formatHours(pace.additionalCreditableNeeded)} horas
                creditable.
              </CardDescription>
            </div>
            <PaceBadge status={pace.status} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-muted-foreground">Semanas restantes</p>
            <p className="font-semibold">{pace.weeksRemaining.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Días hábiles restantes</p>
            <p className="font-semibold">{pace.workingDaysRemaining}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Horas/día hábil requeridas</p>
            <p className="font-semibold">
              {formatHours(pace.requiredHoursPerWorkingDay)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Escenarios de fin de año</CardTitle>
          <CardDescription>
            Proyección de total creditable y compensación variable según el
            ritmo (conservador −15%, realista, optimista +15%).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escenario</TableHead>
                <TableHead className="text-right">
                  Total creditable proyectado
                </TableHead>
                <TableHead className="text-right">
                  Compensación variable
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.kind}>
                  <TableCell className="font-medium">{r.label}</TableCell>
                  <TableCell className="text-right">
                    {formatHours(r.projected)} h
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {money(r.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
