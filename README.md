# Plataforma de Compensación — True-Up & Production Bonus

Plataforma para staff attorney: calcula **salary true-up** y **production bonus**
ligados a horas, captura horas diario/semanal, y proyecta la compensación.

Compensation year: **1 de mayo → 30 de abril**.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- Recharts (gráficas)
- Supabase (Postgres + RLS + Auth)
- Vitest (tests de la lógica pura)

## Estado actual (completo)

- ✅ Setup, estructura y esquema Supabase (tablas + RLS + vistas) en `supabase/migrations/`.
- ✅ Cliente Supabase (browser/server) y middleware de sesión.
- ✅ Lógica de compensación **pura y testeada** en `lib/compensation/`.
- ✅ **49 tests pasando** (incluye los casos de aceptación de la sección 10).
- ✅ Auth (login/signup) y rutas protegidas.
- ✅ Captura de horas (diario/semanal) + acumulados + dashboard.
- ✅ Las 4 calculadoras (sección 6).
- ✅ Salario, prestaciones y comparativo multi-anual.
- ✅ Proyección, ritmo y planeador de ausencias.
- ✅ Simulador what-if, alertas, export CSV, calendario, ajustes y moneda USD/MXN.
- ✅ Estimación **bruto/neto** con tasa de **ISR efectiva** por año (respeta exentos).
- ✅ **Manual de uso** en un modal global (botón "?" en el header).

## Rutas

| Ruta          | Qué hace                                                       |
| ------------- | ------------------------------------------------------------- |
| `/login`      | Inicio de sesión.                                             |
| `/signup`     | Registro (crea el profile vía trigger en Supabase).          |
| `/dashboard`  | KPIs, barra de zonas, ritmo, proyección y **alertas**.       |
| `/horas`      | Captura diaria/semanal, acumulados, historial y export CSV.  |
| `/calculos`   | Las 4 calculadoras (horas→bono, faltantes, true-up/bono, admin). |
| `/salario`    | Compensación mensual real + crecimiento año contra año.      |
| `/proyeccion` | Escenarios EOY (conservador/realista/optimista) + ausencias. |
| `/simulador`  | What-if con sliders y toggle del cap admin (efecto en vivo). |
| `/calendario` | Resumen mensual de horas y ausencias.                        |
| `/ajustes`    | Crear años de compensación; perfil, moneda, tipo de cambio e ISR. |

## Desarrollo local

```bash
npm install
npm test          # corre Vitest (lógica de compensación) — 49 tests
npm run typecheck # tsc --noEmit
npm run build     # build de producción
npm run dev       # http://localhost:3000
```

## Configurar Supabase (paso a paso)

1. **Crear proyecto**: entra a https://supabase.com → New project. Anota la
   contraseña de la base de datos y espera a que termine de aprovisionar.

2. **Ejecutar migraciones**: en el dashboard, ve a **SQL Editor → New query** y
   ejecuta **en orden** el contenido de cada archivo de `supabase/migrations/`:
   - `0001_init.sql` — tablas (profiles, compensation_years, hour_entries,
     salary_components, goals, planned_absences, audit_log).
   - `0002_rls.sql` — Row Level Security (cada usuario solo ve sus datos) y el
     trigger `handle_new_user` que crea el profile al registrarse.
   - `0003_views.sql` — vistas derivadas con las fórmulas (techo 1700, gate sobre
     billable, cap admin).
   - `0004_isr_rate.sql` — columna `isr_effective_rate_pct` en
     `compensation_years` (tasa de ISR efectiva por año para estimar el neto).

   > Alternativa con CLI: `supabase link --project-ref <ref>` y
   > `supabase db push`.

3. **Auth → email/password**: en **Authentication → Providers**, deja habilitado
   *Email*. Para desarrollo puedes desactivar *Confirm email* en
   **Authentication → Sign In / Providers → Email** para entrar sin confirmar.
   En producción déjalo activado y configura el SMTP/plantillas.

4. **URLs de redirección**: en **Authentication → URL Configuration**, agrega tu
   `Site URL` (ej. `http://localhost:3000` y luego tu dominio de Vercel) a
   *Redirect URLs*.

5. **Variables de entorno**: copia `.env.local.example` a `.env.local` y llena
   desde **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   **Nunca** pongas el `service_role` key en el cliente ni lo commitees.

## Primer uso

1. `npm run dev`, abre `/signup` y crea tu cuenta.
2. Ve a **Ajustes** y crea tu primer **año de compensación** (defaults May–Abr,
   par 1200, true-up máx 500). Sin un año creado, las pantallas muestran un
   estado vacío que te lleva a Ajustes.
3. Captura horas en **Horas**; el dashboard y las calculadoras se actualizan.
4. Agrega prestaciones en **Salario** y ausencias en **Proyección**.

## Deploy en Vercel

1. Sube el repo a GitHub.
2. En https://vercel.com → New Project → importa el repo (framework: Next.js,
   detección automática).
3. En **Settings → Environment Variables** agrega, para *Production* (y *Preview*):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Tras el primer deploy, copia el dominio (`https://...vercel.app`) y
   agrégalo a las *Redirect URLs* y *Site URL* de Supabase (paso 4 de arriba).
5. Build/start los maneja Vercel (`next build` / `next start`). No requiere
   configuración extra.

## Lógica de compensación (`lib/compensation/`)

Toda la lógica es **pura** (sin UI) y la UI debe consumirla, nunca duplicar fórmulas.

| Archivo           | Responsabilidad                                        |
| ----------------- | ------------------------------------------------------ |
| `types.ts`        | Tipos del dominio (`CompParams`, `Hours`, …).          |
| `constants.ts`    | Defaults del modelo unificado.                         |
| `core.ts`         | Fórmulas núcleo (true-up, bono, elegibilidad).         |
| `calculators.ts`  | Los 4 módulos de cálculo (sección 6).                  |
| `pacing.ts`       | Ritmo, proyección EOY, simulación de ausencias.        |
| `salary.ts`       | Prestaciones, compensación mensual, crecimiento anual. |
| `alerts.ts`       | Generación de alertas/avisos a partir del estado.      |
| `dates.ts`        | Helpers del compensation year (may–abr).               |
| `format.ts`       | Formato de moneda/horas/% y conversión USD/MXN.        |
| `tax.ts`          | ISR efectivo: bruto→neto (respeta exentos `is_taxable`).|
| `RULES_NOTES.md`  | Inconsistencias documentadas (sección 3).              |

> **Reglas debatibles = parámetros configurables.** Ver `RULES_NOTES.md`. La
> regla clave: el piso del production bonus es **1,700** (par + 500), no 1,200;
> el gate de elegibilidad es **sobre billable**.
