/**
 * Adaptadores entre las filas de Supabase y los tipos de la lógica pura.
 * Mantiene la UI/DB desacoplada de las fórmulas.
 */

import type { CompensationYear } from "@/lib/supabase/database.types";
import type { CompParams } from "./types";

/** Convierte una fila compensation_years a CompParams. */
export function toCompParams(cy: CompensationYear): CompParams {
  return {
    parHours: Number(cy.par_hours),
    trueUpMaxHours: Number(cy.true_up_max_hours),
    bonusRatePct: Number(cy.bonus_rate_pct),
    blendedBillingRate:
      cy.blended_billing_rate != null
        ? Number(cy.blended_billing_rate)
        : undefined,
    bonusRatePerHour:
      cy.bonus_rate_per_hour != null
        ? Number(cy.bonus_rate_per_hour)
        : undefined,
    trueUpRatePerHour: Number(cy.true_up_rate_per_hour),
    applyAdminCap: cy.apply_admin_cap,
    adminCap: Number(cy.admin_cap),
    evaluationSatisfactory: cy.evaluation_satisfactory,
  };
}
