/**
 * Proyección, ritmo y simulación de ausencias (sección 8).
 * Todo puro: recibe fechas y números, devuelve números.
 */

import type { CompParams } from "./types";
import { trueUpCeiling } from "./types";
import {
  businessDaysBetween,
  inclusiveDays,
  monthsBetween,
  weeksBetween,
} from "./dates";

export type PaceStatus = "adelantada" | "en_ritmo" | "atrasada";

export type AbsencePlan = {
  /** Días hábiles totales de ausencia planeada en el periodo restante. */
  plannedAbsenceWorkingDays: number;
};

export type PaceInput = {
  cutoffDate: Date;
  compYearEnd: Date;
  currentTotalCreditable: number;
  /** Meta de total creditable (ej. 1700 piso del bono, o meta de bono/horas). */
  goalTotalCreditable: number;
  /** Horas/semana reales observadas hasta el corte. */
  actualWeeklyPace: number;
  absences?: AbsencePlan;
};

export type PaceResult = {
  additionalCreditableNeeded: number;
  daysRemaining: number;
  weeksRemaining: number;
  monthsRemaining: number;
  workingDaysRemaining: number;
  requiredWeeklyPace: number;
  requiredHoursPerWorkingDay: number;
  status: PaceStatus;
  /** Proyección a fin de año si mantiene el ritmo actual. */
  projectedEndOfYearTotalCreditable: number;
};

/**
 * Calcula el ritmo requerido vs. el actual y el estado.
 * El periodo restante va del día SIGUIENTE al corte hasta el fin del año fiscal.
 */
export function computePace(input: PaceInput, _p?: CompParams): PaceResult {
  const dayAfterCutoff = new Date(input.cutoffDate.getTime() + 24 * 3600 * 1000);

  const additionalCreditableNeeded = Math.max(
    input.goalTotalCreditable - input.currentTotalCreditable,
    0,
  );

  const daysRemaining = inclusiveDays(dayAfterCutoff, input.compYearEnd);
  const weeksRemaining = weeksBetween(dayAfterCutoff, input.compYearEnd);
  const monthsRemaining = monthsBetween(dayAfterCutoff, input.compYearEnd);

  const businessDays = businessDaysBetween(dayAfterCutoff, input.compYearEnd);
  const plannedAbsence = input.absences?.plannedAbsenceWorkingDays ?? 0;
  const workingDaysRemaining = Math.max(businessDays - plannedAbsence, 0);

  const requiredWeeklyPace =
    weeksRemaining > 0 ? additionalCreditableNeeded / weeksRemaining : 0;
  const requiredHoursPerWorkingDay =
    workingDaysRemaining > 0
      ? additionalCreditableNeeded / workingDaysRemaining
      : 0;

  // Proyección EOY con el ritmo actual.
  const projectedEndOfYearTotalCreditable =
    input.currentTotalCreditable + input.actualWeeklyPace * weeksRemaining;

  const status = paceStatus(input.actualWeeklyPace, requiredWeeklyPace);

  return {
    additionalCreditableNeeded,
    daysRemaining,
    weeksRemaining,
    monthsRemaining,
    workingDaysRemaining,
    requiredWeeklyPace,
    requiredHoursPerWorkingDay,
    status,
    projectedEndOfYearTotalCreditable,
  };
}

/**
 * Estado del ritmo con tolerancia del 2% para "en ritmo".
 */
export function paceStatus(
  actualWeekly: number,
  requiredWeekly: number,
): PaceStatus {
  if (requiredWeekly <= 0) return "adelantada";
  const ratio = actualWeekly / requiredWeekly;
  if (ratio >= 1.02) return "adelantada";
  if (ratio >= 0.98) return "en_ritmo";
  return "atrasada";
}

export type ScenarioKind = "optimista" | "realista" | "conservador";

/** Multiplicadores de escenario para la proyección EOY (sección 12.11). */
export const SCENARIO_MULTIPLIERS: Record<ScenarioKind, number> = {
  optimista: 1.15,
  realista: 1.0,
  conservador: 0.85,
};

/** Proyección de total creditable a fin de año bajo un escenario. */
export function projectScenario(
  currentTotalCreditable: number,
  actualWeeklyPace: number,
  weeksRemaining: number,
  scenario: ScenarioKind,
): number {
  const m = SCENARIO_MULTIPLIERS[scenario];
  return currentTotalCreditable + actualWeeklyPace * m * weeksRemaining;
}

/** Piso del bono para usar como meta por defecto en el pace. */
export const bonusFloor = (p: CompParams): number => trueUpCeiling(p);
