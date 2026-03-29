import { NextResponse } from "next/server";

import { buildPlanSearchPayload, normalizePlansResponse } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import type { PlanSearchFormValues } from "@/types/plans";

function validateBody(body: Partial<PlanSearchFormValues>) {
  const errors: Record<string, string> = {};

  if (!body.zipCode?.trim()) {
    errors.zipCode = "Zip Code es obligatorio.";
  }

  if (!body.effectiveDate?.trim()) {
    errors.effectiveDate = "La fecha efectiva es obligatoria.";
  }

  if (!body.paymentFrequency?.trim()) {
    errors.paymentFrequency = "La frecuencia de pago es obligatoria.";
  }

  if (!body.birthDate?.trim()) {
    errors.birthDate = "La fecha de nacimiento es obligatoria.";
  }

  if (!body.gender?.trim()) {
    errors.gender = "El género es obligatorio.";
  }

  return errors;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
      return NextResponse.json(
        { message: "No autorizado. Iniciá sesión para continuar." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as Partial<PlanSearchFormValues>;
    const validationErrors = validateBody(body);

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        {
          message: "Formulario inválido.",
          fieldErrors: validationErrors,
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.EPICARE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "Falta configurar EPICARE_API_KEY en el servidor." },
        { status: 500 },
      );
    }

    const payload = buildPlanSearchPayload(body as PlanSearchFormValues);

    const upstreamResponse = await fetch(
      "https://epicare-apicenter.onrender.com/api/plans/search",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    const rawText = await upstreamResponse.text();

    let parsedResponse: unknown = rawText;
    try {
      parsedResponse = JSON.parse(rawText);
    } catch {
      // Si no viene JSON, devolvemos el texto crudo.
    }

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          message: "La API externa respondió con error.",
          upstreamStatus: upstreamResponse.status,
          upstreamResponse: parsedResponse,
        },
        { status: upstreamResponse.status },
      );
    }

    const normalized = normalizePlansResponse(parsedResponse);

    return NextResponse.json(normalized, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error interno al consultar los planes.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
