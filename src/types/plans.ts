export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = {
  [key: string]: JsonValue;
};

export interface PlanSearchFormValues {
  zipCode: string;
  effectiveDate: string;
  paymentFrequency: string;
  birthDate: string;
  gender: string;
}

export const defaultPlanSearchValues: PlanSearchFormValues = {
  zipCode: "68510",
  effectiveDate: "2026-05-01",
  paymentFrequency: "Monthly",
  birthDate: "1985-01-15",
  gender: "Male",
};

export interface PlanSearchPayload {
  company: "allstate";
  providerPayload: {
    allstate: {
      agentId: "159208";
      effectiveDate: string;
      zipCode: string;
      paymentFrequency: string;
      applicants: Array<{
        birthDate: string;
        gender: string;
        relationshipType: "Primary";
      }>;
    };
  };
}

export interface NormalizedApiError {
  company?: string;
  code?: string;
  message: string;
  details?: JsonValue;
}

export interface NormalizedPlan {
  id: string;
  name: string;
  price: string;
  provider: string;
  coverage: string;
  deductible: string;
  metalLevel: string;
  summaryItems: Array<{
    label: string;
    value: string;
  }>;
  raw: JsonValue;
}

export interface SearchPlansApiResponse {
  count: number;
  plans: NormalizedPlan[];
  raw: JsonValue;
  errors: NormalizedApiError[];
}
