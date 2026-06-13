"use client";

import * as React from "react";
import type { PlannedAbsence } from "@/lib/supabase/database.types";
import type { PaceResult } from "@/lib/compensation/pacing";
import { formatHours } from "@/lib/compensation/format";
import { createAbsence, deleteAbsence } from "@/lib/data/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  compYearId: string;
  absences: PlannedAbsence[];
  plannedAbsenceWorkingDays: number;
  pace: PaceResult;
};

const TYPE_LABEL: Record<string, string> = {
  vacaciones: "Vacaciones",
  feriado: "Feriado",
  personal: "Personal",
};

export function AbsencePlanner({
  compYearId,
  absences,
  plannedAbsenceWorkingDays,
  pace,
}: Props) {
  const [pending, startTransition] = React.useTransition();
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [type, setType] = React.useState("vacaciones");
  const [days, setDays] = React.useState("5");
  const [note, setNote] = React.useState("");

  // Impacto: cada día hábil de ausencia resta capacidad al ritmo requerido.
  // Horas que dejarías de hacer ≈ días × horas/día hábil requeridas.
  const hoursAtRisk =
    plannedAbsenceWorkingDays * pace.requiredHoursPerWorkingDay;

  function onAdd() {
    startTransition(async () => {
      await createAbsence({
        comp_year_id: compYearId,
        start_date: start,
        end_date: end,
        type,
        working_days: Number(days) || 0,
        note: note || null,
      });
      setStart("");
      setEnd("");
      setDays("5");
      setNote("");
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      await deleteAbsence(id);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planeador de ausencias</CardTitle>
        <CardDescription>
          Registra vacaciones y feriados para ver su impacto en el ritmo. Total
          planeado: {plannedAbsenceWorkingDays} días hábiles (≈{" "}
          {formatHours(hoursAtRisk)} horas a recuperar).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-5">
          <div className="space-y-1">
            <Label htmlFor="ab-start">Inicio</Label>
            <Input
              id="ab-start"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ab-end">Fin</Label>
            <Input
              id="ab-end"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ab-type">Tipo</Label>
            <Select
              id="ab-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="vacaciones">Vacaciones</option>
              <option value="feriado">Feriado</option>
              <option value="personal">Personal</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="ab-days">Días hábiles</Label>
            <Input
              id="ab-days"
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ab-note">Nota</Label>
            <Input
              id="ab-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <Button
          onClick={onAdd}
          disabled={pending || !start || !end}
        >
          Agregar ausencia
        </Button>

        {absences.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Periodo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Días hábiles</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {absences.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    {a.start_date} → {a.end_date}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {TYPE_LABEL[a.type] ?? a.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{a.working_days}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {a.note}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(a.id)}
                      disabled={pending}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
