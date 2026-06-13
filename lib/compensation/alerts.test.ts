import { describe, it, expect } from "vitest";
import { buildAlerts } from "./alerts";
import { computeCompensation } from "./core";
import { DEFAULT_COMP_PARAMS } from "./constants";
import type { CompParams } from "./types";

const P: CompParams = { ...DEFAULT_COMP_PARAMS, applyAdminCap: false };

function base() {
  return {
    params: P,
    paceStatus: "en_ritmo" as const,
    additionalCreditableNeeded: 0,
    weeksRemaining: 10,
    adminToDate: 0,
  };
}

describe("buildAlerts", () => {
  it("emite alerta de gate cuando no es elegible", () => {
    const result = computeCompensation(
      { billableHours: 1000, otherCreditableHours: 0 },
      P,
    );
    const alerts = buildAlerts({ ...base(), result });
    expect(alerts.some((a) => a.id === "gate")).toBe(true);
    expect(alerts.find((a) => a.id === "gate")?.severity).toBe("warning");
  });

  it("no emite gate cuando es elegible", () => {
    const result = computeCompensation(
      { billableHours: 1300, otherCreditableHours: 0 },
      P,
    );
    const alerts = buildAlerts({ ...base(), result });
    expect(alerts.some((a) => a.id === "gate")).toBe(false);
  });

  it("avisa cuando está cerca del piso del bono (1700)", () => {
    const result = computeCompensation(
      { billableHours: 1680, otherCreditableHours: 0 },
      P,
    );
    const alerts = buildAlerts({ ...base(), result });
    expect(alerts.some((a) => a.id === "near-bonus")).toBe(true);
  });

  it("avisa cuando va atrasada y quedan semanas", () => {
    const result = computeCompensation(
      { billableHours: 1300, otherCreditableHours: 0 },
      P,
    );
    const alerts = buildAlerts({
      ...base(),
      result,
      paceStatus: "atrasada",
    });
    expect(alerts.some((a) => a.id === "behind-pace")).toBe(true);
  });

  it("avisa desperdicio de admin sobre el cap", () => {
    const capped: CompParams = { ...P, applyAdminCap: true, adminCap: 100 };
    const result = computeCompensation(
      { billableHours: 1300, otherCreditableHours: 150 },
      capped,
    );
    const alerts = buildAlerts({
      ...base(),
      params: capped,
      result,
      adminToDate: 150,
    });
    expect(alerts.some((a) => a.id === "admin-cap")).toBe(true);
  });

  it("marca true-up al máximo (>=500 horas calificadas)", () => {
    const result = computeCompensation(
      { billableHours: 1800, otherCreditableHours: 0 },
      P,
    );
    const alerts = buildAlerts({ ...base(), result });
    expect(alerts.some((a) => a.id === "trueup-cap")).toBe(true);
  });
});
