-- =============================================================================
-- 0003_views.sql — Vistas/queries derivadas por compensation year
-- =============================================================================
-- Replican las fórmulas de lib/compensation (fuente de verdad en TS) para
-- permitir consultas/acumulados directos en SQL. Reglas clave:
--   * gate de elegibilidad SOBRE BILLABLE (> par_hours)
--   * piso del bono = par_hours + true_up_max_hours (1700 por default), NO 1200
--   * admin cap configurable (apply_admin_cap)
-- Las vistas heredan RLS de las tablas base (security_invoker).
-- =============================================================================

-- Acumulados de horas por compensation year.
create or replace view public.comp_year_hour_totals
with (security_invoker = true) as
select
  cy.id                                                as comp_year_id,
  cy.user_id                                           as user_id,
  coalesce(sum(he.billable_hours), 0)                  as sum_billable,
  coalesce(sum(he.admin_hours), 0)                     as sum_admin,
  coalesce(sum(he.other_creditable_hours), 0)          as sum_other_creditable,
  -- "other" total acreditable = admin + other (antes del cap)
  coalesce(sum(he.admin_hours + he.other_creditable_hours), 0) as sum_other_total
from public.compensation_years cy
left join public.hour_entries he on he.comp_year_id = cy.id
group by cy.id, cy.user_id;

-- Resultados de compensación derivados por año (replica fórmulas TS).
create or replace view public.comp_year_results
with (security_invoker = true) as
with totals as (
  select * from public.comp_year_hour_totals
)
select
  cy.id                                   as comp_year_id,
  cy.user_id                              as user_id,
  cy.label                                as label,
  t.sum_billable                          as billable_hours,
  t.sum_other_total                       as other_creditable_hours,
  -- creditable_other tras aplicar cap configurable
  case when cy.apply_admin_cap
       then least(t.sum_other_total, cy.admin_cap)
       else t.sum_other_total end         as creditable_other,
  -- total creditable
  t.sum_billable + case when cy.apply_admin_cap
       then least(t.sum_other_total, cy.admin_cap)
       else t.sum_other_total end         as total_creditable,
  -- elegibilidad: gate SOBRE BILLABLE
  (t.sum_billable > cy.par_hours and cy.evaluation_satisfactory) as is_eligible,
  -- true-up qualifying: clamp(total_creditable - par, 0, max)
  greatest(
    least(
      (t.sum_billable + case when cy.apply_admin_cap
            then least(t.sum_other_total, cy.admin_cap)
            else t.sum_other_total end) - cy.par_hours,
      cy.true_up_max_hours),
    0)                                     as true_up_qualifying_hours,
  -- bonus qualifying: max(total_creditable - (par + max), 0)  -> 1700
  greatest(
    (t.sum_billable + case when cy.apply_admin_cap
          then least(t.sum_other_total, cy.admin_cap)
          else t.sum_other_total end)
      - (cy.par_hours + cy.true_up_max_hours),
    0)                                     as bonus_qualifying_hours,
  -- tarifa efectiva del bono
  coalesce(cy.bonus_rate_per_hour, cy.bonus_rate_pct * cy.blended_billing_rate)
                                           as effective_bonus_rate_per_hour,
  cy.true_up_rate_per_hour                 as true_up_rate_per_hour
from public.compensation_years cy
join totals t on t.comp_year_id = cy.id;

-- Vista final con montos calculados (true-up y bono en dinero).
create or replace view public.comp_year_amounts
with (security_invoker = true) as
select
  r.*,
  r.true_up_qualifying_hours * r.true_up_rate_per_hour        as salary_true_up,
  case when r.is_eligible
       then r.bonus_qualifying_hours * r.effective_bonus_rate_per_hour
       else 0 end                                             as production_bonus
from public.comp_year_results r;
