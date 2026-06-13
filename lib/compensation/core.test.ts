import { describe, expect, it } from "vitest";
import {
  bonusQualifyingHours,
  bonusRatePerHour,
  computeCompensation,
  creditableOther,
  isBonusEligible,
  productionBonus,
  salaryTrueUp,
  totalCreditable,
  trueUpQualifyingHours,
} from "./core";
import { DEFAULT_COMP_PARAMS } from "./constants";
import type { CompParams, Hours } from "./types";
import { round } from "./format";

/**
 * Params CY26 de la sección 10:
 *   blended = 318.40  ->  37.5% = 119.40
 *   trueUpRatePerHour = 70.35054  (deriva $35,175.27 / 500; ver RULES_NOTES.md)
 *   applyAdminCap = false
 */
const CY26: CompParams = {
  ...DEFAULT_COMP_PARAMS,
  blendedBillingRate: 318.4,
  bonusRatePct: 0.375,
  trueUpRatePerHour: 70.35054,
  applyAdminCap: false,
};

describe("CY26 — caso de aceptación principal", () => {
  const h: Hours = { billableHours: 1710.0, otherCreditableHours: 114.1 };

  it("bonusRatePerHour = 119.40", () => {
    expect(round(bonusRatePerHour(CY26), 2)).toBe(119.4);
  });

  it("totalCreditable = 1824.1", () => {
    expect(round(totalCreditable(h, CY26), 1)).toBe(1824.1);
  });

  it("isEligible = true (1710 > 1200)", () => {
    expect(isBonusEligible(h, CY26)).toBe(true);
  });

  it("trueUpQualifyingHours = 500.0", () => {
    expect(round(trueUpQualifyingHours(h, CY26), 1)).toBe(500.0);
  });

  it("salaryTrueUp ≈ $35,175.27", () => {
    expect(round(salaryTrueUp(h, CY26), 2)).toBe(35175.27);
  });

  it("bonusQualifyingHours ≈ 124.1 (inputs exactos)", () => {
    expect(round(bonusQualifyingHours(h, CY26), 2)).toBe(124.1);
  });

  it("productionBonus = $14,817.54 con inputs exactos (ver RULES_NOTES.md §6)", () => {
    // El despacho reporta $14,815.06 usando other=114.08; con other=114.1
    // (input exacto del prompt) la fórmula da $14,817.54.
    expect(round(productionBonus(h, CY26), 2)).toBe(14817.54);
  });

  it("computeCompensation agrega todo de forma consistente", () => {
    const r = computeCompensation(h, CY26);
    expect(round(r.salaryTrueUp, 2)).toBe(35175.27);
    expect(round(r.productionBonus, 2)).toBe(14817.54);
    expect(round(r.totalVariable, 2)).toBe(round(35175.27 + 14817.54, 2));
  });
});

describe("Qualifying ejemplo (sección 10)", () => {
  it("totalCreditable=1805.6 → bonusQualifyingHours = 105.6", () => {
    // billable alto para garantizar elegibilidad; total = 1805.6.
    const h: Hours = { billableHours: 1700, otherCreditableHours: 105.6 };
    expect(round(totalCreditable(h, CY26), 1)).toBe(1805.6);
    expect(round(bonusQualifyingHours(h, CY26), 1)).toBe(105.6);
  });
});

describe("Elegibilidad (gate sobre billable)", () => {
  it("billable=1750.5 → eligible = true", () => {
    const h: Hours = { billableHours: 1750.5, otherCreditableHours: 0 };
    expect(isBonusEligible(h, CY26)).toBe(true);
  });

  it("billable=1100.0 → eligible = false (no true-up por billable, no bono)", () => {
    const h: Hours = { billableHours: 1100.0, otherCreditableHours: 0 };
    expect(isBonusEligible(h, CY26)).toBe(false);
    expect(productionBonus(h, CY26)).toBe(0);
  });

  it("evaluación NO satisfactoria → no elegible aunque billable > par", () => {
    const params = { ...CY26, evaluationSatisfactory: false };
    const h: Hours = { billableHours: 1800, otherCreditableHours: 100 };
    expect(isBonusEligible(h, params)).toBe(false);
    expect(productionBonus(h, params)).toBe(0);
  });
});

describe("Cap admin", () => {
  const h: Hours = { billableHours: 1700, otherCreditableHours: 150 };

  it("apagado (default): acredita todas las other", () => {
    expect(creditableOther(h, CY26)).toBe(150);
  });

  it("encendido: topa other al adminCap", () => {
    const params = { ...CY26, applyAdminCap: true, adminCap: 100 };
    expect(creditableOther(h, params)).toBe(100);
  });
});

describe("Reglas estructurales", () => {
  it("true-up tope: no excede trueUpMaxHours aunque sobren horas", () => {
    const h: Hours = { billableHours: 3000, otherCreditableHours: 0 };
    expect(trueUpQualifyingHours(h, CY26)).toBe(500);
  });

  it("sin horas arriba de 1700 → bono = 0", () => {
    const h: Hours = { billableHours: 1650, otherCreditableHours: 0 };
    expect(bonusQualifyingHours(h, CY26)).toBe(0);
    expect(productionBonus(h, CY26)).toBe(0);
  });
});
