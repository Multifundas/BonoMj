"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: traducirError(error.message) };
  redirect("/dashboard");
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "");
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) return { error: traducirError(error.message) };
  // Si el proyecto NO requiere confirmación por correo, ya hay sesión.
  if (data.session) redirect("/dashboard");
  return {
    message:
      "Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.",
  };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function traducirError(msg: string): string {
  if (/invalid login credentials/i.test(msg))
    return "Correo o contraseña incorrectos.";
  if (/already registered/i.test(msg)) return "Ese correo ya está registrado.";
  if (/password should be at least/i.test(msg))
    return "La contraseña debe tener al menos 6 caracteres.";
  return msg;
}
