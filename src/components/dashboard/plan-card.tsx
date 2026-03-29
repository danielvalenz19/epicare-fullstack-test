import type { NormalizedPlan } from "@/types/plans";

type PlanCardProps = {
  plan: NormalizedPlan;
  onViewDetail: (plan: NormalizedPlan) => void;
};

function getSummaryValue(plan: NormalizedPlan, label: string) {
  return plan.summaryItems.find((item) => item.label === label)?.value ?? "N/A";
}

export function PlanCard({ plan, onViewDetail }: PlanCardProps) {
  const planType = getSummaryValue(plan, "Plan Type");
  const frequency = getSummaryValue(plan, "Frecuencia");

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-bold text-slate-900">
            {plan.name}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{plan.provider}</p>
        </div>

        <div className="shrink-0 rounded-2xl bg-slate-900 px-4 py-2 text-right text-white">
          <p className="text-xs uppercase tracking-wide text-slate-300">
            Precio
          </p>
          <p className="text-lg font-semibold">{plan.price}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {planType !== "N/A" ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {planType}
          </span>
        ) : null}
        {frequency !== "N/A" ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {frequency}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Deducible</p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {plan.deductible}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">ID</p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {plan.id}
          </p>
        </div>

        {plan.coverage !== "N/A" ? (
          <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
            <p className="text-sm text-slate-500">Cobertura / detalle</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {plan.coverage}
            </p>
          </div>
        ) : null}
      </div>

      {plan.summaryItems.length > 0 ? (
        <div className="mt-4 space-y-2 rounded-xl border border-slate-200 p-4">
          {plan.summaryItems.map((item) => (
            <div
              key={`${plan.id}-${item.label}`}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="text-slate-500">{item.label}</span>
              <span className="font-medium text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onViewDetail(plan)}
        className="mt-5 inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
      >
        Ver detalle
      </button>
    </article>
  );
}
