import { describe, expect, it } from "vitest";
import {
  adminHoursStatus,
  hoursForTargetBonus,
  hoursRemainingForGoal,
  projectAtCurrentHours,
} from "./calculators";
import { DEFAULT_COMP_PARAMS } from "./constants";
import type { CompParams } from "./types";
import { round } from "./format";

const CY26: CompParams = {
  ...DEFAULT_COMP_PARAMS,
  blendedBillingRate: 318.4,
  trueUpRatePerHour: 70.35054,
  applyAdminCap: false,
};

describe("Cálculo 1 — horas para un bono objetivo", () => {
  it("targetBonus=14817.54 → needBonusHours ≈ 124.1, total ≈ 1824.1", () => {
    const r = hoursForTargetBonus(
      {
        targetBonus: 14817.54,
        snapshot: { currentBillable: 1700, currentTotalCreditable: 1800 },
        weeksRemaining: 4,
        monthsRemaining: 1,
      },
      CY26,
    );
    expect(round(r.effectiveBonusRatePerHour, 2)).toBe(119.4);
    expect(round(r.needBonusHours, 1)).toBe(124.1);
    // needTotalCreditable = needBonusHours + trueUpCeiling (1700) = 1824.1
    expect(round(r.needTotalCreditable, 1)).toBe(1824.1);
    // additionalCreditable = 1824.1 - currentTotalCreditable (1800) = 24.1
    expect(round(r.additionalCreditable, 1)).toBe(24.1);
    // weeklyNeeded reparte las horas adicionales entre las semanas restantes.
    expect(round(r.weeklyNeeded, 4)).toBe(round(r.additionalCreditable / 4, 4));
    expect(round(r.monthlyNeeded, 4)).toBe(round(r.additionalCreditable / 1, 4));
    expect(r.gateNotMet).toBe(false);
  });

  it("advierte gate cuando billable <= par", () => {
    const r = hoursForTargetBonus(
      {
        targetBonus: 10000,
        snapshot: { currentBillable: 1100, currentTotalCreditable: 1100 },
        weeksRemaining: 10,
        monthsRemaining: 2.5,
      },
      CY26,
    );
    expect(r.gateNotMet).toBe(true);
    expect(r.billableNeededForGate).toBe(100);
  });
});

describe("Cálculo 2 — horas faltantes para meta", () => {
  it("meta en total creditable y billable", () => {
    const r = hoursRemainingForGoal({
      goalTotalCreditable: 1900,
      goalBillable: 1800,
      snapshot: { currentBillable: 1500, currentTotalCreditable: 1600 },
    });
    expect(r.remainingTotalCreditable).toBe(300);
    expect(r.remainingBillable).toBe(300);
  });

  it("no negativo si ya superó la meta", () => {
    const r = hoursRemainingForGoal({
      goalBillable: 1000,
      snapshot: { currentBillable: 1500, currentTotalCreditable: 1600 },
    });
    expect(r.remainingBillable).toBe(0);
    expect(r.remainingTotalCreditable).toBeNull();
  });
});

describe("Cálculo 3 — proyección con horas actuales", () => {
  it("elegible: devuelve true-up y bono", () => {
    const r = projectAtCurrentHours(
      { billableHours: 1710, otherCreditableHours: 114.1 },
      CY26,
    );
    expect(r.isEligible).toBe(true);
    expect(round(r.trueUp, 2)).toBe(35175.27);
    expect(round(r.bonus, 2)).toBe(14817.54);
  });

  it("no elegible: reporta billable faltante para el gate", () => {
    const r = projectAtCurrentHours(
      { billableHours: 1100, otherCreditableHours: 50 },
      CY26,
    );
    expect(r.isEligible).toBe(false);
    expect(r.billableNeededForGate).toBe(100);
    expect(r.bonus).toBe(0);
  });
});

describe("Cálculo 4 — administrative hours", () => {
  it("cap apagado: contribución = total, sin desperdicio", () => {
    const r = adminHoursStatus({ adminToDate: 114.1 }, CY26);
    expect(r.creditableContribution).toBe(114.1);
    expect(r.wastedAboveCap).toBe(0);
    expect(r.capActive).toBe(false);
  });

  it("cap encendido: topa y calcula desperdicio", () => {
    const params = { ...CY26, applyAdminCap: true, adminCap: 100 };
    const r = adminHoursStatus({ adminToDate: 114.1 }, params);
    expect(r.creditableContribution).toBe(100);
    expect(round(r.wastedAboveCap, 1)).toBe(14.1);
    expect(r.capActive).toBe(true);
  });
});
