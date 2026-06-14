"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return user.id;
}

async function logAudit(
  userId: string,
  compYearId: string | null,
  entity: string,
  entityId: string | null,
  action: "insert" | "update" | "delete",
  detail: Record<string, unknown>,
) {
  const supabase = createClient();
  await supabase.from("audit_log").insert({
    user_id: userId,
    comp_year_id: compYearId,
    entity,
    entity_id: entityId,
    action,
    detail,
  });
}

// ---------------------------------------------------------------------------
// Compensation years
// ---------------------------------------------------------------------------

export type CompYearInput = {
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
  isr_effective_rate_pct: number;
  base_salary: number | null;
  salary_paid_to_date: number;
};

export async function createCompYear(input: CompYearInput) {
  const userId = await requireUserId();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("compensation_years")
    .insert({ ...input, user_id: userId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  await logAudit(userId, data.id, "compensation_year", data.id, "insert", {
    label: input.label,
  });
  revalidatePath("/", "layout");
  return data.id as string;
}

export async function updateCompYear(id: string, input: Partial<CompYearInput>) {
  const userId = await requireUserId();
  const supabase = createClient();
  const { error } = await supabase
    .from("compensation_years")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await logAudit(userId, id, "compensation_year", id, "update", { ...input });
  revalidatePath("/", "layout");
}

export async function deleteCompYear(id: string) {
  const userId = await requireUserId();
  const supabase = createClient();
  // Auditar antes de borrar: el FK de audit_log es "set null", no cascada.
  await logAudit(userId, id, "compensation_year", id, "delete", {});
  // Los hijos (hour_entries, salary_components, goals, planned_absences)
  // tienen "on delete cascade", así que se eliminan automáticamente.
  const { error } = await supabase
    .from("compensation_years")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Hour entries
// ---------------------------------------------------------------------------

export type HourEntryInput = {
  comp_year_id: string;
  entry_date: string;
  billable_hours: number;
  admin_hours: number;
  other_creditable_hours: number;
  note: string | null;
};

export async function upsertHourEntry(input: HourEntryInput, id?: string) {
  const userId = await requireUserId();
  const supabase = createClient();
  if (id) {
    const { error } = await supabase
      .from("hour_entries")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await logAudit(userId, input.comp_year_id, "hour_entry", id, "update", {
      ...input,
    });
  } else {
    const { data, error } = await supabase
      .from("hour_entries")
      .insert({ ...input, user_id: userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logAudit(
      userId,
      input.comp_year_id,
      "hour_entry",
      data.id,
      "insert",
      { ...input },
    );
  }
  revalidatePath("/", "layout");
}

export async function deleteHourEntry(id: string, compYearId: string) {
  const userId = await requireUserId();
  const supabase = createClient();
  const { error } = await supabase.from("hour_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logAudit(userId, compYearId, "hour_entry", id, "delete", {});
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Salary components
// ---------------------------------------------------------------------------

export type SalaryComponentInput = {
  comp_year_id: string;
  name: string;
  category: string;
  amount: number;
  frequency: string;
  is_taxable: boolean;
  notes: string | null;
};

export async function createSalaryComponent(input: SalaryComponentInput) {
  const userId = await requireUserId();
  const supabase = createClient();
  const { error } = await supabase
    .from("salary_components")
    .insert({ ...input, user_id: userId });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteSalaryComponent(id: string) {
  await requireUserId();
  const supabase = createClient();
  const { error } = await supabase
    .from("salary_components")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export type GoalInput = {
  comp_year_id: string;
  type: string;
  target_value: number;
  label: string | null;
  reward_note: string | null;
};

export async function createGoal(input: GoalInput) {
  const userId = await requireUserId();
  const supabase = createClient();
  const { error } = await supabase
    .from("goals")
    .insert({ ...input, user_id: userId });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteGoal(id: string) {
  await requireUserId();
  const supabase = createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Planned absences
// ---------------------------------------------------------------------------

export type AbsenceInput = {
  comp_year_id: string;
  start_date: string;
  end_date: string;
  type: string;
  working_days: number;
  note: string | null;
};

export async function createAbsence(input: AbsenceInput) {
  const userId = await requireUserId();
  const supabase = createClient();
  const { error } = await supabase
    .from("planned_absences")
    .insert({ ...input, user_id: userId });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteAbsence(id: string) {
  await requireUserId();
  const supabase = createClient();
  const { error } = await supabase
    .from("planned_absences")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Profile (moneda / tipo de cambio)
// ---------------------------------------------------------------------------

export async function updateProfile(input: {
  display_name?: string | null;
  currency_default?: "USD" | "MXN";
  usd_mxn_rate?: number;
}) {
  const userId = await requireUserId();
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
