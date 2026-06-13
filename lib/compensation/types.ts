/**
 * Tipos del dominio de compensación.
 *
 * Todas las unidades:
 *  - horas: número decimal (precisión completa, se redondea solo al mostrar).
 *  - tarifas y montos: USD por defecto (la conversión de moneda es de UI).
 */

/** Parámetros configurables por compensation year. */
export type CompParams = {
  /** Par / umbral base. Default 1200. */
  parHours: number;
  /** Tope de horas que califican para true-up. Default 500. */
  trueUpMaxHours: number;
  /** Porcentaje del blended billing rate para el bono. Default 0.375. */
  bonusRatePct: number;
  /** Tarifa blended estándar/regional del año (opcional si se da bonusRatePerHour). */
  blendedBillingRate?: number;
  /** Tarifa $/hora del bono. Si no se da, se calcula como bonusRatePct * blendedBillingRate. */
  bonusRatePerHour?: number;
  /** Tarifa $/hora del true-up. NO viene en las reglas: input requerido. */
  trueUpRatePerHour: number;
  /** Si true, las horas admin se topan a adminCap antes de acreditar. Default false. */
  applyAdminCap: boolean;
  /** Tope de horas admin acreditables si applyAdminCap = true. Default 100. */
  adminCap: number;
  /** Requisito de evaluación satisfactoria para el bono. Default true. */
  evaluationSatisfactory: boolean;
};

/**
 * Horas de entrada para los cálculos.
 *
 * `otherCreditableHours` agrupa todas las horas acreditables NO billable
 * (administrativas + otras). El cap admin, si aplica, se aplica sobre este total.
 */
export type Hours = {
  billableHours: number;
  otherCreditableHours: number;
};

/** Resultado completo de un cálculo de compensación. */
export type CompResult = {
  billableHours: number;
  otherCreditableHours: number;
  creditableOther: number;
  totalCreditableHours: number;
  isEligible: boolean;
  trueUpQualifyingHours: number;
  bonusQualifyingHours: number;
  effectiveBonusRatePerHour: number;
  salaryTrueUp: number;
  productionBonus: number;
  /** trueUp + bono (lo variable total). */
  totalVariable: number;
};

/** El techo efectivo del true-up = parHours + trueUpMaxHours. */
export const trueUpCeiling = (p: CompParams): number =>
  p.parHours + p.trueUpMaxHours;
