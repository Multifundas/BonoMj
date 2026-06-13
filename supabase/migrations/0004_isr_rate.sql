-- 0004_isr_rate.sql
-- Tasa de ISR efectiva por año de compensación (fracción: 0.2000 = 20%).
-- Se usa para estimar el neto junto al bruto en la UI. El cálculo del neto
-- se hace en TypeScript, por lo que las vistas (0003) no requieren cambios.

alter table public.compensation_years
  add column if not exists isr_effective_rate_pct numeric(6,4) not null default 0.0000;
