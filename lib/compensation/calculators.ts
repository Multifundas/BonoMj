import type { CompParams, Hours } from "./types";
import { trueUpCeiling } from "./types";
import {
  bonusRatePerHour,
  clamp,
  creditableOther,
  isBonusEligible,
  totalCreditable,
} from "./core";

/** Estado acumulado al corte (lo que ya lleva en el año). */
export type Snapshot = {
  currentBillable: number;
  currentTotalCreditable: number;
};

// ---------------------------------------------------------------------------
// Cálculo 1 — ¿Cuántas horas necesito para un bono objetivo X?
// ---------------------------------------------------------------------------

export type TargetBonusInput = {
  targetBonus: number;
  snapshot: Snapshot;
  weeksRemaining: number;
  monthsRemaining: number;
};

export type TargetBonusResult = {
  effectiveBonusRatePerHour: number;
  /** Horas (sobre 1700) necesarias para el bono objetivo. */
  needBonusHours: number;
  /** Total creditable requerido para alcanzar el bono. */
  needTotalCreditable: number;
  /** Horas adicionales desde el corte actual. */
  additionalCreditable: number;
  weeklyNeeded: number;
  monthlyNeeded: number;
  /** True si aún no cruza el gate de elegibilidad por billable. */
  gateNotMet: boolean;
  /** Billable faltantes para activar el bono (0 si ya cruzó). */
  billableNeededForGate: number;
};

export function hoursForTargetBonus(
  input: TargetBonusInput,
  p: CompParams,
): TargetBonusResult {
  const rate = bonusRatePerHour(p);
  const needBonusHours = rate > 0 ? input.targetBonus / rate : 0;
  const needTotalCreditable = needBonusHours + trueUpCeiling(p);
  const additionalCreditable = Math.max(
    needTotalCreditable - input.snapshot.currentTotalCreditable,
    0,
  );
  const weeklyNeeded =
    input.weeksRemaining > 0 ? additionalCreditable / input.weeksRemaining : 0;
  const monthlyNeeded =
    input.monthsRemaining > 0
      ? additionalCreditable / input.monthsRemaining
      : 0;

  const gateNotMet = input.snapshot.currentBillable <= p.parHours;
  const billableNeededForGate = gateNotMet
    ? p.parHours - input.snapshot.currentBillable
    : 0;

  return {
    effectiveBonusRatePerHour: rate,
    needBonusHours,
    needTotalCreditable,
    additionalCreditable,
    weeklyNeeded,
    monthlyNeeded,
    gateNotMet,
    billableNeededForGate,
  };
}

// ---------------------------------------------------------------------------
// Cálculo 2 — ¿Cuántas horas me faltan para mi objetivo de horas?
// ---------------------------------------------------------------------------

export type HoursGoalInput = {
  /** Objetivo en total creditable (opcional). */
  goalTotalCreditable?: number;
  /** Objetivo en billable (opcional). */
  goalBillable?: number;
  snapshot: Snapshot;
};

export type HoursGoalResult = {
  remainingTotalCreditable: number | null;
  remainingBillable: number | null;
};

export function hoursRemainingForGoal(input: HoursGoalInput): HoursGoalResult {
  const remainingTotalCreditable =
    input.goalTotalCreditable != null
      ? Math.max(
          input.goalTotalCreditable - input.snapshot.currentTotalCreditable,
          0,
        )
      : null;
  const remainingBillable =
    input.goalBillable != null
      ? Math.max(input.goalBillable - input.snapshot.currentBillable, 0)
      : null;
  return { remainingTotalCreditable, remainingBillable };
}

// ---------------------------------------------------------------------------
// Cálculo 3 — ¿Qué true-up y bono tendría con horas a la fecha X?
// ---------------------------------------------------------------------------

export type ProjectionAtDateResult = {
  isEligible: boolean;
  /** Billable faltantes para el gate (solo relevante si !isEligible). */
  billableNeededForGate: number;
  trueUp: number;
  bonus: number;
  trueUpQualifyingHours: number;
  bonusQualifyingHours: number;
};

export function projectAtCurrentHours(
  h: Hours,
  p: CompParams,
): ProjectionAtDateResult {
  const total = totalCreditable(h, p);
  const eligible = isBonusEligible(h, p);
  const tuQ = clamp(total - p.parHours, 0, p.trueUpMaxHours);
  const bQ = Math.max(total - trueUpCeiling(p), 0);

  return {
    isEligible: eligible,
    billableNeededForGate: eligible
      ? 0
      : Math.max(p.parHours - h.billableHours, 0),
    trueUp: tuQ * p.trueUpRatePerHour,
    bonus: eligible ? bQ * bonusRatePerHour(p) : 0,
    trueUpQualifyingHours: tuQ,
    bonusQualifyingHours: bQ,
  };
}

// ---------------------------------------------------------------------------
// Cálculo 4 — ¿Cuántas administrative hours llevo?
// ---------------------------------------------------------------------------

export type AdminHoursInput = {
  adminToDate: number;
};

export type AdminHoursResult = {
  adminToDate: number;
  creditableContribution: number;
  /** Horas admin "desperdiciadas" arriba del cap (0 si cap apagado). */
  wastedAboveCap: number;
  capActive: boolean;
};

export function adminHoursStatus(
  input: AdminHoursInput,
  p: CompParams,
): AdminHoursResult {
  const creditableContribution = p.applyAdminCap
    ? Math.min(input.adminToDate, p.adminCap)
    : input.adminToDate;
  const wastedAboveCap = p.applyAdminCap
    ? Math.max(input.adminToDate - p.adminCap, 0)
    : 0;
  return {
    adminToDate: input.adminToDate,
    creditableContribution,
    wastedAboveCap,
    capActive: p.applyAdminCap,
  };
}

// Re-export para conveniencia de la UI.
export { creditableOther };
