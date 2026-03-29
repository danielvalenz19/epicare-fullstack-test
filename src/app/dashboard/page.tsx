import { logoutAction } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">
              Sesión iniciada como {user?.email ?? "usuario autenticado"}.
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600 shadow-sm">
          Aquí vamos a montar en la fase 3 el formulario de búsqueda de planes y
          las cards de resultados.
        </section>
      </div>
    </main>
  );
}
