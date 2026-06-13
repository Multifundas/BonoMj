import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  CompensationYear,
  CompYearAmounts,
  Goal,
  HourEntry,
  PlannedAbsence,
  Profile,
  SalaryComponentRow,
} from "@/lib/supabase/database.types";

/** Usuario autenticado o null. */
export async function getUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Profile del usuario actual. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").maybeSingle();
  return data as Profile | null;
}

/** Todos los compensation years del usuario, más reciente primero. */
export async function listCompYears(): Promise<CompensationYear[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("compensation_years")
    .select("*")
    .order("start_date", { ascending: false });
  return (data ?? []) as CompensationYear[];
}

/** Un compensation year por id. */
export async function getCompYear(
  id: string,
): Promise<CompensationYear | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("compensation_years")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data as CompensationYear | null;
}

/** El compensation year activo (el que contiene hoy), o el más reciente. */
export async function getActiveCompYear(): Promise<CompensationYear | null> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("compensation_years")
    .select("*")
    .lte("start_date", today)
    .gte("end_date", today)
    .maybeSingle();
  if (data) return data as CompensationYear;
  const years = await listCompYears();
  return years[0] ?? null;
}

/** Entradas de horas de un comp year, por fecha ascendente. */
export async function listHourEntries(
  compYearId: string,
): Promise<HourEntry[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("hour_entries")
    .select("*")
    .eq("comp_year_id", compYearId)
    .order("entry_date", { ascending: true });
  return (data ?? []) as HourEntry[];
}

/** Resultados derivados (montos) de un comp year desde la vista. */
export async function getCompYearAmounts(
  compYearId: string,
): Promise<CompYearAmounts | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("comp_year_amounts")
    .select("*")
    .eq("comp_year_id", compYearId)
    .maybeSingle();
  return data as CompYearAmounts | null;
}

/** Resultados derivados de TODOS los comp years (para histórico multi-año). */
export async function listCompYearAmounts(): Promise<CompYearAmounts[]> {
  const supabase = createClient();
  const { data } = await supabase.from("comp_year_amounts").select("*");
  return (data ?? []) as CompYearAmounts[];
}

/** Componentes de salario de un comp year. */
export async function listSalaryComponents(
  compYearId: string,
): Promise<SalaryComponentRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("salary_components")
    .select("*")
    .eq("comp_year_id", compYearId)
    .order("created_at", { ascending: true });
  return (data ?? []) as SalaryComponentRow[];
}

/** Metas de un comp year. */
export async function listGoals(compYearId: string): Promise<Goal[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("comp_year_id", compYearId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Goal[];
}

/** Ausencias planeadas de un comp year. */
export async function listAbsences(
  compYearId: string,
): Promise<PlannedAbsence[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("planned_absences")
    .select("*")
    .eq("comp_year_id", compYearId)
    .order("start_date", { ascending: true });
  return (data ?? []) as PlannedAbsence[];
}
