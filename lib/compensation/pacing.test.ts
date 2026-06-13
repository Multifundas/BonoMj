import { describe, expect, it } from "vitest";
import { computePace, paceStatus, projectScenario } from "./pacing";
import { utcDate } from "./dates";
import { round } from "./format";

describe("paceStatus", () => {
  it("adelantada si supera el requerido en >2%", () => {
    expect(paceStatus(30, 25)).toBe("adelantada");
  });
  it("en ritmo dentro de ±2%", () => {
    expect(paceStatus(25, 25)).toBe("en_ritmo");
  });
  it("atrasada si va por debajo del 98%", () => {
    expect(paceStatus(20, 25)).toBe("atrasada");
  });
  it("sin requerido (meta cumplida) → adelantada", () => {
    expect(paceStatus(0, 0)).toBe("adelantada");
  });
});

describe("computePace", () => {
  it("calcula horas adicionales, ritmo requerido y descuenta ausencias", () => {
    const r = computePace({
      cutoffDate: utcDate(2026, 2, 1), // 1-mar-2026
      compYearEnd: utcDate(2026, 3, 30), // 30-abr-2026
      currentTotalCreditable: 1500,
      goalTotalCreditable: 1700,
      actualWeeklyPace: 20,
      absences: { plannedAbsenceWorkingDays: 5 },
    });
    expect(r.additionalCreditableNeeded).toBe(200);
    expect(r.workingDaysRemaining).toBeGreaterThan(0);
    // requiredHoursPerWorkingDay = 200 / workingDaysRemaining
    expect(round(r.requiredHoursPerWorkingDay, 4)).toBe(
      round(200 / r.workingDaysRemaining, 4),
    );
  });

  it("meta ya cumplida → 0 adicionales y estado adelantada", () => {
    const r = computePace({
      cutoffDate: utcDate(2026, 2, 1),
      compYearEnd: utcDate(2026, 3, 30),
      currentTotalCreditable: 1800,
      goalTotalCreditable: 1700,
      actualWeeklyPace: 10,
    });
    expect(r.additionalCreditableNeeded).toBe(0);
    expect(r.status).toBe("adelantada");
  });
});

describe("projectScenario", () => {
  it("optimista > realista > conservador", () => {
    const opt = projectScenario(1000, 20, 10, "optimista");
    const real = projectScenario(1000, 20, 10, "realista");
    const cons = projectScenario(1000, 20, 10, "conservador");
    expect(opt).toBeGreaterThan(real);
    expect(real).toBeGreaterThan(cons);
    expect(real).toBe(1000 + 20 * 10);
  });
});
