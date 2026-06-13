import { describe, expect, it } from "vitest";
import {
  businessDaysBetween,
  compYearBounds,
  inclusiveDays,
  utcDate,
} from "./dates";

describe("compYearBounds (1-may → 30-abr)", () => {
  it("una fecha en julio 2025 cae en CY que va may-2025 → abr-2026", () => {
    const { start, end } = compYearBounds(utcDate(2025, 6, 15)); // 15-jul-2025
    expect(start.toISOString().slice(0, 10)).toBe("2025-05-01");
    expect(end.toISOString().slice(0, 10)).toBe("2026-04-30");
  });

  it("una fecha en marzo 2026 pertenece al CY may-2025 → abr-2026", () => {
    const { start, end } = compYearBounds(utcDate(2026, 2, 10)); // 10-mar-2026
    expect(start.toISOString().slice(0, 10)).toBe("2025-05-01");
    expect(end.toISOString().slice(0, 10)).toBe("2026-04-30");
  });

  it("exactamente 1-may inicia un nuevo CY", () => {
    const { start } = compYearBounds(utcDate(2026, 4, 1)); // 1-may-2026
    expect(start.toISOString().slice(0, 10)).toBe("2026-05-01");
  });
});

describe("inclusiveDays", () => {
  it("mismo día = 1", () => {
    expect(inclusiveDays(utcDate(2026, 0, 1), utcDate(2026, 0, 1))).toBe(1);
  });
  it("rango de una semana = 7", () => {
    expect(inclusiveDays(utcDate(2026, 0, 1), utcDate(2026, 0, 7))).toBe(7);
  });
});

describe("businessDaysBetween", () => {
  it("una semana lun-dom = 5 días hábiles", () => {
    // 2026-01-05 es lunes.
    expect(businessDaysBetween(utcDate(2026, 0, 5), utcDate(2026, 0, 11))).toBe(
      5,
    );
  });
  it("solo fin de semana = 0", () => {
    // 2026-01-10 sáb, 2026-01-11 dom.
    expect(businessDaysBetween(utcDate(2026, 0, 10), utcDate(2026, 0, 11))).toBe(
      0,
    );
  });
});
