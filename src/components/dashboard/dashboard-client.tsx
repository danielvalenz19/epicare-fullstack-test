'use client';

import { useState, type FormEvent } from "react";

import {
  defaultPlanSearchValues,
  type JsonValue,
  type NormalizedApiError,
  type NormalizedPlan,
  type PlanSearchFormValues,
  type SearchPlansApiResponse,
} from "@/types/plans";

import { PlanCard } from "./plan-card";
import { PlanDetailModal } from "./plan-detail-modal";
import { PlanSearchForm } from "./plan-search-form";

type DashboardClientProps = {
  userEmail: string;
};

function getReadableProviderError(error: NormalizedApiError): string {
  const details = error.details;

  if (
    details &&
    typeof details === "object" &&
    !Array.isArray(details) &&
    "response" in details
  ) {
    const response = details.response;

    if (
      response &&
      typeof response === "object" &&
      !Array.isArray(response) &&
      "errors" in response
    ) {
      const providerErrors = response.errors;

      if (
        providerErrors &&
        typeof providerErrors === "object" &&
        !Array.isArray(providerErrors)
      ) {
        const firstEntry = Object.entries(providerErrors)[0];
        if (firstEntry) {
          const [, messages] = firstEntry;
          if (Array.isArray(messages) && messages.length > 0) {
            const firstMessage = messages[0];
            if (typeof firstMessage === "string") {
              return firstMessage;
            }
          }
        }
      }
    }
  }

  return error.message || "El proveedor rechazó la solicitud.";
}

export function DashboardClient({ userEmail }: DashboardClientProps) {
  const [formValues, setFormValues] = useState<PlanSearchFormValues>(
    defaultPlanSearchValues,
  );
  const [plans, setPlans] = useState<NormalizedPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<NormalizedPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [rawResponse, setRawResponse] = useState<JsonValue | null>(null);
  const [showAll, setShowAll] = useState(false);

  function handleFieldChange(field: keyof PlanSearchFormValues, value: string) {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");
    setWarningMessage("");
    setHasSearched(true);
    setShowAll(false);

    const today = new Date().toISOString().slice(0, 10);

    if (!formValues.zipCode.trim()) {
      setIsLoading(false);
      setPlans([]);
      setRawResponse(null);
      setErrorMessage("El Zip Code es obligatorio.");
      return;
    }

    if (!formValues.effectiveDate.trim()) {
      setIsLoading(false);
      setPlans([]);
      setRawResponse(null);
      setErrorMessage("La fecha efectiva es obligatoria.");
      return;
    }

    if (!formValues.birthDate.trim()) {
      setIsLoading(false);
      setPlans([]);
      setRawResponse(null);
      setErrorMessage("La fecha de nacimiento es obligatoria.");
      return;
    }

    if (formValues.birthDate >= today) {
      setIsLoading(false);
      setPlans([]);
      setRawResponse(null);
      setErrorMessage("La fecha de nacimiento debe ser anterior a hoy.");
      return;
    }

    try {
      const response = await fetch("/api/plans/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      const data = (await response.json()) as SearchPlansApiResponse & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "No se pudieron consultar los planes.");
      }

      setPlans(data.plans ?? []);
      setRawResponse(data.raw ?? null);

      if (data.errors && data.errors.length > 0) {
        const readableError = getReadableProviderError(data.errors[0]);

        if ((data.plans?.length ?? 0) === 0) {
          setErrorMessage(readableError);
        } else {
          setWarningMessage(readableError);
        }
      }
    } catch (error) {
      setPlans([]);
      setRawResponse(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Ocurrió un error inesperado.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const visiblePlans = showAll ? plans : plans.slice(0, 24);

  let resultLabel = "Todavía no has realizado ninguna búsqueda.";

  if (isLoading) {
    resultLabel = "Consultando planes...";
  } else if (errorMessage) {
    resultLabel = errorMessage;
  } else if (plans.length > 0) {
    resultLabel = `Se encontraron ${plans.length} planes para ${userEmail}.`;
  } else if (hasSearched) {
    resultLabel =
      "La búsqueda se ejecutó, pero no se encontraron planes para esos criterios.";
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Buscador de planes</h2>
        <p className="mt-2 text-sm text-slate-600">
          Completá el formulario y consultá los planes disponibles.
        </p>

        <div className="mt-6">
          <PlanSearchForm
            values={formValues}
            onChange={handleFieldChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Resultados</h2>
          {plans.length > 0 && !isLoading && !errorMessage ? (
            <p className="text-sm text-slate-500">
              Mostrando {visiblePlans.length} de {plans.length} resultados
            </p>
          ) : null}
        </div>

        <p
          className={`mt-2 text-sm ${
            errorMessage ? "text-red-600" : "text-slate-600"
          }`}
        >
          {resultLabel}
        </p>

        {plans.length > 24 && !isLoading && !errorMessage ? (
          <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Se limita la vista inicial para evitar una grilla demasiado cargada.
          </div>
        ) : null}

        {warningMessage ? (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {warningMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Consultando API externa...</p>
          </div>
        ) : null}

        {!isLoading && hasSearched && !errorMessage && plans.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              La búsqueda se ejecutó, pero no se encontraron planes para esos
              criterios.
            </p>
          </div>
        ) : null}

        {!isLoading && visiblePlans.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {visiblePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onViewDetail={setSelectedPlan}
                />
              ))}
            </div>

            {plans.length > 24 ? (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
                >
                  {showAll
                    ? "Mostrar menos"
                    : `Mostrar todos (${plans.length})`}
                </button>
              </div>
            ) : null}
          </>
        ) : null}

        {!isLoading && rawResponse ? (
          <details className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-sm font-medium text-slate-900">
              Ver respuesta cruda normalizada
            </summary>
            <div className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4">
              <pre className="text-sm leading-6 text-slate-100">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>
          </details>
        ) : null}
      </section>

      <PlanDetailModal
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
      />
    </>
  );
}
