import "server-only";
import type {
  CompensationYear,
  HourEntry,
} from "@/lib/supabase/database.types";
import {
  computeCompensation,
  trueUpCeiling,
  type CompResult,
  type Hours,
} from "@/lib/compensation";
import { toCompParams } from "@/lib/compensation/adapters";
import { weeksBetween } from "@/lib/compensation/dates";

export type YearSummary = {
  compYear: CompensationYear;
  sumBillable: number;
  sumAdmin: number;
  sumOther: number;
  /** other total = admin + other (antes del cap). */
  sumOtherTotal: number;
  hours: Hours;
  result: CompResult;
  par: number;
  ceiling: number;
  /** Ritmo real horas/semana de creditable, desde el inicio del año al último corte. */
  actualWeeklyPace: number;
  /** Fecha del último corte (entry_date máx) o null. */
  lastEntryDate: string | null;
  entryCount: number;
};

/**
 * Construye el resumen del año a partir de las entradas de horas
 * usando la lógica pura como fuente de verdad.
 */
export function buildYearSummary(
  compYear: CompensationYear,
  entries: HourEntry[],
): YearSummary {
  const sumBillable = entries.reduce((s, e) => s + Number(e.billable_hours), 0);
  const sumAdmin = entries.reduce((s, e) => s + Number(e.admin_hours), 0);
  const sumOther = entries.reduce(
    (s, e) => s + Number(e.other_creditable_hours),
    0,
  );
  const sumOtherTotal = sumAdmin + sumOther;

  const params = toCompParams(compYear);
  const hours: Hours = {
    billableHours: sumBillable,
    otherCreditableHours: sumOtherTotal,
  };
  const result = computeCompensation(hours, params);

  // Ritmo real: total creditable / semanas transcurridas desde el inicio.
  const start = new Date(compYear.start_date);
  const dates = entries
    .map((e) => e.entry_date)
    .sort();
  const lastEntryDate = dates.length ? dates[dates.length - 1] : null;
  const elapsedWeeks = lastEntryDate
    ? Math.max(weeksBetween(start, new Date(lastEntryDate)), 1)
    : 1;
  const actualWeeklyPace = result.totalCreditableHours / elapsedWeeks;

  return {
    compYear,
    sumBillable,
    sumAdmin,
    sumOther,
    sumOtherTotal,
    hours,
    result,
    par: Number(compYear.par_hours),
    ceiling: trueUpCeiling(params),
    actualWeeklyPace,
    lastEntryDate,
    entryCount: entries.length,
  };
}
