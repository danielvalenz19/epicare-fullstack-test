'use server';

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/types/auth";

function validateCredentials(
  emailRaw: FormDataEntryValue | null,
  passwordRaw: FormDataEntryValue | null,
): AuthActionState | null {
  const email = String(emailRaw ?? "").trim().toLowerCase();
  const password = String(passwordRaw ?? "");

  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!email) {
    fieldErrors.email = "El correo es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Ingresá un correo válido.";
  }

  if (!password) {
    fieldErrors.password = "La contraseña es obligatoria.";
  } else if (password.length < 8) {
    fieldErrors.password = "La contraseña debe tener al menos 8 caracteres.";
  }

  if (fieldErrors.email || fieldErrors.password) {
    return {
      success: false,
      message: "Revisá los campos del formulario.",
      fieldErrors,
    };
  }

  return null;
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validationError = validateCredentials(
    formData.get("email"),
    formData.get("password"),
  );

  if (validationError) {
    return validationError;
  }

  const email = String(formData.get("email")).trim().toLowerCase();
  const password = String(formData.get("password"));

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      message: "Credenciales inválidas o usuario no registrado.",
      fieldErrors: {},
    };
  }

  redirect("/dashboard");
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validationError = validateCredentials(
    formData.get("email"),
    formData.get("password"),
  );

  if (validationError) {
    return validationError;
  }

  const email = String(formData.get("email")).trim().toLowerCase();
  const password = String(formData.get("password"));

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
      fieldErrors: {},
    };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    success: true,
    message: "Cuenta creada. Ahora iniciá sesión.",
    fieldErrors: {},
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
