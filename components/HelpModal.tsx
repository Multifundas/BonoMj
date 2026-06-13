"use client";

import * as React from "react";
import { CircleHelp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export function HelpModal() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir manual de usuario"
        className="inline-flex size-8 items-center justify-center rounded-full border text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <CircleHelp className="size-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual de uso</DialogTitle>
            <DialogDescription>
              Cómo capturar horas y leer tu true-up, bono y compensación.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <Section title="¿Qué es esta plataforma?">
              Calcula tu <strong>salary true-up</strong> y{" "}
              <strong>production bonus</strong> ligados a las horas que
              registras. El año de compensación va del{" "}
              <strong>1 de mayo al 30 de abril</strong>.
            </Section>

            <Section title="Primer uso">
              <ol className="list-decimal space-y-1 pl-5">
                <li>
                  Ve a <strong>Ajustes</strong> y crea tu primer{" "}
                  <strong>año de compensación</strong> (par 1,200, true-up máx
                  500, ISR efectiva). Sin un año creado verás un estado vacío.
                </li>
                <li>
                  Captura horas en <strong>Horas</strong> (diario o semanal); el
                  dashboard y las calculadoras se actualizan solos.
                </li>
                <li>
                  Agrega tu salario y prestaciones en <strong>Salario</strong> y
                  tus ausencias en <strong>Proyección</strong>.
                </li>
              </ol>
            </Section>

            <Section title="Cada pantalla">
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Dashboard</strong>: KPIs, progreso del año, ritmo,
                  proyección y alertas.
                </li>
                <li>
                  <strong>Horas</strong>: cortes diario/semanal, acumulados,
                  historial y export CSV.
                </li>
                <li>
                  <strong>Cálculos</strong>: 4 calculadoras (horas→bono,
                  faltantes, true-up/bono hoy, horas admin).
                </li>
                <li>
                  <strong>Salario</strong>: compensación mensual real y
                  crecimiento año contra año.
                </li>
                <li>
                  <strong>Proyección</strong>: escenarios de fin de año y
                  planeador de ausencias.
                </li>
                <li>
                  <strong>Simulador</strong>: mueve sliders para ver el efecto en
                  vivo, incluido el cap admin.
                </li>
                <li>
                  <strong>Calendario</strong>: resumen mensual de horas y
                  ausencias.
                </li>
                <li>
                  <strong>Ajustes</strong>: crear años, perfil, moneda, tipo de
                  cambio e ISR.
                </li>
              </ul>
            </Section>

            <Section title="Conceptos clave">
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Par (1,200)</strong>: umbral base de horas.
                </li>
                <li>
                  <strong>Techo (1,700)</strong>: par + 500. Las horas entre
                  1,200 y 1,700 generan true-up; arriba de 1,700, bono.
                </li>
                <li>
                  <strong>Gate</strong>: el bono se activa con horas{" "}
                  <strong>billable</strong>, no con el total creditable.
                </li>
                <li>
                  <strong>Cap admin</strong>: si lo activas, las horas admin se
                  topan antes de acreditar.
                </li>
              </ul>
            </Section>

            <Section title="Bruto vs. Neto (ISR)">
              El <strong>neto</strong> usa la{" "}
              <strong>tasa de ISR efectiva</strong> que configuras por año en
              Ajustes (es una aproximación de tasa única, no la tabla progresiva
              ni el subsidio al empleo). El <strong>variable</strong> (true-up +
              bono) es 100% gravable; el <strong>fijo</strong> respeta los
              conceptos exentos (no gravables), que pasan íntegros al neto.
            </Section>

            <Section title="Moneda">
              Cambia entre <strong>USD</strong> y <strong>MXN</strong> y ajusta
              el tipo de cambio en Ajustes; todos los montos se convierten al
              vuelo.
            </Section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
