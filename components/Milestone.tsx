import { PartyPopper, Sparkles, Trophy } from "lucide-react";

type Props = {
  /** Horas totales creditable a la fecha. */
  current: number;
  /** Umbral base (par, ej. 1,200). */
  par: number;
  /** Techo del true-up / piso del bono (ej. 1,700). */
  ceiling: number;
};

/**
 * Mensaje de felicitación cuando se cruzan metas clave (par y techo).
 * Solo renderiza cuando hay un logro que celebrar.
 */
export function Milestone({ current, par, ceiling }: Props) {
  if (current >= ceiling) {
    return (
      <Banner
        icon={<Trophy className="size-5" />}
        title="¡Llegaste al techo! 🎉"
        text={`Cruzaste las ${ceiling.toLocaleString("es-MX")} horas. Cada hora extra ya suma a tu production bonus. ¡Eres imparable! 🏆`}
      />
    );
  }
  if (current >= par) {
    return (
      <Banner
        icon={<PartyPopper className="size-5" />}
        title="¡Superaste el par! 🥳"
        text={`Pasaste las ${par.toLocaleString("es-MX")} horas y ya estás generando true-up. ¡Vas increíble, sigue así! 💖`}
      />
    );
  }
  return null;
}

function Banner({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/15 via-accent to-secondary px-5 py-4 shadow-sm">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
        {icon}
      </div>
      <div className="space-y-0.5">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {title}
          <Sparkles className="size-3.5 text-primary" />
        </p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
