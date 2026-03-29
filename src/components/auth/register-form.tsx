'use client';

import Link from "next/link";
import { useActionState } from "react";

import { registerAction } from "@/app/actions/auth";
import { initialAuthActionState } from "@/types/auth";

import { SubmitButton } from "./submit-button";

export function RegisterForm() {
  const [state, formAction] = useActionState(
    registerAction,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="correo@ejemplo.com"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
        />
        {state.fieldErrors.email ? (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.email}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
        />
        {state.fieldErrors.password ? (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            state.success
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <SubmitButton label="Crear cuenta" pendingLabel="Creando cuenta..." />

      <p className="text-center text-sm text-slate-600">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium text-slate-900 underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
