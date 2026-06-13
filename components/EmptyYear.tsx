import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyYear() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-lg font-semibold">Aún no tienes un compensation year</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Crea tu primer año (ej. &quot;CY26&quot;, del 1 de mayo al 30 de abril)
          para empezar a capturar horas y ver tu true-up y bono proyectados.
        </p>
        <Link href="/ajustes" className={buttonVariants()}>
          Crear compensation year
        </Link>
      </CardContent>
    </Card>
  );
}
