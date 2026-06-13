/**
 * Generación de alertas/avisos a partir del estado de compensación (pura).
 * No conoce de UI: devuelve estructuras describiendo cada alerta.
 */

import type { CompParams, CompResult } from "./types";
import { trueUpCeiling } from "./types";
import type { PaceStatus } from "./pacing";

export type AlertSeverity = "info" | "warning" | "success";

export type Alert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
};

export type AlertInput = {
  result: CompResult;
  params: CompParams;
  paceStatus: PaceStatus;
  additionalCreditableNeeded: number;
  weeksRemaining: number;
  /** Horas admin acumuladas (para detectar desperdicio sobre el cap). */
  adminToDate: number;
};

/**
 * Construye la lista de alertas relevantes. Orden: más urgentes primero.
 */
export function buildAlerts(input: AlertInput): Alert[] {
  const { result, params, paceStatus, weeksRemaining } = input;
  const alerts: Alert[] = [];
  const ceiling = trueUpCeiling(params);

  // 1. Gate no cumplido.
  if (!result.isEligible) {
    const need = Math.max(params.parHours - result.billableHours, 0);
    alerts.push({
      id: "gate",
      severity: "warning",
      title: "Gate del bono no activado",
      detail: `Faltan ${round(need)} horas billable para cruzar el umbral de ${params.parHours}.`,
    });
  }

  // 2. A punto de entrar a la zona del bono (1700).
  if (
    result.isEligible &&
    result.totalCreditableHours < ceiling &&
    ceiling - result.totalCreditableHours <= 50
  ) {
    alerts.push({
      id: "near-bonus",
      severity: "info",
      title: "Cerca de la zona de bono",
      detail: `Faltan ${round(ceiling - result.totalCreditableHours)} horas para empezar a generar production bonus.`,
    });
  }

  // 3. Atrasada en el ritmo.
  if (paceStatus === "atrasada" && weeksRemaining > 0) {
    alerts.push({
      id: "behind-pace",
      severity: "warning",
      title: "Vas atrasada respecto al ritmo requerido",
      detail: "Necesitas subir tu ritmo semanal para alcanzar la meta.",
    });
  }

  // 4. Desperdicio por cap admin.
  if (params.applyAdminCap && input.adminToDate > params.adminCap) {
    alerts.push({
      id: "admin-cap",
      severity: "warning",
      title: "Horas admin sobre el cap",
      detail: `${round(input.adminToDate - params.adminCap)} horas admin no cuentan por el cap de ${params.adminCap}.`,
    });
  }

  // 5. Cap a punto de toparse en true-up (500 horas).
  if (
    result.trueUpQualifyingHours >= params.trueUpMaxHours &&
    params.trueUpMaxHours > 0
  ) {
    alerts.push({
      id: "trueup-cap",
      severity: "success",
      title: "True-up al máximo",
      detail: `Llegaste al tope de ${params.trueUpMaxHours} horas de true-up; las horas extra ya generan bono.`,
    });
  }

  return alerts;
}

function round(x: number): number {
  return Math.round(x * 10) / 10;
}
