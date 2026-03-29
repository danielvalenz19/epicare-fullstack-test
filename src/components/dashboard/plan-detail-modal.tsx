'use client';

import type { JsonObject, JsonValue, NormalizedPlan } from "@/types/plans";

type PlanDetailModalProps = {
  plan: NormalizedPlan | null;
  onClose: () => void;
};

function isJsonRecord(value: JsonValue | null | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNestedRaw(planRaw: JsonValue): JsonObject | null {
  if (!isJsonRecord(planRaw)) {
    return null;
  }

  const nested = planRaw.raw;
  return isJsonRecord(nested) ? nested : null;
}

function getBenefits(planRaw: JsonValue): JsonObject[] {
  const nestedRaw = getNestedRaw(planRaw);
  const sources = [nestedRaw, isJsonRecord(planRaw) ? planRaw : null];

  for (const source of sources) {
    if (!source) {
      continue;
    }

    const benefits = source.benefits;
    if (Array.isArray(benefits)) {
      return benefits.filter(isJsonRecord);
    }
  }

  return [];
}

function getRawField(planRaw: JsonValue, key: string): string {
  const nestedRaw = getNestedRaw(planRaw);
  const sources = [nestedRaw, isJsonRecord(planRaw) ? planRaw : null];

  for (const source of sources) {
    if (!source) {
      continue;
    }

    const value = source[key];
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !Array.isArray(value) &&
      typeof value !== "object"
    ) {
      return String(value);
    }
  }

  return "N/A";
}

export function PlanDetailModal({
  plan,
  onClose,
}: PlanDetailModalProps) {
  if (!plan) {
    return null;
  }

  const benefits = getBenefits(plan.raw);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-slate-900">{plan.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{plan.provider}</p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="rounded-2xl bg-slate-900 px-4 py-2 text-right text-white">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Precio
              </p>
              <p className="text-lg font-semibold">{plan.price}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            >
              Cerrar
            </button>
          </div>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Precio</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {plan.price}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Deducible</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {plan.deductible}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Plan Type</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {getRawField(plan.raw, "planType")}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Frecuencia</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {getRawField(plan.raw, "paymentFrequency")}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Resumen del plan
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">ID</p>
                <p className="mt-1 font-medium text-slate-900">{plan.id}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Issue Type</p>
                <p className="mt-1 font-medium text-slate-900">
                  {getRawField(plan.raw, "issueType")}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-sm text-slate-500">Cobertura / detalle</p>
                <p className="mt-1 font-medium text-slate-900">
                  {plan.coverage}
                </p>
              </div>
            </div>
          </div>

          {benefits.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Beneficios / conceptos
              </h3>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-3 py-2 font-medium">Nombre</th>
                      <th className="px-3 py-2 font-medium">Which</th>
                      <th className="px-3 py-2 font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benefits.map((benefit, index) => (
                      <tr
                        key={`${plan.id}-benefit-${index}`}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="px-3 py-3 text-slate-900">
                          {typeof benefit.name === "string" ? benefit.name : "N/A"}
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          {typeof benefit.which === "string"
                            ? benefit.which
                            : "N/A"}
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-900">
                          {typeof benefit.formattedValue === "string"
                            ? benefit.formattedValue
                            : typeof benefit.value === "string" ||
                                typeof benefit.value === "number"
                              ? String(benefit.value)
                              : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <details className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <summary className="cursor-pointer text-sm font-medium text-slate-900">
              Ver JSON completo del plan
            </summary>

            <div className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4">
              <pre className="text-sm leading-6 text-slate-100">
                {JSON.stringify(plan.raw, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
