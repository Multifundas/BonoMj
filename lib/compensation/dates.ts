/**
 * Helpers de fechas para el compensation year (1-may → 30-abr).
 * Todas las fechas se manejan como UTC para evitar drift por zona horaria.
 */

import {
  COMP_YEAR_END_DAY,
  COMP_YEAR_END_MONTH,
  COMP_YEAR_START_DAY,
  COMP_YEAR_START_MONTH,
} from "./constants";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Crea una fecha UTC a medianoche. */
export function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

/** Normaliza a medianoche UTC. */
export function toUtcMidnight(d: Date): Date {
  return utcDate(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Dado un día cualquiera, devuelve el inicio y fin del compensation year
 * que lo contiene (1-may del año correspondiente → 30-abr del siguiente).
 */
export function compYearBounds(onDate: Date): { start: Date; end: Date } {
  const y = onDate.getUTCFullYear();
  const startThisYear = utcDate(
    y,
    COMP_YEAR_START_MONTH,
    COMP_YEAR_START_DAY,
  );
  // Si la fecha es antes del 1-may, el año fiscal empezó el año anterior.
  const startYear = onDate >= startThisYear ? y : y - 1;
  const start = utcDate(startYear, COMP_YEAR_START_MONTH, COMP_YEAR_START_DAY);
  const end = utcDate(startYear + 1, COMP_YEAR_END_MONTH, COMP_YEAR_END_DAY);
  return { start, end };
}

/** Diferencia inclusiva en días entre dos fechas (a y b incluidos). */
export function inclusiveDays(a: Date, b: Date): number {
  const da = toUtcMidnight(a).getTime();
  const db = toUtcMidnight(b).getTime();
  if (db < da) return 0;
  return Math.round((db - da) / MS_PER_DAY) + 1;
}

/** ¿Es día hábil (lun–vie)? getUTCDay: 0=dom, 6=sáb. */
export function isWeekday(d: Date): boolean {
  const day = d.getUTCDay();
  return day >= 1 && day <= 5;
}

/**
 * Cuenta días hábiles (lun–vie) entre `from` y `to`, inclusive.
 * No considera feriados (eso lo maneja el planeador de ausencias).
 */
export function businessDaysBetween(from: Date, to: Date): number {
  const start = toUtcMidnight(from);
  const end = toUtcMidnight(to);
  if (end < start) return 0;
  let count = 0;
  for (
    let t = start.getTime();
    t <= end.getTime();
    t += MS_PER_DAY
  ) {
    if (isWeekday(new Date(t))) count++;
  }
  return count;
}

/** Semanas (decimales) entre dos fechas, basado en días calendario. */
export function weeksBetween(from: Date, to: Date): number {
  const days = inclusiveDays(from, to);
  return days / 7;
}

/** Meses (decimales aprox) entre dos fechas, basado en días / 30.4375. */
export function monthsBetween(from: Date, to: Date): number {
  const days = inclusiveDays(from, to);
  return days / 30.4375;
}
