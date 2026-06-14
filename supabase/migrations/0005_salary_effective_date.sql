-- 0005_salary_effective_date.sql
-- Fecha efectiva por movimiento de salario/prestación. Cada fila de
-- salary_components representa un movimiento; agrupando por (category, name)
-- y ordenando por effective_date se reconstruye el historial de ajustes.
-- Las filas existentes toman la fecha de hoy como su efectividad inicial.

alter table public.salary_components
  add column if not exists effective_date date not null default current_date;

create index if not exists salary_components_effective_idx
  on public.salary_components (comp_year_id, category, name, effective_date);
