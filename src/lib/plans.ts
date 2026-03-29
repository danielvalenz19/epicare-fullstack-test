import type {
  JsonObject,
  JsonValue,
  NormalizedApiError,
  NormalizedPlan,
  PlanSearchFormValues,
  PlanSearchPayload,
  SearchPlansApiResponse,
} from "@/types/plans";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toJsonValue(value: unknown): JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toJsonValue);
  }

  if (isRecord(value)) {
    const result: JsonObject = {};
    for (const [key, entry] of Object.entries(value)) {
      result[key] = toJsonValue(entry);
    }
    return result;
  }

  return String(value);
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return "N/A";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const primitiveValues = value.filter(
      (item) =>
        item === null ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean",
    );

    if (primitiveValues.length > 0) {
      return primitiveValues.map(String).join(", ");
    }

    return "Lista disponible";
  }

  return "Disponible";
}

function formatCurrencyValue(value: unknown, currency?: unknown): string {
  if (typeof value !== "number") {
    return formatValue(value);
  }

  const normalizedCurrency =
    typeof currency === "string" && currency.trim() ? currency.trim() : "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

function getNestedRawRecord(
  record: Record<string, unknown>,
): Record<string, unknown> | null {
  const nested = record.raw;
  return isRecord(nested) ? nested : null;
}

function getFirstDefinedValueFromSources(
  sources: Array<Record<string, unknown> | null>,
  keys: string[],
): unknown {
  for (const source of sources) {
    if (!source) {
      continue;
    }

    for (const key of keys) {
      const value = source[key];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
  }

  return undefined;
}

function findBenefitFormattedValue(
  record: Record<string, unknown>,
  possibleNames: string[],
): string | undefined {
  const benefits = record.benefits;

  if (!Array.isArray(benefits)) {
    return undefined;
  }

  for (const benefit of benefits) {
    if (!isRecord(benefit)) {
      continue;
    }

    const name = typeof benefit.name === "string" ? benefit.name : "";
    const which = typeof benefit.which === "string" ? benefit.which : "";

    const matched = possibleNames.some(
      (candidate) =>
        candidate.toLowerCase() === name.toLowerCase() ||
        candidate.toLowerCase() === which.toLowerCase(),
    );

    if (!matched) {
      continue;
    }

    const formattedValue = benefit.formattedValue;
    if (typeof formattedValue === "string" && formattedValue.trim()) {
      return formattedValue;
    }

    const rawValue = benefit.value;
    if (rawValue !== undefined && rawValue !== null && rawValue !== "") {
      return formatValue(rawValue);
    }
  }

  return undefined;
}

function extractPlansArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (!isRecord(raw)) {
    return [];
  }

  const preferredKeys = ["plans", "results", "data", "quotes", "items"];

  for (const key of preferredKeys) {
    const candidate = raw[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  const arrayEntries = Object.values(raw).filter(Array.isArray);

  if (arrayEntries.length > 0) {
    const sorted = [...arrayEntries].sort((a, b) => b.length - a.length);
    return sorted[0];
  }

  return [];
}

function extractErrors(raw: unknown): NormalizedApiError[] {
  if (!isRecord(raw) || !Array.isArray(raw.errors)) {
    return [];
  }

  return raw.errors.map((errorItem) => {
    if (!isRecord(errorItem)) {
      return {
        message: "Error desconocido del proveedor.",
      };
    }

    const normalized: NormalizedApiError = {
      company:
        typeof errorItem.company === "string" ? errorItem.company : undefined,
      code: typeof errorItem.code === "string" ? errorItem.code : undefined,
      message:
        typeof errorItem.message === "string"
          ? errorItem.message
          : "Error desconocido del proveedor.",
    };

    if ("details" in errorItem && errorItem.details !== undefined) {
      normalized.details = toJsonValue(errorItem.details);
    }

    return normalized;
  });
}

function normalizeCoverage(value: unknown): string {
  const formatted = formatValue(value);

  if (formatted.length > 140) {
    return `${formatted.slice(0, 137)}...`;
  }

  return formatted;
}

function normalizePlan(item: unknown, index: number): NormalizedPlan {
  if (!isRecord(item)) {
    return {
      id: `plan-${index + 1}`,
      name: `Plan ${index + 1}`,
      price: "N/A",
      provider: "N/A",
      coverage: "N/A",
      deductible: "N/A",
      metalLevel: "N/A",
      summaryItems: [],
      raw: toJsonValue(item),
    };
  }

  const nestedRaw = getNestedRawRecord(item);
  const sources = [item, nestedRaw];

  const currency = getFirstDefinedValueFromSources(sources, ["currency"]);
  const id = formatValue(
    getFirstDefinedValueFromSources(sources, [
      "id",
      "planId",
      "quoteId",
      "uuid",
      "code",
      "planKey",
    ]),
  );

  const name = formatValue(
    getFirstDefinedValueFromSources(sources, [
      "name",
      "planName",
      "displayName",
      "title",
      "marketingName",
      "plan",
    ]),
  );

  const rawPrice = getFirstDefinedValueFromSources(sources, [
    "insuranceRate",
    "standardTierInsuranceRate",
    "rateExcludingMultiProductDiscounts",
    "monthlyPremium",
    "premium",
    "rate",
    "totalRate",
  ]);

  const price = formatCurrencyValue(rawPrice, currency);

  const provider = formatValue(
    getFirstDefinedValueFromSources(sources, [
      "provider",
      "carrier",
      "company",
      "issuer",
    ]),
  );

  const deductibleFromBenefits =
    (nestedRaw && findBenefitFormattedValue(nestedRaw, ["Ded", "Deductible"])) ||
    undefined;

  const deductible =
    deductibleFromBenefits ??
    formatValue(
      getFirstDefinedValueFromSources(sources, [
        "deductible",
        "individualDeductible",
        "medicalDeductible",
      ]),
    );

  const coverage = normalizeCoverage(
    getFirstDefinedValueFromSources(sources, [
      "coverage",
      "coverageType",
      "coverageName",
      "coverageDetails",
      "benefitDescription",
    ]),
  );

  const metalLevel = formatValue(
    getFirstDefinedValueFromSources(sources, ["metalLevel", "tier", "planTier"]),
  );

  const summaryItems = [
    {
      label: "Proveedor",
      value: provider,
    },
    {
      label: "Plan Type",
      value: formatValue(
        getFirstDefinedValueFromSources(sources, [
          "planType",
          "productType",
          "type",
        ]),
      ),
    },
    {
      label: "Frecuencia",
      value: formatValue(
        getFirstDefinedValueFromSources(sources, [
          "frequency",
          "paymentFrequency",
        ]),
      ),
    },
    {
      label: "Moneda",
      value: formatValue(currency),
    },
    {
      label: "Issue Type",
      value: formatValue(getFirstDefinedValueFromSources(sources, ["issueType"])),
    },
  ].filter((item) => item.value !== "N/A");

  return {
    id: id === "N/A" ? `plan-${index + 1}` : id,
    name: name === "N/A" ? `Plan ${index + 1}` : name,
    price,
    provider,
    coverage,
    deductible,
    metalLevel,
    summaryItems,
    raw: toJsonValue(item),
  };
}

export function buildPlanSearchPayload(
  values: PlanSearchFormValues,
): PlanSearchPayload {
  return {
    company: "allstate",
    providerPayload: {
      allstate: {
        agentId: "159208",
        effectiveDate: values.effectiveDate,
        zipCode: values.zipCode,
        paymentFrequency: values.paymentFrequency,
        applicants: [
          {
            birthDate: values.birthDate,
            gender: values.gender,
            relationshipType: "Primary",
          },
        ],
      },
    },
  };
}

export function normalizePlansResponse(raw: unknown): SearchPlansApiResponse {
  const plansArray = extractPlansArray(raw);
  const normalizedPlans = plansArray.map(normalizePlan);
  const errors = extractErrors(raw);

  return {
    count: normalizedPlans.length,
    plans: normalizedPlans,
    raw: toJsonValue(raw),
    errors,
  };
}
