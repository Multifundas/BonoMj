"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, type AuthState } from "./actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Procesando…" : label}
    </Button>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction] = useFormState<AuthState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="display_name">Nombre</Label>
          <Input id="display_name" name="display_name" placeholder="Tu nombre" />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state.message && (
        <p className="text-sm text-emerald-600">{state.message}</p>
      )}

      <SubmitButton label={mode === "login" ? "Entrar" : "Crear cuenta"} />

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            ¿No tienes cuenta?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Regístrate
            </Link>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
