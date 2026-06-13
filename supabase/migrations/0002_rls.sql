-- =============================================================================
-- 0002_rls.sql — Row Level Security
-- =============================================================================
-- Cada usuario solo ve/edita sus datos: user_id = auth.uid().
-- profiles usa la PK (id) que ES el auth.uid().
-- =============================================================================

alter table public.profiles            enable row level security;
alter table public.compensation_years  enable row level security;
alter table public.hour_entries        enable row level security;
alter table public.salary_components   enable row level security;
alter table public.goals               enable row level security;
alter table public.planned_absences    enable row level security;
alter table public.audit_log           enable row level security;

-- ---- profiles ----
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---- helper macro: tablas con columna user_id ----
-- compensation_years
create policy "comp_years_all_own" on public.compensation_years
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- hour_entries
create policy "hour_entries_all_own" on public.hour_entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- salary_components
create policy "salary_components_all_own" on public.salary_components
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- goals
create policy "goals_all_own" on public.goals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- planned_absences
create policy "planned_absences_all_own" on public.planned_absences
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- audit_log: lectura propia + insert propio (no update/delete desde el cliente)
create policy "audit_log_select_own" on public.audit_log
  for select using (user_id = auth.uid());
create policy "audit_log_insert_own" on public.audit_log
  for insert with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Trigger: crear profile automáticamente al registrarse un usuario
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
