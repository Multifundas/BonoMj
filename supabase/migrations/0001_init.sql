-- =============================================================================
-- 0001_init.sql — Esquema inicial de la plataforma de compensación
-- =============================================================================
-- Modelo: sección 4 del prompt. Todas las tablas con RLS (user_id = auth.uid()).
-- Cálculos NO viven en la BD como verdad: la fuente de verdad es lib/compensation.
-- Las vistas derivadas solo agregan horas y replican las fórmulas para queries.
-- =============================================================================

-- Extensiones
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  display_name     text,
  currency_default text not null default 'USD' check (currency_default in ('USD','MXN')),
  usd_mxn_rate     numeric(12,4) not null default 17.0000,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- compensation_years
-- -----------------------------------------------------------------------------
create table if not exists public.compensation_years (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users (id) on delete cascade,
  label                   text not null,                 -- ej. "CY26"
  start_date              date not null,                 -- 1-may
  end_date                date not null,                 -- 30-abr
  par_hours               numeric(10,2) not null default 1200,
  true_up_max_hours       numeric(10,2) not null default 500,
  bonus_rate_pct          numeric(6,4)  not null default 0.3750,
  blended_billing_rate    numeric(12,4),
  bonus_rate_per_hour     numeric(12,4),                 -- opcional; si null se deriva
  true_up_rate_per_hour   numeric(12,5) not null,        -- input requerido
  apply_admin_cap         boolean not null default false,
  admin_cap               numeric(10,2) not null default 100,
  evaluation_satisfactory boolean not null default true,
  base_salary             numeric(14,2),
  salary_paid_to_date     numeric(14,2) not null default 0,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint comp_years_dates_ck check (end_date > start_date),
  unique (user_id, label)
);
create index if not exists comp_years_user_idx on public.compensation_years (user_id);

-- -----------------------------------------------------------------------------
-- hour_entries  (captura diaria o semanal)
-- -----------------------------------------------------------------------------
create table if not exists public.hour_entries (
  id                     uuid primary key default gen_random_uuid(),
  comp_year_id           uuid not null references public.compensation_years (id) on delete cascade,
  user_id                uuid not null references auth.users (id) on delete cascade,
  entry_date             date not null,
  billable_hours         numeric(10,2) not null default 0 check (billable_hours >= 0),
  admin_hours            numeric(10,2) not null default 0 check (admin_hours >= 0),
  other_creditable_hours numeric(10,2) not null default 0 check (other_creditable_hours >= 0),
  note                   text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists hour_entries_year_idx on public.hour_entries (comp_year_id);
create index if not exists hour_entries_user_idx on public.hour_entries (user_id);
create index if not exists hour_entries_date_idx on public.hour_entries (comp_year_id, entry_date);

-- -----------------------------------------------------------------------------
-- salary_components
-- -----------------------------------------------------------------------------
create table if not exists public.salary_components (
  id           uuid primary key default gen_random_uuid(),
  comp_year_id uuid not null references public.compensation_years (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  name         text not null,
  category     text not null check (category in (
                 'base','aguinaldo','prima_vacacional','vales',
                 'seguro_gastos_medicos','401k','ptos','bono_otro')),
  amount       numeric(14,2) not null default 0,
  frequency    text not null check (frequency in ('mensual','anual','unica')),
  is_taxable   boolean not null default true,
  notes        text,
  created_at   timestamptz not null default now()
);
create index if not exists salary_components_year_idx on public.salary_components (comp_year_id);

-- -----------------------------------------------------------------------------
-- goals
-- -----------------------------------------------------------------------------
create table if not exists public.goals (
  id           uuid primary key default gen_random_uuid(),
  comp_year_id uuid not null references public.compensation_years (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  type         text not null check (type in ('bonus_amount','total_creditable_hours','billable_hours')),
  target_value numeric(14,2) not null,
  label        text,
  reward_note  text,                                -- motivación (ej. "viaje")
  created_at   timestamptz not null default now()
);
create index if not exists goals_year_idx on public.goals (comp_year_id);

-- -----------------------------------------------------------------------------
-- planned_absences
-- -----------------------------------------------------------------------------
create table if not exists public.planned_absences (
  id           uuid primary key default gen_random_uuid(),
  comp_year_id uuid not null references public.compensation_years (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  start_date   date not null,
  end_date     date not null,
  type         text not null check (type in ('vacaciones','feriado','personal')),
  working_days numeric(6,2) not null default 0,    -- días hábiles cubiertos
  note         text,
  created_at   timestamptz not null default now(),
  constraint absences_dates_ck check (end_date >= start_date)
);
create index if not exists absences_year_idx on public.planned_absences (comp_year_id);

-- -----------------------------------------------------------------------------
-- audit_log  (bitácora de cortes — sección 12.9)
-- -----------------------------------------------------------------------------
create table if not exists public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  comp_year_id uuid references public.compensation_years (id) on delete set null,
  entity       text not null,        -- 'hour_entry', 'goal', etc.
  entity_id    uuid,
  action       text not null check (action in ('insert','update','delete')),
  detail       jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists audit_log_user_idx on public.audit_log (user_id, created_at desc);
