/**
 * Tipos de la base de datos (mapeo manual del esquema en supabase/migrations).
 *
 * Cuando tengas el proyecto Supabase y el CLI, puedes regenerar con:
 *   supabase gen types typescript --project-id <ref> > lib/supabase/database.types.ts
 * Mientras tanto, este mapeo manual mantiene el tipado end-to-end.
 */

export type Currency = "USD" | "MXN";

export type ComponentCategory =
  | "base"
  | "aguinaldo"
  | "prima_vacacional"
  | "vales"
  | "seguro_gastos_medicos"
  | "401k"
  | "ptos"
  | "bono_otro";

export type ComponentFrequency = "mensual" | "anual" | "unica";
export type GoalType =
  | "bonus_amount"
  | "total_creditable_hours"
  | "billable_hours";
export type AbsenceType = "vacaciones" | "feriado" | "personal";

export type Profile = {
  id: string;
  display_name: string | null;
  currency_default: Currency;
  usd_mxn_rate: number;
  created_at: string;
  updated_at: string;
};

export type CompensationYear = {
  id: string;
  user_id: string;
  label: string;
  start_date: string;
  end_date: string;
  par_hours: number;
  true_up_max_hours: number;
  bonus_rate_pct: number;
  blended_billing_rate: number | null;
  bonus_rate_per_hour: number | null;
  true_up_rate_per_hour: number;
  apply_admin_cap: boolean;
  admin_cap: number;
  evaluation_satisfactory: boolean;
  base_salary: number | null;
  salary_paid_to_date: number;
  created_at: string;
  updated_at: string;
};

export type HourEntry = {
  id: string;
  comp_year_id: string;
  user_id: string;
  entry_date: string;
  billable_hours: number;
  admin_hours: number;
  other_creditable_hours: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type SalaryComponentRow = {
  id: string;
  comp_year_id: string;
  user_id: string;
  name: string;
  category: ComponentCategory;
  amount: number;
  frequency: ComponentFrequency;
  is_taxable: boolean;
  notes: string | null;
  created_at: string;
};

export type Goal = {
  id: string;
  comp_year_id: string;
  user_id: string;
  type: GoalType;
  target_value: number;
  label: string | null;
  reward_note: string | null;
  created_at: string;
};

export type PlannedAbsence = {
  id: string;
  comp_year_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  type: AbsenceType;
  working_days: number;
  note: string | null;
  created_at: string;
};

/** Vista derivada con montos (comp_year_amounts). */
export type CompYearAmounts = {
  comp_year_id: string;
  user_id: string;
  label: string;
  billable_hours: number;
  other_creditable_hours: number;
  creditable_other: number;
  total_creditable: number;
  is_eligible: boolean;
  true_up_qualifying_hours: number;
  bonus_qualifying_hours: number;
  effective_bonus_rate_per_hour: number;
  true_up_rate_per_hour: number;
  salary_true_up: number;
  production_bonus: number;
};
