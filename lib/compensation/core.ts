import type { CompParams, CompResult, Hours } from "./types";
import { trueUpCeiling } from "./types";

/** Limita x al rango [min, max]. */
export function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max);
}

/**
 * Horas "other" acreditables tras aplicar (o no) el cap admin.
 * El cap se aplica sobre el total de horas acreditables NO billable.
 */
export function creditableOther(h: Hours, p: CompParams): number {
  return p.applyAdminCap
    ? Math.min(h.otherCreditableHours, p.adminCap)
    : h.otherCreditableHours;
}

/** totalCreditableHours = billable + creditableOther. */
export function totalCreditable(h: Hours, p: CompParams): number {
  return h.billableHours + creditableOther(h, p);
}

/**
 * Gate de elegibilidad — SOBRE BILLABLE, no creditable (sección 2.3).
 * isEligible = billable > parHours && evaluationSatisfactory.
 */
export function isBonusEligible(h: Hours, p: CompParams): boolean {
  return h.billableHours > p.parHours && p.evaluationSatisfactory;
}

/** Tarifa $/hora del bono: explícita si se dio, si no bonusRatePct * blended. */
export function bonusRatePerHour(p: CompParams): number {
  if (p.bonusRatePerHour != null) return p.bonusRatePerHour;
  if (p.blendedBillingRate != null) return p.bonusRatePct * p.blendedBillingRate;
  return 0;
}

/**
 * Horas que califican para true-up.
 * clamp(totalCreditable - parHours, 0, trueUpMaxHours).
 */
export function trueUpQualifyingHours(h: Hours, p: CompParams): number {
  return clamp(totalCreditable(h, p) - p.parHours, 0, p.trueUpMaxHours);
}

/**
 * Horas que califican para production bonus.
 * max(totalCreditable - trueUpCeiling, 0). Clave: techo = 1700, no 1200.
 */
export function bonusQualifyingHours(h: Hours, p: CompParams): number {
  return Math.max(totalCreditable(h, p) - trueUpCeiling(p), 0);
}

/** Salary true-up = trueUpQualifyingHours * trueUpRatePerHour. */
export function salaryTrueUp(h: Hours, p: CompParams): number {
  return trueUpQualifyingHours(h, p) * p.trueUpRatePerHour;
}

/**
 * Production bonus = bonusQualifyingHours * bonusRatePerHour, SOLO si es elegible.
 * El gate de elegibilidad es sobre billable (sección 2.3 / 2.5).
 */
export function productionBonus(h: Hours, p: CompParams): number {
  if (!isBonusEligible(h, p)) return 0;
  return bonusQualifyingHours(h, p) * bonusRatePerHour(p);
}

/** Calcula todo de una sola pasada (conveniencia para UI). */
export function computeCompensation(h: Hours, p: CompParams): CompResult {
  const cOther = creditableOther(h, p);
  const total = h.billableHours + cOther;
  const eligible = isBonusEligible(h, p);
  const tuQ = clamp(total - p.parHours, 0, p.trueUpMaxHours);
  const bQ = Math.max(total - trueUpCeiling(p), 0);
  const effBonusRate = bonusRatePerHour(p);
  const trueUp = tuQ * p.trueUpRatePerHour;
  const bonus = eligible ? bQ * effBonusRate : 0;

  return {
    billableHours: h.billableHours,
    otherCreditableHours: h.otherCreditableHours,
    creditableOther: cOther,
    totalCreditableHours: total,
    isEligible: eligible,
    trueUpQualifyingHours: tuQ,
    bonusQualifyingHours: bQ,
    effectiveBonusRatePerHour: effBonusRate,
    salaryTrueUp: trueUp,
    productionBonus: bonus,
    totalVariable: trueUp + bonus,
  };
}
