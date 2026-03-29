'use client';

import type { FormEvent } from "react";

import type { PlanSearchFormValues } from "@/types/plans";

type PlanSearchFormProps = {
  values: PlanSearchFormValues;
  onChange: (field: keyof PlanSearchFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
};

export function PlanSearchForm({
  values,
  onChange,
  onSubmit,
  isLoading,
}: PlanSearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div>
        <label
          htmlFor="zipCode"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Zip Code
        </label>
        <input
          id="zipCode"
          type="text"
          value={values.zipCode}
          onChange={(event) => onChange("zipCode", event.target.value)}
          autoComplete="postal-code"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div>
        <label
          htmlFor="effectiveDate"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Fecha efectiva
        </label>
        <input
          id="effectiveDate"
          type="date"
          value={values.effectiveDate}
          onChange={(event) => onChange("effectiveDate", event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div>
        <label
          htmlFor="paymentFrequency"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Frecuencia de pago
        </label>
        <select
          id="paymentFrequency"
          value={values.paymentFrequency}
          onChange={(event) => onChange("paymentFrequency", event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Semi-Annual">Semi-Annual</option>
          <option value="Annual">Annual</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="birthDate"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Fecha de nacimiento
        </label>
        <input
          id="birthDate"
          type="date"
          value={values.birthDate}
          onChange={(event) => onChange("birthDate", event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div>
        <label
          htmlFor="gender"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Género
        </label>
        <select
          id="gender"
          value={values.gender}
          onChange={(event) => onChange("gender", event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Buscando planes..." : "Buscar planes"}
        </button>
      </div>
    </form>
  );
}
