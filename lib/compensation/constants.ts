import type { CompParams } from "./types";

/**
 * Defaults del modelo unificado (sección 2.1 del prompt).
 *
 * `trueUpRatePerHour` y `blendedBillingRate` son inputs por año; aquí se ponen
 * los del ejemplo CY26 como semilla razonable, NO como verdad universal.
 */
export const DEFAULT_COMP_PARAMS: CompParams = {
  parHours: 1200,
  trueUpMaxHours: 500,
  bonusRatePct: 0.375,
  blendedBillingRate: 318.4,
  // bonusRatePerHour omitido a propósito: se deriva de blendedBillingRate.
  trueUpRatePerHour: 70.35054, // deriva $35,175.27 / 500 (ver RULES_NOTES.md)
  applyAdminCap: false,
  adminCap: 100,
  evaluationSatisfactory: true,
};

/** Inicio/fin del compensation year (1-may → 30-abr). Mes 0-indexado. */
export const COMP_YEAR_START_MONTH = 4; // mayo
export const COMP_YEAR_START_DAY = 1;
export const COMP_YEAR_END_MONTH = 3; // abril
export const COMP_YEAR_END_DAY = 30;
